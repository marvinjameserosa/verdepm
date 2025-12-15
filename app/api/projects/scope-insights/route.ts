import { NextResponse } from "next/server";

import { getPostConstructionData } from "@/actions/post-construction";
import { generateScopeEmissionsInsights } from "@/lib/ai";
import { createAdminClient } from "@/lib/supabase/server";
import type { AggregatedPostConstructionData } from "@/types/post-construction";

const formatNumber = (
  value: number,
  options?: Intl.NumberFormatOptions
): string => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
};

const formatOptionalNumber = (value?: number | null): string => {
  if (value === null || value === undefined) {
    return "N/A";
  }
  return formatNumber(value);
};

const scopeDrivers: Record<string, string> = {
  "Scope 1": "equipment usage and onsite fuel consumption",
  "Scope 2": "grid electricity demand",
  "Scope 3": "logistics, procurement, and waste handling",
};

const describeScopePerformance = (
  label: string,
  actual: number,
  target?: number | null
): string => {
  if (target && target > 0) {
    const diff = target - actual;
    const diffText = formatNumber(Math.abs(diff));

    if (diff >= 0) {
      return `${label} emissions are ${diffText} tCO2e below target (${formatNumber(
        actual
      )} vs ${formatNumber(target)}), indicating effective controls.`;
    }

    return `${label} emissions exceed target by ${diffText} tCO2e (${formatNumber(
      actual
    )} vs ${formatNumber(target)}), signalling the need for corrective actions.`;
  }

  if (actual > 0) {
    return `${label} emissions total ${formatNumber(
      actual
    )} tCO2e without a defined benchmark.`;
  }

  return `${label} emissions have not been recorded for this period.`;
};

const buildFallbackInsight = (
  data: AggregatedPostConstructionData,
  projectName?: string | null
): string => {
  const { actuals, targets, trends } = data;
  const statements: string[] = [];

  if (projectName && projectName.trim().length > 0) {
    statements.push(
      `Summary for ${projectName.trim()}:`
    );
  }

  statements.push(
    describeScopePerformance("Scope 1", actuals.scope_one, targets?.scope_one)
  );
  statements.push(
    describeScopePerformance("Scope 2", actuals.scope_two, targets?.scope_two)
  );
  statements.push(
    describeScopePerformance("Scope 3", actuals.scope_three, targets?.scope_three)
  );

  const scopeTotals = [
    { label: "Scope 1", value: actuals.scope_one },
    { label: "Scope 2", value: actuals.scope_two },
    { label: "Scope 3", value: actuals.scope_three },
  ].sort((a, b) => b.value - a.value);

  if (scopeTotals[0]?.value) {
    const driver = scopeDrivers[scopeTotals[0].label];
    statements.push(
      `${scopeTotals[0].label} remains the largest contributor at ${formatNumber(
        scopeTotals[0].value
      )} tCO2e, driven mainly by ${driver}.`
    );
  }

  const latestEntry = trends.at(-1);
  if (latestEntry) {
    statements.push(
      `Latest reporting month ${latestEntry.date} captured ${formatNumber(
        latestEntry.scope_one
      )} / ${formatNumber(latestEntry.scope_two)} / ${formatNumber(
        latestEntry.scope_three
      )} tCO2e across scopes 1, 2, and 3 respectively.`
    );
  }

  if (actuals.trir > 0) {
    statements.push(
      `Safety TRIR stands at ${formatNumber(
        actuals.trir
      )} with ${formatNumber(actuals.total_incidents, {
        maximumFractionDigits: 0,
      })} recorded incidents across ${formatNumber(actuals.total_hours)} hours.`
    );
  }

  return statements.join(" ");
};

export async function POST(req: Request) {
  try {
    const { projectId, projectName } = (await req.json()) as {
      projectId?: unknown;
      projectName?: unknown;
    };

    if (!projectId || typeof projectId !== "string") {
      return NextResponse.json(
        {
          error: "invalid_project",
          message: "Project ID is required.",
        },
        { status: 400 }
      );
    }

    // Always use the canonical name from the database (`project_name`) when available.
    // Client-provided names can be stale or inconsistent.
    const supabaseAdmin = createAdminClient();
    const { data: projectRecord, error: projectError } = await supabaseAdmin
      .from("projects")
      .select("project_name")
      .eq("project_id", projectId)
      .maybeSingle();

    if (projectError) {
      console.error("Failed to fetch project_name for scope insights:", projectError);
    }

    const resolvedProjectName =
      projectRecord?.project_name && String(projectRecord.project_name).trim().length > 0
        ? String(projectRecord.project_name).trim()
        : typeof projectName === "string" && projectName.trim().length > 0
        ? projectName.trim()
        : null;

    const data = await getPostConstructionData(projectId);

    const hasPreconstructionSetup = Boolean(data.targets);
    const hasConstructionLogs =
      data.trends.length > 0 ||
      data.actuals.scope_one > 0 ||
      data.actuals.scope_two > 0 ||
      data.actuals.scope_three > 0;

    if (!hasPreconstructionSetup || !hasConstructionLogs) {
      return NextResponse.json(
        {
          error: "insufficient_data",
          message:
            "No insight available yet. Complete the Pre-Construction and Construction tabs to unlock AI insights.",
        },
        { status: 400 }
      );
    }

    const targetsSection = `Scope Targets (tCO2e):
- Scope 1 Target: ${formatOptionalNumber(data.targets?.scope_one)}
- Scope 2 Target: ${formatOptionalNumber(data.targets?.scope_two)}
- Scope 3 Target: ${formatOptionalNumber(data.targets?.scope_three)}`;

    const actualsSection = `Actual Totals (tCO2e):
- Scope 1: ${formatNumber(data.actuals.scope_one)}
- Scope 2: ${formatNumber(data.actuals.scope_two)}
- Scope 3: ${formatNumber(data.actuals.scope_three)}
Safety TRIR: ${formatNumber(data.actuals.trir)} (Incidents: ${formatNumber(
      data.actuals.total_incidents,
      { maximumFractionDigits: 0 }
    )}, Hours: ${formatNumber(data.actuals.total_hours)})`;

    const trendSnapshot = data.trends
      .slice(-6)
      .map(
        (entry) =>
          `- ${entry.date}: Scope 1 ${formatNumber(
            entry.scope_one
          )} | Scope 2 ${formatNumber(entry.scope_two)} | Scope 3 ${formatNumber(
            entry.scope_three
          )}`
      )
      .join("\n");

    const knowledge = [
      resolvedProjectName ? `Project: ${resolvedProjectName}` : null,
      targetsSection,
      actualsSection,
      "Monthly Trend Snapshot:",
      trendSnapshot || "- No monthly emissions logged yet.",
    ]
      .filter(Boolean)
      .join("\n");

    try {
      const insight = await generateScopeEmissionsInsights(knowledge);
      return NextResponse.json({ insight: insight?.trim() ?? "" });
    } catch (error) {
      console.error("Failed to generate scope emissions insight:", error);

      const rawMessage =
        error instanceof Error
          ? error.message
          : "Unable to generate scope emissions insight.";

      const aiUnavailable = /AI service (configuration error|quota exceeded)/i.test(
        rawMessage
      );

      if (aiUnavailable) {
        const fallback = buildFallbackInsight(data, resolvedProjectName);
        return NextResponse.json({
          insight: fallback,
          warning:
            "AI insights are temporarily unavailable. Showing rule-based summary instead.",
        });
      }

      return NextResponse.json(
        {
          error: "scope_insight_error",
          message: rawMessage,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Scope insights endpoint failed:", error);
    return NextResponse.json(
      {
        error: "scope_insight_error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to generate scope emissions insight.",
      },
      { status: 500 }
    );
  }
}
