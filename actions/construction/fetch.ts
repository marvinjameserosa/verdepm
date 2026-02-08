"use server";

import { createClient } from "@/lib/supabase/server";
import {
  SourcedMaterial,
  EQUIPMENT_EMISSION_FACTOR_KG_PER_LITER,
  TRIR_STANDARD_HOURS,
} from "@/types/construction";

type PreconstructionMaterialRow = {
  id: string;
  material_category: string | null;
  planned_supplier: string | null;
  material_name: string | null;
  warehouse_of_the_supplier: string | null;
  budgeted_cost: number | string | null;
  unit: string | null;
  sustainability_credentials: string | null;
  supplier_vetting_notes: string | null;
  vetting_status: string | null;
  spec_sheet_path: string | null;
};

export async function getSourcingMaterials(
  projectId: string
): Promise<{ data: SourcedMaterial[]; error: string | null }> {
  const supabase = await createClient();

  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      return {
        data: [],
        error: "You must be signed in to view sourcing materials.",
      };
    }

    const userId = authData.user.id;

    const { data: materialsData, error: materialsError } = await supabase
      .from("material")
      .select(
        "id, material_category, supplier, material_name, warehouse, estimated_cost, unit, sustainability_credentials, supplier_vetting_notes, vetting, spec_sheet_path, approval_status, spec_sheet_url, fuel_summary, receipt_url, receipt_path, delivery_distance, vehicle_fuel_efficiency, combustion_emission_factor, delivery_date"
      )
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });

    if (materialsError) {
      throw materialsError;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const materialRows = (materialsData || []) as any[];

    const data = materialRows.map((material) => ({
      id: material.id,
      category: material.material_category ?? "",
      name: material.material_name ?? "",
      supplier: material.supplier ?? "",
      warehouse: material.warehouse ?? undefined,
      cost:
        material.estimated_cost !== null &&
        material.estimated_cost !== undefined
          ? String(material.estimated_cost)
          : "",
      unit: material.unit ?? undefined,
      credentials: material.sustainability_credentials ?? undefined,
      notes: material.supplier_vetting_notes ?? "",
      status: material.vetting ?? "Identified",
      specSheetPath: material.spec_sheet_path ?? undefined,
      approvalStatus: material.approval_status ?? undefined,
      specSheetUrl: material.spec_sheet_url ?? undefined,
      fuelSummary: material.fuel_summary ?? 0,
      deliveryStatus: "Not Delivered",
      receiptUrl: material.receipt_url ?? undefined,
      receiptPath: material.receipt_path ?? undefined,
      deliveryDistance: material.delivery_distance ?? undefined,
      vehicleFuelEfficiency: material.vehicle_fuel_efficiency ?? undefined,
      combustionEmissionFactor: material.combustion_emission_factor ?? undefined,
      deliveryDate: material.delivery_date ? new Date(material.delivery_date) : undefined,
    }));

    return { data, error: null };
  } catch (error) {
    console.error("Failed to load sourcing materials", error);
    return {
      data: [],
      error:
        error instanceof Error
          ? error.message
          : "Failed to load sourcing materials.",
    };
  }
}

export async function getConstructionMetricsHistory(projectId: string) {
  const supabase = await createClient();

  try {
    const { data: dailyLogs, error: dailyError } = await supabase
      .from("daily_log")
      .select("*")
      .eq("project_id", projectId)
      .order("timestamp", { ascending: false });

    if (dailyError) throw dailyError;

    // Map back to expected format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedDailyLogs = (dailyLogs || []).map((log: any) => {
      let fuelConsumptionLiters = null;
      let equipmentUsageTco2e = null;
      let safetyTrir = null;
      let scope1 = null;

      if (typeof log.equipment_emissions === "number") {
        // New format: equipment_emissions is kg CO2e
        equipmentUsageTco2e = log.equipment_emissions;
        fuelConsumptionLiters =
          equipmentUsageTco2e / EQUIPMENT_EMISSION_FACTOR_KG_PER_LITER;
        scope1 = equipmentUsageTco2e;

        if (
          log.number_of_incidents !== null &&
          log.total_employee_hours !== null &&
          log.total_employee_hours > 0
        ) {
          safetyTrir =
            (log.number_of_incidents * TRIR_STANDARD_HOURS) /
            log.total_employee_hours;
        }
      } else if (typeof log.equipment_emissions === "object") {
        // Old format: JSON object
        fuelConsumptionLiters =
          log.equipment_emissions?.fuel_consumption_liters ?? null;
        equipmentUsageTco2e =
          log.equipment_emissions?.equipment_usage_tco2e ?? null;
        safetyTrir = log.equipment_emissions?.safety_trir ?? null;
        scope1 = log.equipment_emissions?.scope1 ?? null;
      }

      return {
        id: log.id,
        log_date: log.timestamp,
        fuel_consumption_liters: fuelConsumptionLiters,
        equipment_usage_tco2e: equipmentUsageTco2e,
        safety_incidents: safetyTrir,
        scope1: scope1,
        incident_count: log.number_of_incidents,
        hours_worked: log.total_employee_hours,
      };
    });

    const { data: monthlyLogs, error: monthlyError } = await supabase
      .from("monthly_logs")
      .select("*")
      .eq("project_id", projectId)
      .order("timestamp", { ascending: false });

    if (monthlyError) throw monthlyError;

    // Map monthly logs to match expected frontend format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedMonthlyLogs = (monthlyLogs || []).map((log: any) => {
      return {
        id: log.id,
        log_month: log.timestamp,
        submitted_on: log.timestamp,
        electricity_usage_kwh: log.electricity_consumption,
        water_consumption_cubic_m: log.water_consumption,
        waste_generated_kg: log.total_waste_mass,
        waste_placeholder: log.total_waste_mass,
        scope3: log.scope_three,
        waste_details: log.waste_details,
      };
    });

    return {
      daily: mappedDailyLogs,
      monthly: mappedMonthlyLogs,
      error: null,
    };
  } catch (error) {
    console.error("Failed to fetch metrics history", error);
    return {
      daily: [],
      monthly: [],
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch metrics history",
    };
  }
}
