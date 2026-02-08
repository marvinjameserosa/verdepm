import type { ExistingFileState } from "@/types/forms";
import type { Project } from "@/types/project";
import type { Step1FormValues } from "@/types/forms";

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

// Simplified project targets structure
export type ProjectTargets = {
  id?: string | null;
  scopeOne: string;    // Logistics + Equipment (tCO2e)
  scopeTwo: string;    // Electricity (tCO2e)
  scopeThree: string;  // Waste + Water (tCO2e)
  trir: string;        // Total Recordable Incident Rate
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

export type DocumentPathMap = ExistingFileState;

export type ColumnCandidateMap = Record<string, string[]>;

export type SectionConfig = {
  table: string;
  candidates: ColumnCandidateMap;
  heuristics?: Record<string, string[]>;
};

export type ColumnMapping = Record<TargetSectionKey, Record<string, string>>;

export type ColumnInfo = {
  name: string;
  lower: string;
};

export type ColumnDescriptor = ColumnInfo & {
  dataType: string;
};

export type PreConstructionPhaseProps = {
  project?: Project;
  onProjectUpdated?: (project: Project) => void;
  step2ReadOnly?: boolean;
  refreshKey?: number;
};

import type { InitialValues } from "@/types/forms";
export type Step1InitialValues = InitialValues;
