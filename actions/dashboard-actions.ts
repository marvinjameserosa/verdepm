"use server";

import { createClient } from "@/lib/supabase/server";

export type DashboardData = {
  month_year: string;
  project_id: string;
  total_scope_1: number;
  equipment_emissions: number;
  electricity_kwh: number;
  water_m3: number;
  waste_kg: number;
  total_scope_2: number;
  total_scope_3: number;
  total_emissions_tco2e: number;
  total_man_hours: number;
  safety_incidents: number;
};

export async function getDashboardData(filters: {
  year?: string;
  projectId?: string;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("analytics_monthly_emissions")
    .select("*")
    .order("month_year", { ascending: true });

  if (filters.year && filters.year !== "all") {
    query = query.like("month_year", `${filters.year}-%`);
  }

  if (filters.projectId && filters.projectId !== "all") {
    query = query.eq("project_id", filters.projectId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching dashboard data:", error);
    throw new Error("Failed to fetch dashboard data");
  }

  return data as DashboardData[];
}
