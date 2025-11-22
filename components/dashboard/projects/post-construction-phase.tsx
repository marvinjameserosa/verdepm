"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertTriangle, Award, TrendingUp } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import type { Project } from "@/types/project";
import {
  EQUIPMENT_EMISSION_FACTOR_KG_PER_LITER,
  TRIR_STANDARD_HOURS,
} from "@/types/construction";

type ConstructionDailyLog = {
  id: string;
  log_date: string;
  fuel_consumption_liters: number | null;
  equipment_usage_tco2e: number | null;
  safety_incidents: number | null;
};

type ConstructionMonthlyLog = {
  id: string;
  log_month: string;
  electricity_usage_kwh: number | null;
  water_consumption_cubic_m: number | null;
  waste_generated_kg: number | null;
  submitted_on: string | null;
};

type ConstructionMaterialLog = {
  id: string;
  material_plan: string;
  actual_supplier: string | null;
  quantity_and_unit: string | null;
  total_cost: number | null;
  delivery_fuel_used_liters: number | null;
  receipt_path: string | null;
  created_at: string;
};

type ProjectTargets = {
  electricity_consumption: number | null;
  equipment_usage: number | null;
  logistics_fuel_consumption: number | null;
  total_waste_mass: number | null;
  total_water_consumed: number | null;
  number_of_incidents: number | null;
};

type PostConstructionPhaseProps = {
  project: Project;
};

export default function PostConstructionPhase({
  project,
}: PostConstructionPhaseProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dailyLogs, setDailyLogs] = useState<ConstructionDailyLog[]>([]);
  const [monthlyLogs, setMonthlyLogs] = useState<ConstructionMonthlyLog[]>([]);
  const [materialLogs, setMaterialLogs] = useState<ConstructionMaterialLog[]>(
    []
  );
  const [projectTargets, setProjectTargets] = useState<ProjectTargets | null>(
    null
  );

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      const dailyPromise = supabase
        .from("daily_log")
        .select(
          "id, timestamp, number_of_incidents, total_employee_hours, equipment_emissions"
        )
        .eq("project_id", project.id)
        .order("timestamp", { ascending: true });

      const monthlyPromise = supabase
        .from("monthly_logs")
        .select(
          "id, timestamp, electricity_consumption, water_consumption, total_waste_mass"
        )
        .eq("project_id", project.id)
        .order("timestamp", { ascending: true });

      const materialPromise = supabase
        .from("construction_material_log")
        .select(
          "id, material_plan, actual_supplier, quantity_and_unit, total_cost, delivery_fuel_used_liters, receipt_path, created_at"
        )
        .eq("project_id", project.id)
        .order("created_at", { ascending: true });

      const targetsPromise = supabase
        .from("project_targets")
        .select("*")
        .eq("project_id", project.id)
        .maybeSingle();

      const [dailyResult, monthlyResult, materialResult, targetsResult] =
        await Promise.all([
          dailyPromise,
          monthlyPromise,
          materialPromise,
          targetsPromise,
        ]);

      if (!isMounted) {
        return;
      }

      if (dailyResult.error) {
        console.error(
          "Failed to load construction daily logs",
          dailyResult.error
        );
        setErrorMessage(
          dailyResult.error.message || "Unable to load daily performance data."
        );
        setDailyLogs([]);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mappedLogs = (dailyResult.data ?? []).map((log: any) => {
          let fuel = null;
          let emissions = null;
          let safety = null;

          if (typeof log.equipment_emissions === "number") {
            emissions = log.equipment_emissions;
            fuel = emissions / EQUIPMENT_EMISSION_FACTOR_KG_PER_LITER;
            if (
              log.number_of_incidents !== null &&
              log.total_employee_hours !== null &&
              log.total_employee_hours > 0
            ) {
              safety =
                (log.number_of_incidents * TRIR_STANDARD_HOURS) /
                log.total_employee_hours;
            }
          } else {
            fuel = log.equipment_emissions?.fuel_consumption_liters ?? null;
            emissions = log.equipment_emissions?.equipment_usage_tco2e ?? null;
            safety = log.equipment_emissions?.safety_trir ?? null;
          }

          return {
            id: log.id,
            log_date: log.timestamp,
            fuel_consumption_liters: fuel,
            equipment_usage_tco2e: emissions,
            safety_incidents: safety,
          };
        });
        setDailyLogs(mappedLogs);
      }

      if (monthlyResult.error) {
        console.error(
          "Failed to load construction monthly logs",
          monthlyResult.error
        );
        setErrorMessage(
          (prev) =>
            prev ??
            monthlyResult.error.message ??
            "Unable to load monthly performance data."
        );
        setMonthlyLogs([]);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mappedMonthly = (monthlyResult.data ?? []).map((log: any) => ({
          id: log.id,
          log_month: log.timestamp,
          electricity_usage_kwh: log.electricity_consumption,
          water_consumption_cubic_m: log.water_consumption,
          waste_generated_kg: log.total_waste_mass,
          submitted_on: log.timestamp,
        }));
        setMonthlyLogs(mappedMonthly);
      }

      if (materialResult.error) {
        console.error(
          "Failed to load construction material logs",
          materialResult.error
        );
        setErrorMessage(
          (prev) =>
            prev ??
            materialResult.error.message ??
            "Unable to load material data."
        );
        setMaterialLogs([]);
      } else {
        setMaterialLogs(materialResult.data ?? []);
      }

      if (targetsResult.error) {
        console.error("Failed to load project targets", targetsResult.error);
      } else if (targetsResult.data) {
        setProjectTargets({
          electricity_consumption: targetsResult.data.electricity_consumption,
          equipment_usage: targetsResult.data.equipment_usage,
          logistics_fuel_consumption:
            targetsResult.data.logistics_fuel_consumption,
          total_waste_mass: targetsResult.data.total_waste_mass,
          total_water_consumed: targetsResult.data.total_water_consumed,
          number_of_incidents: targetsResult.data.number_of_incidents,
        });
      }

      setIsLoading(false);
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [project.id]);

  const totals = useMemo(() => {
    let fuel = 0;
    let electricity = 0;
    let water = 0;
    let equipment = 0;
    let waste = 0;
    let safetyTrirSum = 0;
    let safetyEntries = 0;

    for (const log of dailyLogs) {
      fuel += log.fuel_consumption_liters ?? 0;
      equipment += log.equipment_usage_tco2e ?? 0;
      if (
        typeof log.safety_incidents === "number" &&
        Number.isFinite(log.safety_incidents)
      ) {
        safetyTrirSum += log.safety_incidents;
        safetyEntries += 1;
      }
    }

    for (const log of monthlyLogs) {
      electricity += log.electricity_usage_kwh ?? 0;
      water += log.water_consumption_cubic_m ?? 0;
      waste += log.waste_generated_kg ?? 0;
    }

    const incidents = safetyEntries > 0 ? safetyTrirSum / safetyEntries : 0;

    return { fuel, electricity, water, equipment, waste, incidents };
  }, [dailyLogs, monthlyLogs]);

  const targetTotals = useMemo(
    () => ({
      fuel: projectTargets?.equipment_usage ?? 0,
      logisticsFuel: projectTargets?.logistics_fuel_consumption ?? 0,
      electricity: projectTargets?.electricity_consumption ?? 0,
      water: projectTargets?.total_water_consumed ?? 0,
      waste: projectTargets?.total_waste_mass ?? 0,
      incidents: projectTargets?.number_of_incidents ?? 0,
    }),
    [projectTargets]
  );

  const totalDeliveryFuel = useMemo(() => {
    return materialLogs.reduce(
      (acc, log) => acc + (log.delivery_fuel_used_liters ?? 0),
      0
    );
  }, [materialLogs]);

  const formatNumber = (value: number, digits = 0) =>
    new Intl.NumberFormat(undefined, { maximumFractionDigits: digits }).format(
      value
    );

  const strengths: string[] = [];
  if (totals.fuel <= targetTotals.fuel) {
    strengths.push("Fuel consumption stayed within planned limits.");
  }
  if (totals.electricity <= targetTotals.electricity) {
    strengths.push("Electricity emissions met the project efficiency target.");
  }
  if (totals.waste <= targetTotals.waste) {
    strengths.push("Waste generation remained under the diversion goal.");
  }
  if (totals.incidents === 0) {
    strengths.push(
      "TRIR held at zero recordable incidents across logged days."
    );
  }
  if (strengths.length === 0) {
    strengths.push("Project team maintained consistent reporting cadence.");
  }

  const improvements: string[] = [];
  if (totals.fuel > targetTotals.fuel) {
    improvements.push(
      "Review heavy equipment usage to reduce daily fuel burn."
    );
  }
  if (totals.electricity > targetTotals.electricity) {
    improvements.push(
      "Tune temporary power loads to drive down electricity emissions."
    );
  }
  if (totals.water > targetTotals.water) {
    improvements.push(
      "Expand on-site water reuse to stay within conservation goals."
    );
  }
  if (totals.waste > targetTotals.waste) {
    improvements.push(
      "Increase sorting efficiency to boost landfill diversion."
    );
  }
  if (totals.incidents > 0) {
    improvements.push(
      "Refresh safety toolbox talks to bring the TRIR back down."
    );
  }
  if (improvements.length === 0) {
    improvements.push(
      "Continue monitoring trends to preserve strong performance."
    );
  }

  if (isLoading) {
    return (
      <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
        <CardHeader>
          <CardTitle>Loading post-construction insights…</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Gathering construction logs and material deliveries for{" "}
            {project.name}.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!isLoading && dailyLogs.length === 0 && materialLogs.length === 0) {
    return (
      <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
        <CardHeader>
          <CardTitle>No post-construction data yet</CardTitle>
          <CardDescription>
            Submit at least one construction daily report to unlock the
            analytics view.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const ComparisonCard = ({
    title,
    description,
    target,
    actual,
    unit,
    inverse = false, // if true, higher actual is better (rare for these metrics)
  }: {
    title: string;
    description: string;
    target: number | null;
    actual: number;
    unit: string;
    inverse?: boolean;
  }) => {
    const hasTarget = target !== null && target !== undefined && target > 0;
    const percentage = hasTarget ? (actual / target!) * 100 : 0;

    // For consumption/emissions, lower is better.
    // If actual > target, it's bad (red).
    // If actual <= target, it's good (green).
    const isGood = inverse ? actual >= target! : actual <= target!;

    // Status color logic
    let statusColor = "text-gray-500";
    let progressColor = "bg-gray-200";

    if (hasTarget) {
      if (isGood) {
        statusColor = "text-emerald-600 dark:text-emerald-400";
        progressColor = "bg-emerald-500";
      } else {
        // Check how much over
        const ratio = actual / target!;
        if (ratio > 1.1) {
          statusColor = "text-red-600 dark:text-red-400";
          progressColor = "bg-red-500";
        } else {
          statusColor = "text-amber-600 dark:text-amber-400";
          progressColor = "bg-amber-500";
        }
      }
    }

    return (
      <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950/40 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Actual
                </p>
                <p className="text-2xl font-bold">
                  {formatNumber(actual)}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    {unit}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-muted-foreground">
                  Target
                </p>
                <p className="text-lg font-semibold">
                  {hasTarget ? formatNumber(target!) : "—"}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    {unit}
                  </span>
                </p>
              </div>
            </div>

            {hasTarget && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className={statusColor}>
                    {percentage.toFixed(1)}% of target
                  </span>
                </div>
                <Progress
                  value={Math.min(percentage, 100)}
                  className={`h-2 ${progressColor}`}
                />
              </div>
            )}

            {!hasTarget && (
              <div className="text-xs text-muted-foreground italic">
                No target set
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
          <div className="rounded-lg bg-emerald-100 p-1.5 dark:bg-emerald-900/40">
            <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-lg font-semibold sm:text-xl">
            Post-Construction Assessment
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Compare actual performance against pre-construction targets.
        </p>
      </header>

      {errorMessage && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ComparisonCard
          title="Electricity Usage"
          description="Total electricity consumed vs target."
          target={targetTotals.electricity}
          actual={totals.electricity}
          unit="kWh"
        />

        <ComparisonCard
          title="Equipment Fuel"
          description="Fuel consumed by heavy equipment."
          target={targetTotals.fuel}
          actual={totals.fuel}
          unit="L"
        />

        <ComparisonCard
          title="Logistics Fuel"
          description="Fuel consumed for material delivery."
          target={targetTotals.logisticsFuel}
          actual={totalDeliveryFuel}
          unit="L"
        />

        <ComparisonCard
          title="Waste Generated"
          description="Total waste mass generated."
          target={targetTotals.waste}
          actual={totals.waste}
          unit="kg"
        />

        <ComparisonCard
          title="Water Consumption"
          description="Total water consumed."
          target={targetTotals.water}
          actual={totals.water}
          unit="m³"
        />

        <ComparisonCard
          title="Safety Incidents"
          description="Number of safety incidents recorded."
          target={targetTotals.incidents}
          actual={totals.incidents}
          unit="Incidents"
        />
      </div>

      {/* Additional Insights Section */}
      <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950/40 shadow-sm mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <TrendingUp className="h-5 w-5" />
            Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="font-semibold text-emerald-800 dark:text-emerald-400">
                Strengths
              </h3>
              <ul className="space-y-2">
                {strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-amber-800 dark:text-amber-400">
                Areas for Improvement
              </h3>
              <ul className="space-y-2">
                {improvements.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
