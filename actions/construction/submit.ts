"use server";

import { createClient } from "@/lib/supabase/server";

type DailyLogData = {
  fuelConsumptionLiters: number | null;
  equipmentEmissionsKg: number | null;
  safetyTrirRounded: number | null;
  scope1: number;
  incidentCount: number | null;
  hoursWorked: number | null;
};

type MonthlyLogData = {
  rawElectricityKwh: number;
  rawWaterCubicM: number;
  rawWasteKg: number;
  electricityEmissionsKg: number | null;
  waterEmissionsKg: number | null;
  wasteEmissionsKg: number | null;
  scope2: number | null;
  scope3: number;
};

type SubmitConstructionLogParams = {
  projectId: string;
  date: string;
  metricsPeriod: "daily" | "monthly";
  dailyData?: DailyLogData;
  monthlyData?: MonthlyLogData;
};

export async function submitConstructionLog({
  projectId,
  date,
  metricsPeriod,
  dailyData,
  monthlyData,
}: SubmitConstructionLogParams) {
  const supabase = await createClient();
  const warnings: string[] = [];

  try {
    // --- Daily Log Submission ---
    if (metricsPeriod === "daily" && dailyData) {
      const { data: dailyLog, error: dailyError } = await supabase
        .from("construction_daily_log")
        .insert([
          {
            project_id: projectId,
            log_date: date,
            fuel_consumption_liters: dailyData.fuelConsumptionLiters,
            equipment_usage_tco2e: dailyData.equipmentEmissionsKg,
            safety_incidents: dailyData.safetyTrirRounded,
            scope1: dailyData.scope1,
          },
        ])
        .select("id")
        .single();

      if (dailyError) {
        if ("code" in dailyError && dailyError.code === "23505") {
          throw new Error("A daily report for today already exists.");
        }
        throw dailyError;
      }

      let dailyLogId = dailyLog?.id as string | undefined;

      if (!dailyLogId) {
        const { data: fallback, error: fetchError } = await supabase
          .from("construction_daily_log")
          .select("id")
          .eq("project_id", projectId)
          .eq("log_date", date)
          .maybeSingle();

        if (fetchError) {
          throw fetchError;
        }
        if (!fallback) {
          throw new Error(
            "Daily report saved but could not retrieve identifier."
          );
        }
        dailyLogId = fallback.id;
      }

      if (
        dailyLogId &&
        dailyData.safetyTrirRounded !== null &&
        dailyData.incidentCount !== null &&
        dailyData.hoursWorked !== null
      ) {
        const { error: safetyInsertError } = await supabase
          .from("safety_incidents")
          .insert([
            {
              project_id: projectId,
              daily_log_id: dailyLogId,
              log_date: date,
              incident_count: dailyData.incidentCount,
              total_hours_worked: dailyData.hoursWorked,
              trir: dailyData.safetyTrirRounded,
            },
          ]);

        if (safetyInsertError) {
          console.error("Failed to save safety details", safetyInsertError);
          const message =
            typeof safetyInsertError === "object" &&
            safetyInsertError !== null &&
            "message" in safetyInsertError
              ? String(
                  (safetyInsertError as { message?: string }).message ?? ""
                )
              : "";
          const warningMessage = message
            ? `Safety details were not saved (${message}).`
            : "Safety details were not saved. Please try again later.";
          warnings.push(warningMessage);
        }
      }
    }

    // --- Monthly Log Submission ---
    if (metricsPeriod === "monthly" && monthlyData) {
      const monthStart = new Date(date);
      monthStart.setDate(1);
      const logMonth = monthStart.toISOString().slice(0, 10);

      // Fetch existing placeholder values for this project/month
      let existingElec = 0,
        existingWater = 0,
        existingWaste = 0;
      const { data: existingRow, error: fetchError } = await supabase
        .from("construction_monthly_log")
        .select("elec_placeholder, water_placeholder, waste_placeholder")
        .eq("project_id", projectId)
        .eq("log_month", logMonth)
        .maybeSingle();

      if (!fetchError && existingRow) {
        existingElec = Number(existingRow.elec_placeholder) || 0;
        existingWater = Number(existingRow.water_placeholder) || 0;
        existingWaste = Number(existingRow.waste_placeholder) || 0;
      }

      // Add new values to existing
      const sumElec = monthlyData.rawElectricityKwh + existingElec;
      const sumWater = monthlyData.rawWaterCubicM + existingWater;
      const sumWaste = monthlyData.rawWasteKg + existingWaste;

      // Add placeholder columns for summed values
      const { error: monthlyError } = await supabase
        .from("construction_monthly_log")
        .upsert(
          [
            {
              project_id: projectId,
              log_month: logMonth,
              electricity_usage_kwh: monthlyData.electricityEmissionsKg,
              water_consumption_cubic_m: monthlyData.waterEmissionsKg,
              waste_generated_kg: monthlyData.wasteEmissionsKg,
              elec_placeholder: sumElec,
              water_placeholder: sumWater,
              waste_placeholder: sumWaste,
              scope2: monthlyData.scope2,
              scope3: monthlyData.scope3,
              submitted_on: date,
              updated_at: new Date().toISOString(),
            },
          ],
          { onConflict: "project_id,log_month" }
        );

      if (monthlyError) {
        throw monthlyError;
      }
      
      return { success: true, warnings, sumElec, sumWater, sumWaste };
    }

    return { success: true, warnings };
  } catch (error) {
    console.error("Failed to submit construction log", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to submit report.",
    };
  }
}
