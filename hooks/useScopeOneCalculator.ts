import { useMemo } from "react";

interface ScopeOneInputs {
  // Logistics
  distance?: number;
  efficiency?: number; // L/km
  logisticsFactor?: number; // kg CO2e/L

  // Equipment
  hours?: number;
  rate?: number; // L/hr
  equipmentFactor?: number; // kg CO2e/L
}

interface ScopeOneResult {
  logisticsFuel: number;
  logisticsCo2: number;
  equipmentFuel: number;
  equipmentCo2: number;
  totalScopeOne: number;
}

export function useScopeOneCalculator(inputs: ScopeOneInputs): ScopeOneResult {
  const {
    distance = 0,
    efficiency = 0,
    logisticsFactor = 0,
    hours = 0,
    rate = 0,
    equipmentFactor = 0,
  } = inputs;

  const logisticsFuel = useMemo(() => {
    return distance * efficiency;
  }, [distance, efficiency]);

  const logisticsCo2 = useMemo(() => {
    return logisticsFuel * logisticsFactor;
  }, [logisticsFuel, logisticsFactor]);

  const equipmentFuel = useMemo(() => {
    return hours * rate;
  }, [hours, rate]);

  const equipmentCo2 = useMemo(() => {
    return equipmentFuel * equipmentFactor;
  }, [equipmentFuel, equipmentFactor]);

  const totalScopeOne = useMemo(() => {
    const total = (logisticsCo2 || 0) + (equipmentCo2 || 0);
    return Number.isFinite(total) ? total : 0;
  }, [logisticsCo2, equipmentCo2]);

  return {
    logisticsFuel: Number.isFinite(logisticsFuel) ? logisticsFuel : 0,
    logisticsCo2: Number.isFinite(logisticsCo2) ? logisticsCo2 : 0,
    equipmentFuel: Number.isFinite(equipmentFuel) ? equipmentFuel : 0,
    equipmentCo2: Number.isFinite(equipmentCo2) ? equipmentCo2 : 0,
    totalScopeOne,
  };
}
