"use server";

import { createClient } from "@/lib/supabase/server";
import { TARGET_SECTION_CONFIG } from "@/lib/preconstruction";
import type { TargetSectionKey } from "@/types/preconstruction";

export async function saveTarget(
  section: TargetSectionKey,
  projectId: string,
  payload: any,
  existingId: string | null
) {
  const supabase = await createClient();
  const config = TARGET_SECTION_CONFIG[section];
  const { table } = config;

  const dbPayload = {
    project_id: projectId,
    ...payload,
  };

  if (existingId) {
    const { data, error } = await supabase
      .from(table)
      .update(dbPayload)
      .eq("id", existingId)
      .select("id");

    if (error) throw new Error(error.message);
    if (!data || data.length === 0)
      throw new Error("Target not found or access denied.");
    return existingId;
  } else {
    const { data, error } = await supabase
      .from(table)
      .insert([dbPayload])
      .select("id")
      .single();

    if (error) throw new Error(error.message);
    return data && data.id != null ? String(data.id) : null;
  }
}

export async function saveProjectTarget(
  projectId: string,
  section: TargetSectionKey,
  values: any
) {
  const supabase = await createClient();

  let updates: Record<string, any> = {};

  switch (section) {
    case "electricityUsage":
      updates = {
        electricity_consumption: values.totalElectricityConsumed,
      };
      break;
    case "equipmentUsage":
      updates = {
        equipment_usage: values.totalFuel,
      };
      break;
    case "fuelConsumption":
      updates = {
        logistics_fuel_consumption: values.totalFuel,
      };
      break;
    case "wasteGenerated":
      updates = {
        total_waste_mass: values.totalWasteMass,
        percentage_by_treatment: values.percentByTreatment,
        waste_emission_factor: values.emissionFactor,
      };
      break;
    case "waterSupply":
      updates = {
        total_water_consumed: values.totalWaterConsumed,
        water_emmision_factor: values.waterSupplyEmissionFactor,
      };
      break;
    case "safetyIncident":
      updates = {
        number_of_incidents: values.numberOfIncidents,
        total_employee_hours: values.totalEmployeeHours,
      };
      break;
  }

  const { data: existing } = await supabase
    .from("project_targets")
    .select("id")
    .eq("project_id", projectId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("project_targets")
      .update(updates)
      .eq("id", existing.id);

    if (error) throw new Error(error.message);
    return existing.id;
  } else {
    const { data, error } = await supabase
      .from("project_targets")
      .insert([{ project_id: projectId, ...updates }])
      .select("id")
      .single();

    if (error) throw new Error(error.message);
    return data.id;
  }
}
