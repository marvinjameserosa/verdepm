export type WasteTreatmentMethod =
  | "landfill"
  | "incineration"
  | "recycling"
  | "compost";

export interface WasteEntry {
  id: string;
  mass: string;
  unit: "kg" | "ton";
  wasteType: string;
  treatmentMethod: WasteTreatmentMethod;
  treatmentPercentage: string;
}

export type WasteFormEntry = {
  mass: string;
  unit: "kg" | "ton";
  wasteType: string;
  treatmentMethod: WasteTreatmentMethod | "";
  treatmentPercentage: string;
};

export type WasteEntrySummary = WasteEntry & {
  massKg: number;
  allocatedMassKg: number;
  emissionKg: number;
  percentageValue: number;
};

export type SourcedMaterial = {
  id: string;
  category: string;
  name: string;
  supplier: string;
  cost: string;
  unit?: string;
  notes: string;
  credentials?: string;
  warehouse?: string;
  status: string; // MaterialStatus is imported in original, but string is fine for now or I can import it
  specSheetPath?: string;
  approvalStatus?: string;
  specSheetUrl?: string;
  fuelSummary?: number;
};

export type DailyMetricKey =
  | "distanceKm"
  | "fuelEfficiency"
  | "equipmentHours"
  | "equipmentFuelRate"
  | "incidentCount"
  | "hoursWorked";

export type MonthlyMetricKey = "electricity" | "water";

export type DailyMetricState = Record<DailyMetricKey, string>;
export type MonthlyMetricState = Record<MonthlyMetricKey, string>;

export const WASTE_EMISSION_FACTORS_KG_PER_KG = {
  landfill: 1.8,
  incineration: 2.8,
  recycling: 0.12,
  compost: 0.1,
} as const;

export const EQUIPMENT_EMISSION_FACTOR_KG_PER_LITER = 2.68;
export const TRIR_STANDARD_HOURS = 200_000;
export const PH_GRID_EMISSION_FACTOR_KG_PER_KWH = 0.507;
export const WATER_SUPPLY_EMISSION_FACTOR_KG_PER_CUBIC_M = 0.264;

export const WASTE_TYPE_OPTIONS = [
  "Plastic",
  "Food",
  "Paper",
  "Metal",
  "Glass",
  "Other",
] as const;

export const WASTE_TREATMENT_OPTIONS: {
  value: WasteTreatmentMethod;
  label: string;
}[] = [
  { value: "landfill", label: "Landfill" },
  { value: "incineration", label: "Incineration" },
  { value: "recycling", label: "Recycling" },
  { value: "compost", label: "Compost" },
];
