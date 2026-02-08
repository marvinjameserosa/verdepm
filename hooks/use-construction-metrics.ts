import { useState, useMemo } from "react";
import {
  DailyMetricState,
  MonthlyMetricState,
  EQUIPMENT_EMISSION_FACTOR_KG_PER_LITER,
  TRIR_STANDARD_HOURS,
  PH_GRID_EMISSION_FACTOR_KG_PER_KWH,
  WATER_SUPPLY_EMISSION_FACTOR_KG_PER_CUBIC_M,
} from "@/types/construction";

export function useConstructionMetrics() {
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetricState>({
    distanceKm: "",
    fuelEfficiency: "",
    equipmentHours: "",
    equipmentFuelRate: "",
    incidentCount: "",
    hoursWorked: "",
    emissionFactor: "",
  });

  const [monthlyMetrics, setMonthlyMetrics] = useState<MonthlyMetricState>({
    electricity: "",
    water: "",
  });

  const handleDailyInputChange = (
    metric: keyof DailyMetricState,
    value: string
  ) => {
    setDailyMetrics((prev) => ({ ...prev, [metric]: value }));
  };

  const handleMonthlyInputChange = (
    metric: keyof MonthlyMetricState,
    value: string
  ) => {
    setMonthlyMetrics((prev) => ({ ...prev, [metric]: value }));
  };

  const computedFuelLiters = useMemo(() => {
    if (
      dailyMetrics.distanceKm.trim() === "" ||
      dailyMetrics.fuelEfficiency.trim() === ""
    ) {
      return null;
    }

    const distance = Number(dailyMetrics.distanceKm);
    const efficiency = Number(dailyMetrics.fuelEfficiency);

    if (!Number.isFinite(distance) || !Number.isFinite(efficiency)) {
      return null;
    }

    return distance * efficiency;
  }, [dailyMetrics.distanceKm, dailyMetrics.fuelEfficiency]);

  const computedEquipmentTotals = useMemo(() => {
    if (
      dailyMetrics.equipmentHours.trim() === "" ||
      dailyMetrics.equipmentFuelRate.trim() === ""
    ) {
      return { fuelLiters: null, co2Kg: null } as const;
    }

    const hours = Number(dailyMetrics.equipmentHours);
    const fuelRate = Number(dailyMetrics.equipmentFuelRate);

    if (!Number.isFinite(hours) || !Number.isFinite(fuelRate)) {
      return { fuelLiters: null, co2Kg: null } as const;
    }

    const fuelLiters = hours * fuelRate;
    const co2Kg = fuelLiters * EQUIPMENT_EMISSION_FACTOR_KG_PER_LITER;

    return { fuelLiters, co2Kg } as const;
  }, [dailyMetrics.equipmentFuelRate, dailyMetrics.equipmentHours]);

  const computedSafetyTrir = useMemo(() => {
    if (
      dailyMetrics.incidentCount.trim() === "" ||
      dailyMetrics.hoursWorked.trim() === ""
    ) {
      return null;
    }

    const incidents = Number(dailyMetrics.incidentCount);
    const hours = Number(dailyMetrics.hoursWorked);

    if (!Number.isFinite(incidents) || !Number.isFinite(hours) || hours <= 0) {
      return null;
    }

    return (incidents * TRIR_STANDARD_HOURS) / hours;
  }, [dailyMetrics.hoursWorked, dailyMetrics.incidentCount]);

  const computedMonthlyElectricityEmissions = useMemo(() => {
    if (monthlyMetrics.electricity.trim() === "") {
      return null;
    }

    const kwhValue = Number(monthlyMetrics.electricity);

    if (!Number.isFinite(kwhValue)) {
      return null;
    }

    return kwhValue * PH_GRID_EMISSION_FACTOR_KG_PER_KWH;
  }, [monthlyMetrics.electricity]);

  const computedMonthlyWaterEmissions = useMemo(() => {
    if (monthlyMetrics.water.trim() === "") {
      return null;
    }

    const waterValue = Number(monthlyMetrics.water);

    if (!Number.isFinite(waterValue)) {
      return null;
    }

    return waterValue * WATER_SUPPLY_EMISSION_FACTOR_KG_PER_CUBIC_M;
  }, [monthlyMetrics.water]);

  return {
    dailyMetrics,
    setDailyMetrics,
    monthlyMetrics,
    setMonthlyMetrics,
    handleDailyInputChange,
    handleMonthlyInputChange,
    computedFuelLiters,
    computedEquipmentTotals,
    computedSafetyTrir,
    computedMonthlyElectricityEmissions,
    computedMonthlyWaterEmissions,
  };
}
