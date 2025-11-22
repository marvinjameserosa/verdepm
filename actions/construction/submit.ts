"use server";

import { createClient } from "@/lib/supabase/server";
import {
  EquipmentEntry,
  WasteEntry,
  EQUIPMENT_EMISSION_FACTOR_KG_PER_LITER,
  WASTE_TYPE_SPECIFIC_EMISSION_FACTORS,
  WASTE_EMISSION_FACTORS_KG_PER_KG,
  WasteTreatmentMethod,
} from "@/types/construction";

type DailyLogData = {
  fuelConsumptionLiters: number | null;
  equipmentEmissionsKg: number | null;
  safetyTrirRounded: number | null;
  scope1: number;
  incidentCount: number | null;
  hoursWorked: number | null;
  equipmentList: EquipmentEntry[];
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
  wasteEntries: WasteEntry[];
};

type SubmitConstructionLogParams = {
  projectId: string;
  date: string;
  metricsPeriod: "daily" | "monthly";
  dailyData?: DailyLogData;
  monthlyData?: MonthlyLogData;
};

export async function submitDailyLog({
  projectId,
  date,
  dailyData,
}: {
  projectId: string;
  date: string;
  dailyData: DailyLogData;
}) {
  const supabase = await createClient();
  const warnings: string[] = [];

  try {
    // Calculate total fuel consumption (liters) = Total Hours * Fuel Rate
    const totalFuel = dailyData.equipmentList.reduce((acc, vehicle) => {
      const hours = parseFloat(vehicle.hours) || 0;
      const rate = parseFloat(vehicle.fuelRate) || 0;
      return acc + hours * rate;
    }, 0);

    // Calculate total emissions (kg CO2e)
    const totalEmissions = totalFuel * EQUIPMENT_EMISSION_FACTOR_KG_PER_LITER;

    const { data: dailyLog, error: dailyError } = await supabase
      .from("daily_log")
      .insert([
        {
          project_id: projectId,
          timestamp: date,
          number_of_incidents: dailyData.incidentCount,
          total_employee_hours: dailyData.hoursWorked,
          equipment_emissions: totalEmissions,
          equipment_details: dailyData.equipmentList,
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

    return { success: true, warnings };
  } catch (error) {
    return handleError(error);
  }
}

export async function submitMonthlyLog({
  projectId,
  date,
  monthlyData,
}: {
  projectId: string;
  date: string;
  monthlyData: MonthlyLogData;
}) {
  const supabase = await createClient();
  const warnings: string[] = [];

  try {
    // Calculate Scope 3 (Water + Waste)
    const waterEmissions = monthlyData.waterEmissionsKg ?? 0;
    const wasteEmissions = monthlyData.wasteEmissionsKg ?? 0;
    const scope3 = waterEmissions + wasteEmissions;

    // Calculate weighted average for waste emission factor and treatment percentage
    let totalWasteMass = 0;
    let weightedEmissionFactorSum = 0;
    let weightedTreatmentPercentageSum = 0;

    monthlyData.wasteEntries.forEach((entry) => {
      const mass = parseFloat(entry.mass) || 0;
      const massKg = entry.unit === "ton" ? mass * 1000 : mass;
      const percentage = parseFloat(entry.treatmentPercentage) || 0;

      // Determine emission factor
      let factor = 0;
      const typeFactors = WASTE_TYPE_SPECIFIC_EMISSION_FACTORS[entry.wasteType];
      if (
        typeFactors &&
        typeFactors[entry.treatmentMethod as WasteTreatmentMethod] !== undefined
      ) {
        factor = typeFactors[entry.treatmentMethod as WasteTreatmentMethod]!;
      } else {
        factor =
          WASTE_EMISSION_FACTORS_KG_PER_KG[
            entry.treatmentMethod as WasteTreatmentMethod
          ] || 0;
      }

      totalWasteMass += massKg;
      weightedEmissionFactorSum += factor * massKg;
      weightedTreatmentPercentageSum += percentage * massKg;
    });

    const avgEmissionFactor =
      totalWasteMass > 0 ? weightedEmissionFactorSum / totalWasteMass : 0;
    const avgTreatmentPercentage =
      totalWasteMass > 0 ? weightedTreatmentPercentageSum / totalWasteMass : 0;

    const { error: monthlyError } = await supabase
      .from("monthly_logs")
      .insert([
        {
          project_id: projectId,
          electricity_consumption: monthlyData.rawElectricityKwh,
          water_consumption: monthlyData.rawWaterCubicM,
          total_waste_mass: monthlyData.rawWasteKg,
          treatment_percentage: avgTreatmentPercentage,
          waste_emission_factor: avgEmissionFactor,
          timestamp: date,
          waste_details: monthlyData.wasteEntries,
          scope_two: monthlyData.electricityEmissionsKg ?? 0,
          water_emmision: waterEmissions,
          waste_emmision: wasteEmissions,
          scope_three: scope3,
        },
      ])
      .select("id")
      .single();

    if (monthlyError) {
      throw monthlyError;
    }

    return {
      success: true,
      warnings,
      sumElec: monthlyData.rawElectricityKwh,
      sumWater: monthlyData.rawWaterCubicM,
      sumWaste: monthlyData.rawWasteKg,
    };
  } catch (error) {
    return handleError(error);
  }
}

function handleError(error: unknown) {
  console.error("Failed to submit construction log", error);
  let errorMessage = "Unable to submit report.";
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === "object" && error !== null) {
    // Handle Supabase error objects or other objects
    if ("message" in error) {
      errorMessage = String((error as any).message);
    } else if ("code" in error && "details" in error) {
      errorMessage = `Database Error: ${(error as any).details} (Code: ${
        (error as any).code
      })`;
    } else {
      errorMessage = JSON.stringify(error);
    }
  } else if (typeof error === "string") {
    errorMessage = error;
  }

  return {
    success: false,
    error: errorMessage,
  };
}

// Keep the original function for backward compatibility if needed, or remove it.
// I will remove it as per request to split.
