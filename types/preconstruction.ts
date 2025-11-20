export type TargetSectionKey =
  | "electricityUsage"
  | "equipmentUsage"
  | "fuelConsumption"
  | "wasteGenerated"
  | "waterSupply"
  | "safetyIncident";

export type BaseTargetRecord = {
  id: string | null;
  timeframe: string | null;
  date: string;
};

export type ElectricityUsageTarget = BaseTargetRecord & {
  totalElectricityConsumed: string;
};

export type EquipmentUsageTarget = BaseTargetRecord & {
  equipmentOperationLogs: string;
  fuelRate: string;
  totalFuel: string;
  combustionEmissionFactor: string;
};

export type FuelConsumptionTarget = BaseTargetRecord & {
  totalDistance: string;
  fuelEfficiency: string;
  totalFuel: string;
  fuelEmissionFactor: string;
};

export type WasteGeneratedTarget = BaseTargetRecord & {
  totalWasteMass: string;
  percentByTreatment: string;
  emissionFactor: string;
};

export type WaterSupplyTarget = BaseTargetRecord & {
  totalWaterConsumed: string;
  waterSupplyEmissionFactor: string;
};

export type SafetyIncidentTarget = BaseTargetRecord & {
  numberOfIncidents: string;
  totalEmployeeHours: string;
};

export type ProjectEsgTargets = {
  electricityUsage: ElectricityUsageTarget | null;
  equipmentUsage: EquipmentUsageTarget | null;
  fuelConsumption: FuelConsumptionTarget | null;
  wasteGenerated: WasteGeneratedTarget | null;
  waterSupply: WaterSupplyTarget | null;
  safetyIncident: SafetyIncidentTarget | null;
};

export type TargetSectionValuesMap = {
  electricityUsage: ElectricityUsageTarget;
  equipmentUsage: EquipmentUsageTarget;
  fuelConsumption: FuelConsumptionTarget;
  wasteGenerated: WasteGeneratedTarget;
  waterSupply: WaterSupplyTarget;
  safetyIncident: SafetyIncidentTarget;
};
