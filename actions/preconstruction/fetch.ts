"use server";

import { createClient } from "@/lib/supabase/server";
import { TARGET_SECTION_CONFIG } from "@/lib/preconstruction";
import type { TargetSectionKey, SectionConfig } from "@/types/preconstruction";
import { mapProjectFromSupabase } from "@/components/dashboard/projects/project-helpers";

export async function getTargetColumnMetadata() {
  const supabase = await createClient();
  const results: Record<string, Record<string, string>> = {};

  await Promise.all(
    (
      Object.entries(TARGET_SECTION_CONFIG) as Array<
        [TargetSectionKey, SectionConfig]
      >
    ).map(async ([_, config]) => {
      const { data, error } = await supabase
        .from("information_schema.columns")
        .select("column_name,data_type")
        .eq("table_schema", "public")
        .eq("table_name", config.table);

      if (error || !data) {
        console.warn(
          `Unable to load column metadata for ${config.table}`,
          error
        );
        return;
      }

      results[config.table] = Object.fromEntries(
        data.map((row: any) => [
          String(row.column_name),
          row.data_type ? String(row.data_type) : "",
        ])
      );
    })
  );

  return results;
}

export async function getPreconstructionData(projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      user: null,
      setup: null,
      materials: [],
      targets: null,
      project: null,
    };
  }

  const { data: projectData, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("project_id", projectId)
    .single();

  const project = projectData ? mapProjectFromSupabase(projectData) : null;

  let materials: any[] = [];
  if (projectId) {
    const { data: materialRows, error: materialsError } = await supabase
      .from("material")
      .select(
        "id, material_category, supplier, material_name, warehouse, estimated_cost, unit, sustainability_credentials, supplier_vetting_notes, spec_sheet_path, spec_sheet_url, vetting_status"
      )
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });

    if (!materialsError && materialRows) {
      materials = materialRows;
    }
  }

  // Fetch targets
  const { data: pt } = await supabase
    .from("project_targets")
    .select("*")
    .eq("project_id", projectId)
    .maybeSingle();

  const targetsData = {
    electricityUsage: pt
      ? {
          id: pt.id,
          timeframe: null,
          date: "",
          totalElectricityConsumed:
            pt.electricity_consumption?.toString() ?? "",
        }
      : null,
    equipmentUsage: pt
      ? {
          id: pt.id,
          timeframe: null,
          date: "",
          equipmentOperationLogs: "",
          fuelRate: "",
          totalFuel: pt.equipment_usage?.toString() ?? "",
          combustionEmissionFactor: "",
        }
      : null,
    fuelConsumption: pt
      ? {
          id: pt.id,
          timeframe: null,
          date: "",
          totalDistance: "",
          fuelEfficiency: "",
          totalFuel: pt.logistics_fuel_consumption?.toString() ?? "",
          fuelEmissionFactor: "",
        }
      : null,
    wasteGenerated: pt
      ? {
          id: pt.id,
          timeframe: null,
          date: "",
          totalWasteMass: pt.total_waste_mass?.toString() ?? "",
          percentByTreatment: pt.percentage_by_treatment?.toString() ?? "",
          emissionFactor: pt.waste_emission_factor?.toString() ?? "",
        }
      : null,
    waterSupply: pt
      ? {
          id: pt.id,
          timeframe: null,
          date: "",
          totalWaterConsumed: pt.total_water_consumed?.toString() ?? "",
          waterSupplyEmissionFactor: pt.water_emmision_factor?.toString() ?? "",
        }
      : null,
    safetyIncident: pt
      ? {
          id: pt.id,
          timeframe: null,
          date: "",
          numberOfIncidents: pt.number_of_incidents?.toString() ?? "",
          totalEmployeeHours: pt.total_employee_hours?.toString() ?? "",
        }
      : null,
  };

  return {
    user,
    setup: null,
    materials: materials || [],
    targets: targetsData,
    project,
  };
}

export async function getReviewPlansData(projectId: string) {
  const data = await getPreconstructionData(projectId);

  const materials = data.materials.map((m: any) => ({
    id: m.id,
    category: m.material_category,
    name: m.material_name,
    supplier: m.supplier,
    cost: m.estimated_cost?.toString() ?? "",
    unit: m.unit,
    notes: m.supplier_vetting_notes,
    credentials: m.sustainability_credentials,
    warehouse: m.warehouse,
    specSheetPath: m.spec_sheet_path,
    specSheetUrl: m.spec_sheet_url,
    status: m.vetting_status,
  }));

  return {
    materials,
    targets: data.targets,
  };
}
