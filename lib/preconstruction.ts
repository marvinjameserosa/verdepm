import type {
  ColumnCandidateMap,
  ColumnInfo,
  ColumnMapping,
  DocumentPathMap,
  ProjectEsgTargets,
  SectionConfig,
  TargetSectionKey,
} from "@/types/preconstruction";
import type { InitialValues } from "@/types/forms";
import type { Project } from "@/types/project";

export const createEmptyTargets = (): ProjectEsgTargets => ({
  electricityUsage: null,
  equipmentUsage: null,
  fuelConsumption: null,
  wasteGenerated: null,
  waterSupply: null,
  safetyIncident: null,
});

export const TIMEFRAME_COLUMN_CANDIDATES = [
  "target_timeframe",
  "targetTimeframe",
  "timeframe_label",
  "timeframe_text",
  "timeframe_display",
  "time_frame",
  "reporting_period",
  "target_period",
  "timeframe",
  "timeframe_id",
  "target_timeframe_id",
];

export const DATE_COLUMN_CANDIDATES = [
  "date",
  "target_date",
  "targetDate",
  "target_deadline",
  "deadline",
];

export const ELECTRICITY_TOTAL_CONSUMPTION_CANDIDATES = [
  "total_electricity_consumed",
  "total_electricity_consumption",
  "total_electricity_usage",
  "total_electricity_usage_kwh",
  "electricity_consumption",
  "electricity_consumption_kwh",
  "electricity_usage",
  "totalElectricityConsumed",
  "totalElectricityConsumption",
  "electricityConsumption",
  "electricityUsage",
];

export const EQUIPMENT_OPERATION_LOGS_CANDIDATES = [
  "equipment_operation_logs",
  "operation_logs",
  "equipment_logs",
  "operation_notes",
  "equipmentOperationLogs",
];

export const EQUIPMENT_FUEL_RATE_CANDIDATES = [
  "fuel_rate",
  "fuel_rate_lph",
  "fuel_rate_liters_per_hour",
  "fuel_rate_liters_hour",
  "fuelRate",
  "fuel_rate_value",
];

export const EQUIPMENT_TOTAL_FUEL_CANDIDATES = [
  "total_fuel",
  "total_fuel_liters",
  "fuel_consumed_total",
  "fuel_consumed",
  "totalFuel",
];

export const EQUIPMENT_COMBUSTION_FACTOR_CANDIDATES = [
  "combustion_emission_factor",
  "combustion_factor",
  "emission_factor",
  "combustionEmissionFactor",
  "emission_factor_combustion",
];

export const FUEL_TOTAL_DISTANCE_CANDIDATES = [
  "total_distance",
  "distance_travelled",
  "distance_traveled",
  "total_distance_km",
  "distance_km",
  "distance",
  "route_distance",
  "totalDistance",
];

export const FUEL_EFFICIENCY_CANDIDATES = [
  "fuel_efficiency",
  "fuel_efficiency_km_per_l",
  "fuel_efficiency_kmpl",
  "efficiency_km_per_liter",
  "fuel_efficiency_km_l",
  "fuelEfficiency",
  "km_per_liter",
];

export const FUEL_TOTAL_FUEL_CANDIDATES = [
  "total_fuel",
  "total_fuel_used",
  "fuel_used",
  "fuel_consumed",
  "fuel_consumption_total",
  "totalFuel",
];

export const FUEL_EMISSION_FACTOR_CANDIDATES = [
  "fuel_emission_factor",
  "fuel_emission_factor_value",
  "fuel_emission_factor_l",
  "emission_factor_fuel",
  "fuelEmissionFactor",
];

export const WASTE_TOTAL_MASS_CANDIDATES = [
  "total_waste_mass",
  "total_waste_generated",
  "waste_mass",
  "waste_generated_mass",
  "waste_mass_kg",
  "totalWasteMass",
];

export const WASTE_PERCENT_TREATMENT_CANDIDATES = [
  "percent_by_treatment",
  "treatment_percentage",
  "treatment_percent",
  "percent_treatment",
  "percent_by_method",
  "percentByTreatment",
];

export const WASTE_EMISSION_FACTOR_CANDIDATES = [
  "emission_factor",
  "waste_emission_factor",
  "emission_factor_waste",
  "emissionFactor",
];

export const WATER_TOTAL_CONSUMPTION_CANDIDATES = [
  "total_water_consumed",
  "water_consumption_total",
  "total_water_usage",
  "water_used_total",
  "water_consumption",
  "totalWaterConsumed",
  "water_used",
];

export const WATER_EMISSION_FACTOR_CANDIDATES = [
  "water_supply_emission_factor",
  "supply_emission_factor",
  "water_emission_factor",
  "emission_factor_water_supply",
  "waterSupplyEmissionFactor",
];

export const SAFETY_INCIDENT_COUNT_CANDIDATES = [
  "number_of_incidents",
  "incident_count",
  "total_incidents",
  "incidents_total",
  "incidentNumber",
  "numberOfIncidents",
];

export const SAFETY_EMPLOYEE_HOURS_CANDIDATES = [
  "total_employee_hours",
  "employee_hours_total",
  "hours_worked_total",
  "total_hours_worked",
  "employee_hours",
  "totalEmployeeHours",
];

export const FIXED_EMISSION_FACTOR = 2.68;
export const FIXED_EMISSION_FACTOR_STRING = FIXED_EMISSION_FACTOR.toString();

export const TARGET_SECTION_CONFIG: Record<TargetSectionKey, SectionConfig> = {
  electricityUsage: {
    table: "dim_electricity_usage_target",
    candidates: {
      timeframe: TIMEFRAME_COLUMN_CANDIDATES,
      date: DATE_COLUMN_CANDIDATES,
      totalElectricityConsumed: ELECTRICITY_TOTAL_CONSUMPTION_CANDIDATES,
    },
    heuristics: {
      timeframe: ["time", "frame"],
      totalElectricityConsumed: ["electricity", "consum"],
    },
  },
  equipmentUsage: {
    table: "dim_equipment_usage_target",
    candidates: {
      timeframe: TIMEFRAME_COLUMN_CANDIDATES,
      date: DATE_COLUMN_CANDIDATES,
      equipmentOperationLogs: EQUIPMENT_OPERATION_LOGS_CANDIDATES,
      fuelRate: EQUIPMENT_FUEL_RATE_CANDIDATES,
      totalFuel: EQUIPMENT_TOTAL_FUEL_CANDIDATES,
      combustionEmissionFactor: EQUIPMENT_COMBUSTION_FACTOR_CANDIDATES,
    },
    heuristics: {
      timeframe: ["time", "frame"],
      equipmentOperationLogs: ["operation", "log"],
      fuelRate: ["fuel", "rate"],
      totalFuel: ["fuel", "total"],
      combustionEmissionFactor: ["emission", "factor"],
    },
  },
  fuelConsumption: {
    table: "dim_fuel_consumption_target",
    candidates: {
      timeframe: TIMEFRAME_COLUMN_CANDIDATES,
      date: DATE_COLUMN_CANDIDATES,
      totalDistance: FUEL_TOTAL_DISTANCE_CANDIDATES,
      fuelEfficiency: FUEL_EFFICIENCY_CANDIDATES,
      totalFuel: FUEL_TOTAL_FUEL_CANDIDATES,
      fuelEmissionFactor: FUEL_EMISSION_FACTOR_CANDIDATES,
    },
    heuristics: {
      timeframe: ["time", "frame"],
      totalDistance: ["distance"],
      fuelEfficiency: ["efficiency"],
      totalFuel: ["total", "fuel"],
      fuelEmissionFactor: ["emission", "factor"],
    },
  },
  wasteGenerated: {
    table: "dim_waste_generated_target",
    candidates: {
      timeframe: TIMEFRAME_COLUMN_CANDIDATES,
      date: DATE_COLUMN_CANDIDATES,
      totalWasteMass: WASTE_TOTAL_MASS_CANDIDATES,
      percentByTreatment: WASTE_PERCENT_TREATMENT_CANDIDATES,
      emissionFactor: WASTE_EMISSION_FACTOR_CANDIDATES,
    },
    heuristics: {
      timeframe: ["time", "frame"],
      totalWasteMass: ["waste", "mass"],
      percentByTreatment: ["treatment", "percent"],
      emissionFactor: ["emission", "factor"],
    },
  },
  waterSupply: {
    table: "dim_water_supply_target",
    candidates: {
      timeframe: TIMEFRAME_COLUMN_CANDIDATES,
      date: DATE_COLUMN_CANDIDATES,
      totalWaterConsumed: WATER_TOTAL_CONSUMPTION_CANDIDATES,
      waterSupplyEmissionFactor: WATER_EMISSION_FACTOR_CANDIDATES,
    },
    heuristics: {
      timeframe: ["time", "frame"],
      totalWaterConsumed: ["water", "consum"],
      waterSupplyEmissionFactor: ["emission", "factor"],
    },
  },
  safetyIncident: {
    table: "projects_safety_incident_targets",
    candidates: {
      timeframe: TIMEFRAME_COLUMN_CANDIDATES,
      date: DATE_COLUMN_CANDIDATES,
      numberOfIncidents: SAFETY_INCIDENT_COUNT_CANDIDATES,
      totalEmployeeHours: SAFETY_EMPLOYEE_HOURS_CANDIDATES,
    },
    heuristics: {
      timeframe: ["time", "frame"],
      numberOfIncidents: ["incident"],
      totalEmployeeHours: ["employee", "hour"],
    },
  },
};

export const MISSING_TABLE_MESSAGES: Record<TargetSectionKey, string> = {
  electricityUsage: "Electricity usage targets table is not configured.",
  equipmentUsage: "Equipment usage targets table is not configured.",
  fuelConsumption: "Fuel consumption targets table is not configured.",
  wasteGenerated: "Waste generated targets table is not configured.",
  waterSupply: "Water supply targets table is not configured.",
  safetyIncident: "Safety incident targets table is not configured.",
};

export const buildDefaultColumnMapping = (): ColumnMapping => {
  return Object.fromEntries(
    Object.entries(TARGET_SECTION_CONFIG).map(([section, config]) => {
      const mapping: Record<string, string> = {};
      for (const [canonicalKey, candidates] of Object.entries(
        config.candidates
      )) {
        mapping[canonicalKey] = candidates[0];
      }
      return [section, mapping];
    })
  ) as ColumnMapping;
};

export const selectColumnName = (
  available: ColumnInfo[],
  candidates: string[],
  heuristics?: string[]
): string => {
  if (available.length > 0) {
    for (const candidate of candidates) {
      const lowerCandidate = candidate.toLowerCase();
      const directMatch = available.find(
        (column) => column.lower === lowerCandidate
      );
      if (directMatch) {
        return directMatch.name;
      }
    }

    if (heuristics && heuristics.length > 0) {
      const heuristicMatch = available.find((column) =>
        heuristics.every((keyword) => column.lower.includes(keyword))
      );
      if (heuristicMatch) {
        return heuristicMatch.name;
      }
    }
  }

  return candidates[0];
};

export const isMissingColumnError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as { code?: string; message?: string };
  if (candidate.code === "PGRST204") {
    return true;
  }

  if (typeof candidate.message === "string") {
    const normalized = candidate.message.toLowerCase();
    return normalized.includes("column") && normalized.includes("schema cache");
  }

  return false;
};

export const isForeignKeyTimeframeError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as {
    code?: string;
    message?: string;
    details?: string;
  };

  const normalize = (value?: string): string =>
    typeof value === "string" ? value.toLowerCase() : "";

  const message = normalize(candidate.message);
  const details = normalize(candidate.details);

  if (candidate.code === "23503") {
    if (message.includes("timeframe") || details.includes("timeframe")) {
      return true;
    }
  }

  if (message.includes("foreign key") && message.includes("timeframe")) {
    return true;
  }

  if (details.includes("foreign key") && details.includes("timeframe")) {
    return true;
  }

  return false;
};

export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }

  return fallback;
};

export const toStringOrEmpty = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
};

export const hasAnyValue = (...values: string[]): boolean =>
  values.some((value) => value.trim().length > 0);

export const DATE_INPUT_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const normalizeDateInput = (
  value: string,
  fieldLabel: string
): string | null => {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }

  if (!DATE_INPUT_REGEX.test(trimmed)) {
    throw new Error(`${fieldLabel} must be in YYYY-MM-DD format.`);
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`${fieldLabel} is not a valid date.`);
  }

  return trimmed;
};

export const formatDateForInput = (value: unknown): string => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return "";
    }

    if (DATE_INPUT_REGEX.test(trimmed)) {
      return trimmed;
    }

    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) {
      return "";
    }

    return parsed.toISOString().slice(0, 10);
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return "";
    }

    return value.toISOString().slice(0, 10);
  }

  return "";
};

export const parseNumeric = (value: string, fieldLabel: string): number => {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new Error(`${fieldLabel} is required.`);
  }

  const numeric = Number(trimmed);
  if (!Number.isFinite(numeric)) {
    throw new Error(`${fieldLabel} must be a valid number.`);
  }

  return numeric;
};

export const DEFAULT_STEP1_VALUES: InitialValues = {
  projectName: "Greenwood Tower",
  projectAddress: "123 Sustainable Ave, Eco City",
  projectDescription: "",
  status: "planning",
  priority: "medium",
  startDate: "",
  endDate: "",
  clientName: "",
  category: "",
  budget: "",
  documentPaths: {},
};

export const generateSlug = (input: string) =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const buildSlugFallback = (identifier: string) =>
  `project-${
    identifier
      .replace(/[^a-z0-9]+/gi, "")
      .slice(0, 12)
      .toLowerCase() || crypto.randomUUID().slice(0, 12)
  }`;

export const getDefaultStep1Values = (
  project?: Project,
  documentPaths: DocumentPathMap = {}
): InitialValues => ({
  projectName: project?.name ?? DEFAULT_STEP1_VALUES.projectName,
  projectAddress: project?.location ?? DEFAULT_STEP1_VALUES.projectAddress,
  projectDescription:
    project?.description ?? DEFAULT_STEP1_VALUES.projectDescription,
  status: project?.status ?? DEFAULT_STEP1_VALUES.status,
  priority: project?.priority ?? DEFAULT_STEP1_VALUES.priority,
  startDate: project?.startDate ?? DEFAULT_STEP1_VALUES.startDate,
  endDate: project?.endDate ?? DEFAULT_STEP1_VALUES.endDate,
  clientName: project?.clientName ?? DEFAULT_STEP1_VALUES.clientName,
  category: project?.category ?? DEFAULT_STEP1_VALUES.category,
  budget:
    project?.budget !== undefined && project?.budget !== null
      ? project.budget.toString()
      : DEFAULT_STEP1_VALUES.budget,
  documentPaths,
});

export type StepDefinition = {
  id?: number;
  title: string;
  description: string;
};

export const STEP_DEFINITIONS: StepDefinition[] = [
  {
    id: 1,
    title: "Project Setup",
    description: "Define basics, upload compliance files.",
  },
  {
    id: 2,
    title: "Target Setting",
    description: "Capture ESG targets.",
  },
  {
    id: 3,
    title: "Material Sourcing",
    description: "Log supporting materials and suppliers.",
  },
  {
    id: 4,
    title: "Review Plans",
    description: "Validate and submit for approvals.",
  },
];
