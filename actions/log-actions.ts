"use server";

import { createClient } from "@/lib/supabase/server";
import { EquipmentEntry } from "@/types/construction";

export async function upsertDailyLog(
  projectId: string,
  date: Date,
  data: {
    equipment_details: EquipmentEntry[];
    equipment_fuel_consumed: number;
    scope_one: number;
    incident_count?: number | null;
    hours_worked?: number | null;
  }
) {
  const supabase = await createClient();

  try {
    // Check if log exists for this date and project
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: existingLogs, error: fetchError } = await supabase
      .from("daily_logs")
      .select("id")
      .eq("project_id", projectId)
      .gte("date", startOfDay.toISOString())
      .lte("date", endOfDay.toISOString());

    if (fetchError) throw fetchError;

    if (existingLogs && existingLogs.length > 0) {
      // Update
      const logId = existingLogs[0].id;
      const { error: updateError } = await supabase
        .from("daily_logs")
        .update({
          equipment_details: data.equipment_details,
          equipment_fuel_consumed: data.equipment_fuel_consumed,
          scope_one: data.scope_one,
          number_of_incidents: data.incident_count,
          total_employee_hours: data.hours_worked,
        })
        .eq("id", logId);

      if (updateError) throw updateError;
    } else {
      // Insert
      const { error: insertError } = await supabase
        .from("daily_logs")
        .insert({
          project_id: projectId,
          date: date.toISOString(),
          equipment_details: data.equipment_details,
          equipment_fuel_consumed: data.equipment_fuel_consumed,
          scope_one: data.scope_one,
          number_of_incidents: data.incident_count,
          total_employee_hours: data.hours_worked,
        });

      if (insertError) throw insertError;
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Failed to upsert daily log", error);
    let errorMessage = "Failed to upsert daily log";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
}
