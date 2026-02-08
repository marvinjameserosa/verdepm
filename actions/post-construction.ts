"use server";

import { createClient } from "@/lib/supabase/server";
import {
  AggregatedPostConstructionData,
  DailyLogEntry,
  MonthlyLogEntry,
  PostConstructionTarget,
} from "@/types/post-construction";

export async function getPostConstructionData(
  projectId: string
): Promise<AggregatedPostConstructionData> {
  const supabase = await createClient();

  // Fetch Targets
  const { data: targetsData, error: targetsError } = await supabase
    .from("project_targets")
    .select("*")
    .eq("project_id", projectId)
    .maybeSingle();

  if (targetsError) {
    console.error("Error fetching project targets:", targetsError);
  }

  const targets: PostConstructionTarget | null = targetsData;

  // Fetch Daily Logs (Scope 1 & TRIR)
  const { data: dailyLogsData, error: dailyLogsError } = await supabase
    .from("daily_logs")
    .select(
      "id, project_id, timestamp, number_of_incidents, total_employee_hours, equipment_emissions"
    )
    .eq("project_id", projectId)
    .order("timestamp", { ascending: true });

  if (dailyLogsError) {
    console.error("Error fetching daily logs:", dailyLogsError);
  }

  const dailyLogs: DailyLogEntry[] = dailyLogsData || [];

  // Fetch Monthly Logs (Scope 2 & Scope 3)
  const { data: monthlyLogsData, error: monthlyLogsError } = await supabase
    .from("monthly_logs")
    .select(
      "id, project_id, timestamp, scope_two, scope_three, electricity_consumption, water_consumption, total_waste_mass"
    )
    .eq("project_id", projectId)
    .order("timestamp", { ascending: true });

  if (monthlyLogsError) {
    console.error("Error fetching monthly logs:", monthlyLogsError);
  }

  const monthlyLogs: MonthlyLogEntry[] = monthlyLogsData || [];

  // Aggregate Data
  let totalScopeOne = 0;
  let totalScopeTwo = 0;
  let totalScopeThree = 0;
  let totalIncidents = 0;
  let totalHours = 0;

  // Process Daily Logs
  dailyLogs.forEach((log) => {
    totalScopeOne += log.equipment_emissions || 0;
    totalIncidents += log.number_of_incidents || 0;
    totalHours += log.total_employee_hours || 0;
  });

  // Process Monthly Logs
  monthlyLogs.forEach((log) => {
    totalScopeTwo += log.scope_two || 0;
    totalScopeThree += log.scope_three || 0;
  });

  // Calculate TRIR
  // Formula: (Number of Incidents * 200,000) / Total Employee Hours
  const trir =
    totalHours > 0 ? (totalIncidents * 200000) / totalHours : 0;

  // Prepare Trends Data
  // We will combine daily and monthly data into a unified timeline if possible,
  // or just return them as is. For simplicity, let's group by month.
  const trendsMap = new Map<
    string,
    { scope_one: number; scope_two: number; scope_three: number }
  >();

  dailyLogs.forEach((log) => {
    const date = new Date(log.timestamp);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    if (!trendsMap.has(monthKey)) {
      trendsMap.set(monthKey, { scope_one: 0, scope_two: 0, scope_three: 0 });
    }
    const entry = trendsMap.get(monthKey)!;
    entry.scope_one += log.equipment_emissions || 0;
  });

  monthlyLogs.forEach((log) => {
    const date = new Date(log.timestamp);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    if (!trendsMap.has(monthKey)) {
      trendsMap.set(monthKey, { scope_one: 0, scope_two: 0, scope_three: 0 });
    }
    const entry = trendsMap.get(monthKey)!;
    entry.scope_two += log.scope_two || 0;
    entry.scope_three += log.scope_three || 0;
  });

  const trends = Array.from(trendsMap.entries())
    .map(([date, values]) => ({
      date,
      ...values,
      target_scope_one: targets?.scope_one || undefined,
      target_scope_two: targets?.scope_two || undefined,
      target_scope_three: targets?.scope_three || undefined,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    targets,
    actuals: {
      scope_one: totalScopeOne,
      scope_two: totalScopeTwo,
      scope_three: totalScopeThree,
      trir,
      total_incidents: totalIncidents,
      total_hours: totalHours,
    },
    trends,
  };
}
