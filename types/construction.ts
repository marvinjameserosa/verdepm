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

export type EquipmentEntry = {
  id: string;
  name: string;
  hours: string;
  fuelRate: string;
};

export type VehicleEntry = {
  id: string;
  name: string;
  fuelRate: string;
  distance: string;
};

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
  emissionFactor: number;
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
  deliveryStatus?: string;
  receiptUrl?: string;
  receiptPath?: string;
  deliveryDistance?: number;
  vehicleFuelEfficiency?: number;
  combustionEmissionFactor?: number;
  deliveryDate?: Date;
};

export interface DailyLog {
  id: string;
  project_id: string;
  date: Date;
  equipment_details: EquipmentEntry[];
  equipment_fuel_consumed: number;
  scope_one: number;
}

export type DailyMetricKey =
  | "distanceKm"
  | "fuelEfficiency"
  | "equipmentHours"
  | "equipmentFuelRate"
  | "incidentCount"
  | "hoursWorked"
  | "emissionFactor";

export type MonthlyMetricKey = "electricity" | "water";

export type DailyMetricState = Record<DailyMetricKey, string>;
export type MonthlyMetricState = Record<MonthlyMetricKey, string>;

export const WASTE_EMISSION_FACTORS_KG_PER_KG = {
  landfill: 1.8,
  incineration: 2.8,
  recycling: 0.12,
  compost: 0.1,
} as const;

// Approximate factors based on UK Gov GHG Conversion Factors 2023 (kg CO2e per kg)
// These should be updated with specific local factors if available.
export const WASTE_TYPE_SPECIFIC_EMISSION_FACTORS: Record<
  string,
  Partial<Record<WasteTreatmentMethod, number>>
> = {
  Plastic: {
    landfill: 0.029,
    incineration: 2.53,
    recycling: 0.021,
    compost: 0, // N/A
  },
  Food: {
    landfill: 0.626,
    incineration: 0.02, // Assuming energy recovery or biogenic
    recycling: 0, // N/A
    compost: 0.01,
  },
  Paper: {
    landfill: 1.04,
    incineration: 0.021,
    recycling: 0.021,
    compost: 0.01,
  },
  Metal: {
    landfill: 0.022,
    incineration: 0.021,
    recycling: 0.021,
    compost: 0,
  },
  Glass: {
    landfill: 0.022,
    incineration: 0.021,
    recycling: 0.021,
    compost: 0,
  },
  // "Other" will fall back to the generic WASTE_EMISSION_FACTORS_KG_PER_KG
};

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
