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
      .from("preconstruction_material")
      .select(
        "id, material_category, planned_supplier, material_name, warehouse_of_the_supplier, budgeted_cost, unit, sustainability_credentials, supplier_vetting_notes, spec_sheet_path, vetting_status"
      )
      .eq("project_setup_id", projectId)
      .order("created_at", { ascending: true });

    if (!materialsError && materialRows) {
      materials = materialRows;
    }
  }

  // Fetch targets
  const [
    electricityResponse,
    equipmentResponse,
    fuelResponse,
    wasteResponse,
    waterResponse,
    safetyResponse,
  ] = await Promise.all([
    supabase
      .from("dim_electricity_usage_target")
      .select("*")
      .eq("project_id", projectId)
      .limit(1)
      .maybeSingle(),
    supabase
      .from("dim_equipment_usage_target")
      .select("*")
      .eq("project_id", projectId)
      .limit(1)
      .maybeSingle(),
    supabase
      .from("dim_fuel_consumption_target")
      .select("*")
      .eq("project_id", projectId)
      .limit(1)
      .maybeSingle(),
    supabase
      .from("dim_waste_generated_target")
      .select("*")
      .eq("project_id", projectId)
      .limit(1)
      .maybeSingle(),
    supabase
      .from("dim_water_supply_target")
      .select("*")
      .eq("project_id", projectId)
      .limit(1)
      .maybeSingle(),
    supabase
      .from("projects_safety_incident_targets")
      .select("*")
      .eq("project_id", projectId)
      .limit(1)
      .maybeSingle(),
  ]);

  const targetsData = {
    electricityUsage: electricityResponse.data,
    equipmentUsage: equipmentResponse.data,
    fuelConsumption: fuelResponse.data,
    wasteGenerated: wasteResponse.data,
    waterSupply: waterResponse.data,
    safetyIncident: safetyResponse.data,
  };

  return {
    user,
    setup: null,
    materials: materials || [],
    targets: targetsData,
    project,
  };
}
