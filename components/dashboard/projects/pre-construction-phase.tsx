"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Step1ProjectSetup from "./preconstruction/step1-project-setup";
import Step2TargetSetting from "./preconstruction/step2-target-setting";
import Step3ReviewPlans from "./preconstruction/step3-review-plans";
import { type Material, type MaterialStatus } from "./preconstruction/types";
import { supabase } from "@/lib/supabase/client";
import type { Project } from "@/types/project";
import {
  type DocumentKey,
  type ExistingFileState,
  type Step1FormValues,
} from "@/types/forms";
import { mapProjectFromSupabase } from "./project-helpers";
import { isMissingRelationError } from "@/lib/supabase/errors";
import {
  type ProjectEsgTargets,
  type TargetSectionKey,
  type TargetSectionValuesMap,
} from "@/types/preconstruction";

type Step1InitialValues = NonNullable<
  Parameters<typeof Step1ProjectSetup>[0]["initialValues"]
>;

type DocumentPathMap = ExistingFileState;

const createEmptyTargets = (): ProjectEsgTargets => ({
  electricityUsage: null,
  equipmentUsage: null,
  fuelConsumption: null,
  wasteGenerated: null,
  waterSupply: null,
  safetyIncident: null,
});

type ColumnCandidateMap = Record<string, string[]>;

type SectionConfig = {
  table: string;
  candidates: ColumnCandidateMap;
  heuristics?: Record<string, string[]>;
};

type ColumnMapping = Record<TargetSectionKey, Record<string, string>>;

type ColumnInfo = {
  name: string;
  lower: string;
};

type ColumnDescriptor = ColumnInfo & {
  dataType: string;
};

const TIMEFRAME_COLUMN_CANDIDATES = [
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

const DATE_COLUMN_CANDIDATES = [
  "date",
  "target_date",
  "targetDate",
  "target_deadline",
  "deadline",
];

const ELECTRICITY_TOTAL_CONSUMPTION_CANDIDATES = [
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

const EQUIPMENT_OPERATION_LOGS_CANDIDATES = [
  "equipment_operation_logs",
  "operation_logs",
  "equipment_logs",
  "operation_notes",
  "equipmentOperationLogs",
];

const EQUIPMENT_FUEL_RATE_CANDIDATES = [
  "fuel_rate",
  "fuel_rate_lph",
  "fuel_rate_liters_per_hour",
  "fuel_rate_liters_hour",
  "fuelRate",
  "fuel_rate_value",
];

const EQUIPMENT_TOTAL_FUEL_CANDIDATES = [
  "total_fuel",
  "total_fuel_liters",
  "fuel_consumed_total",
  "fuel_consumed",
  "totalFuel",
];

const EQUIPMENT_COMBUSTION_FACTOR_CANDIDATES = [
  "combustion_emission_factor",
  "combustion_factor",
  "emission_factor",
  "combustionEmissionFactor",
  "emission_factor_combustion",
];

const FUEL_TOTAL_DISTANCE_CANDIDATES = [
  "total_distance",
  "distance_travelled",
  "distance_traveled",
  "total_distance_km",
  "distance_km",
  "distance",
  "route_distance",
  "totalDistance",
];

const FUEL_EFFICIENCY_CANDIDATES = [
  "fuel_efficiency",
  "fuel_efficiency_km_per_l",
  "fuel_efficiency_kmpl",
  "efficiency_km_per_liter",
  "fuel_efficiency_km_l",
  "fuelEfficiency",
  "km_per_liter",
];

const FUEL_TOTAL_FUEL_CANDIDATES = [
  "total_fuel",
  "total_fuel_used",
  "fuel_used",
  "fuel_consumed",
  "fuel_consumption_total",
  "totalFuel",
];

const FUEL_EMISSION_FACTOR_CANDIDATES = [
  "fuel_emission_factor",
  "fuel_emission_factor_value",
  "fuel_emission_factor_l",
  "emission_factor_fuel",
  "fuelEmissionFactor",
];

const WASTE_TOTAL_MASS_CANDIDATES = [
  "total_waste_mass",
  "total_waste_generated",
  "waste_mass",
  "waste_generated_mass",
  "waste_mass_kg",
  "totalWasteMass",
];

const WASTE_PERCENT_TREATMENT_CANDIDATES = [
  "percent_by_treatment",
  "treatment_percentage",
  "treatment_percent",
  "percent_treatment",
  "percent_by_method",
  "percentByTreatment",
];

const WASTE_EMISSION_FACTOR_CANDIDATES = [
  "emission_factor",
  "waste_emission_factor",
  "emission_factor_waste",
  "emissionFactor",
];

const WATER_TOTAL_CONSUMPTION_CANDIDATES = [
  "total_water_consumed",
  "water_consumption_total",
  "total_water_usage",
  "water_used_total",
  "water_consumption",
  "totalWaterConsumed",
  "water_used",
];

const WATER_EMISSION_FACTOR_CANDIDATES = [
  "water_supply_emission_factor",
  "supply_emission_factor",
  "water_emission_factor",
  "emission_factor_water_supply",
  "waterSupplyEmissionFactor",
];

const SAFETY_INCIDENT_COUNT_CANDIDATES = [
  "number_of_incidents",
  "incident_count",
  "total_incidents",
  "incidents_total",
  "incidentNumber",
  "numberOfIncidents",
];

const SAFETY_EMPLOYEE_HOURS_CANDIDATES = [
  "total_employee_hours",
  "employee_hours_total",
  "hours_worked_total",
  "total_hours_worked",
  "employee_hours",
  "totalEmployeeHours",
];

const FIXED_EMISSION_FACTOR = 2.68;
const FIXED_EMISSION_FACTOR_STRING = FIXED_EMISSION_FACTOR.toString();

const TARGET_SECTION_CONFIG: Record<TargetSectionKey, SectionConfig> = {
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

const MISSING_TABLE_MESSAGES: Record<TargetSectionKey, string> = {
  electricityUsage: "Electricity usage targets table is not configured.",
  equipmentUsage: "Equipment usage targets table is not configured.",
  fuelConsumption: "Fuel consumption targets table is not configured.",
  wasteGenerated: "Waste generated targets table is not configured.",
  waterSupply: "Water supply targets table is not configured.",
  safetyIncident: "Safety incident targets table is not configured.",
};

const buildDefaultColumnMapping = (): ColumnMapping => {
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

const selectColumnName = (
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

const isMissingColumnError = (error: unknown): boolean => {
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

const isForeignKeyTimeframeError = (error: unknown): boolean => {
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

const getErrorMessage = (error: unknown, fallback: string): string => {
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

const toStringOrEmpty = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
};

const hasAnyValue = (...values: string[]): boolean =>
  values.some((value) => value.trim().length > 0);

const DATE_INPUT_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const normalizeDateInput = (value: string, fieldLabel: string): string | null => {
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

const formatDateForInput = (value: unknown): string => {
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

const parseNumeric = (value: string, fieldLabel: string): number => {
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

const DEFAULT_STEP1_VALUES: Step1InitialValues = {
  projectName: "Greenwood Tower",
  projectAddress: "123 Sustainable Ave, Eco City",
  projectDescription: "",
  status: "planning",
  priority: "medium",
  projectManager: "",
  startDate: "",
  endDate: "",
  clientName: "",
  category: "",
  budget: "",
  documentPaths: {},
};

const generateSlug = (input: string) =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const buildSlugFallback = (identifier: string) =>
  `project-${
    identifier
      .replace(/[^a-z0-9]+/gi, "")
      .slice(0, 12)
      .toLowerCase() || crypto.randomUUID().slice(0, 12)
  }`;

const getDefaultStep1Values = (
  project?: Project,
  documentPaths: DocumentPathMap = {}
): Step1InitialValues => ({
  projectName: project?.name ?? DEFAULT_STEP1_VALUES.projectName,
  projectAddress: project?.location ?? DEFAULT_STEP1_VALUES.projectAddress,
  projectDescription:
    project?.description ?? DEFAULT_STEP1_VALUES.projectDescription,
  status: project?.status ?? DEFAULT_STEP1_VALUES.status,
  priority: project?.priority ?? DEFAULT_STEP1_VALUES.priority,
  projectManager: project?.projectManager ?? DEFAULT_STEP1_VALUES.projectManager,
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

const STEP_DEFINITIONS = [
  {
    id: 1,
    title: "Project Setup",
    description: "Define basics, upload compliance files.",
  },
  {
    id: 2,
    title: "Target Setting",
    description: "Capture ESG targets & sourcing notes.",
  },
  {
    id: 3,
    title: "Review Plans",
    description: "Validate and submit for approvals.",
  },
];

const StepIndicator = ({ currentStep }: { currentStep: number }) => {
  const totalSteps = STEP_DEFINITIONS.length;
  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white/90 dark:bg-gray-900/70 p-4 space-y-4 shadow-sm">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Step {currentStep} of {totalSteps}
        </span>
        <span>{progressPercent}% complete</span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <ol className="space-y-3">
        {STEP_DEFINITIONS.map((stepDef) => {
          const isActive = currentStep === stepDef.id;
          const isComplete = currentStep > stepDef.id;
          return (
            <li
              key={stepDef.id}
              className="flex items-start gap-3 rounded-xl p-2"
            >
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                  isComplete
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : isActive
                    ? "border-emerald-500 text-emerald-700 dark:text-emerald-200"
                    : "border-gray-300 text-gray-500"
                }`}
                aria-label={
                  isActive ? "Current step" : `Step ${stepDef.id} indicator`
                }
              >
                {isComplete ? "✓" : stepDef.id}
              </div>
              <div>
                <p
                  className={`text-sm font-medium ${
                    isActive || isComplete
                      ? "text-emerald-700 dark:text-emerald-200"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {stepDef.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stepDef.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

type PreConstructionPhaseProps = {
  project?: Project;
  onProjectUpdated?: (project: Project) => void;
  step2ReadOnly?: boolean;
};

export function PreConstructionPhase({
  project,
  onProjectUpdated,
  step2ReadOnly,
}: PreConstructionPhaseProps) {
  const [projectDetails, setProjectDetails] = useState<Project | null>(
    project ?? null
  );
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);
  const [projectSetupId, setProjectSetupId] = useState<string | null>(null);
  const [step1Values, setStep1Values] = useState<Step1InitialValues>(() =>
    getDefaultStep1Values(projectDetails ?? undefined)
  );
  const [targets, setTargets] = useState<ProjectEsgTargets>(() =>
    createEmptyTargets()
  );
  const [materials, setMaterials] = useState<Material[]>([]);
  const [documentPaths, setDocumentPaths] = useState<DocumentPathMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSavingStep1, setIsSavingStep1] = useState(false);
  const [isSavingMaterial, setIsSavingMaterial] = useState(false);
  const [deletingMaterialId, setDeletingMaterialId] = useState<string | null>(
    null
  );
  const [savingTargetSection, setSavingTargetSection] =
    useState<TargetSectionKey | null>(null);
  const [isSubmittingForApproval, setIsSubmittingForApproval] = useState(false);
  const [, setSubmittedForApprovalAt] = useState<string | null>(null);
  const supportsSubmittedAtColumn = false;
  const supportsApprovalStatusColumn = false;

  const columnMapRef = useRef<ColumnMapping>(buildDefaultColumnMapping());
  const columnTypesRef = useRef<Record<string, Record<string, string>>>({});
  const metadataLoadedRef = useRef(false);
  const metadataPromiseRef = useRef<Promise<void> | null>(null);

  const loadTargetColumnMetadata = useCallback(async () => {
    const updatedTypes: Record<string, Record<string, string>> = {
      ...columnTypesRef.current,
    };

    await Promise.all(
      (Object.entries(TARGET_SECTION_CONFIG) as Array<
        [TargetSectionKey, SectionConfig]
      >).map(async ([section, config]) => {
        const { data, error } = await supabase
          .from("information_schema.columns")
          .select("column_name,data_type")
          .eq("table_schema", "public")
          .eq("table_name", config.table);

        if (error || !data) {
          console.warn(
            `Unable to load column metadata for ${config.table}`,
            error
          );
          return;
        }

        const columns: ColumnDescriptor[] = data.map(
          (row: { column_name: string; data_type?: string | null }) => {
            const name = String(row.column_name);
            const dataType = row.data_type ? String(row.data_type) : "";
            return {
              name,
              lower: name.toLowerCase(),
              dataType,
            };
          }
        );

        const available: ColumnInfo[] = columns.map(
          (column: ColumnDescriptor) => ({
            name: column.name,
            lower: column.lower,
          })
        );

        const mapping = { ...columnMapRef.current[section] };
        for (const [canonicalKey, candidates] of Object.entries(
          config.candidates
        )) {
          const heuristics = config.heuristics?.[canonicalKey];
          mapping[canonicalKey] = selectColumnName(
            available,
            candidates,
            heuristics
          );
        }
        columnMapRef.current[section] = mapping;

        updatedTypes[config.table] = Object.fromEntries(
          columns.map((column: ColumnDescriptor) => [column.name, column.dataType])
        );
      })
    );

    columnTypesRef.current = updatedTypes;
  }, []);

  const ensureColumnMetadataLoaded = useCallback(async () => {
    if (metadataLoadedRef.current) {
      return;
    }

    if (!metadataPromiseRef.current) {
      metadataPromiseRef.current = loadTargetColumnMetadata()
        .catch((error) => {
          console.warn("Failed to load ESG target column metadata", error);
        })
        .finally(() => {
          metadataLoadedRef.current = true;
        });
    }

    await metadataPromiseRef.current;
  }, [loadTargetColumnMetadata]);

  const registerColumnsFromRecord = useCallback(
    (section: TargetSectionKey, record: Record<string, unknown>) => {
      const config = TARGET_SECTION_CONFIG[section];
      if (!config) {
        return;
      }

      const keys = Object.keys(record);
      if (keys.length === 0) {
        return;
      }

      const available: ColumnInfo[] = keys.map((name) => ({
        name,
        lower: name.toLowerCase(),
      }));

      const mapping = { ...columnMapRef.current[section] };
      for (const [canonicalKey, candidates] of Object.entries(
        config.candidates
      )) {
        const heuristics = config.heuristics?.[canonicalKey];
        mapping[canonicalKey] = selectColumnName(
          available,
          candidates,
          heuristics
        );
      }
      columnMapRef.current[section] = mapping;
    },
    []
  );

  const buildPayloadForSection = useCallback(
    (section: TargetSectionKey, canonicalValues: Record<string, unknown>) => {
      const mapping = columnMapRef.current[section];
      const payload: Record<string, unknown> = {};

      for (const [canonicalKey, value] of Object.entries(canonicalValues)) {
        if (value === undefined) {
          continue;
        }
        const columnName = mapping?.[canonicalKey] ?? canonicalKey;
        payload[columnName] = value;
      }

      return payload;
    },
    []
  );

  useEffect(() => {
    setProjectDetails(project ?? null);
  }, [project, registerColumnsFromRecord]);

  useEffect(() => {
    void ensureColumnMetadataLoaded();
  }, [ensureColumnMetadataLoaded]);

  const nextStep = useCallback(() => setStep((s) => Math.min(s + 1, 3)), []);
  const prevStep = useCallback(() => setStep((s) => Math.max(s - 1, 1)), []);

  const resetFeedback = useCallback(() => {
    setErrorMessage(null);
    setSuccessMessage(null);
  }, []);

  const loadData = useCallback(async () => {
    if (!project?.id) {
      setProjectSetupId(null);
      setStep1Values(getDefaultStep1Values(project));
      setDocumentPaths({});
      setMaterials([]);
      setTargets(createEmptyTargets());
      setUserId(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        const isSessionMissing =
          userError.message?.toLowerCase().includes("auth session missing") ||
          userError.name === "AuthSessionMissingError" ||
          userError.status === 401;

        if (!isSessionMissing) {
          throw userError;
        }

        setUserId(null);
        setProjectSetupId(null);
        setStep1Values(getDefaultStep1Values(project));
        setDocumentPaths({});
        setMaterials([]);
        setTargets(createEmptyTargets());
        return;
      }

      if (!user) {
        setUserId(null);
        setProjectSetupId(null);
        setStep1Values(getDefaultStep1Values(project));
        setDocumentPaths({});
        setMaterials([]);
        setTargets(createEmptyTargets());
        return;
      }

      setUserId(user.id);

      const { data: setupData, error: setupError } = await supabase
        .from("preconstruction_project_setup")
        .select(
          "id, project_id, project_name, project_address, project_description, sec_dti_path, mayors_permit_path, bir_registration_path"
        )
        .eq("user_id", user.id)
        .eq("project_id", project.id)
        .limit(1)
        .maybeSingle();

      const isMultipleRowError =
        setupError?.code === "PGRST116" ||
        (typeof setupError?.message === "string" &&
          setupError.message.toLowerCase().includes("multiple rows"));

      if (setupError && !isMultipleRowError) {
        throw setupError;
      }

      const normalizedSetup = setupData ?? null;

      if (!normalizedSetup) {
        setProjectSetupId(null);
        setStep1Values(getDefaultStep1Values(project));
        setDocumentPaths({});
        setMaterials([]);
        setTargets(createEmptyTargets());
        return;
      }

      setProjectSetupId(normalizedSetup.id);

      const nextDocPaths: DocumentPathMap = {};
      if (normalizedSetup.sec_dti_path) {
        nextDocPaths["sec-dti"] = normalizedSetup.sec_dti_path;
      }
      if (normalizedSetup.mayors_permit_path) {
        nextDocPaths["mayors-permit"] = normalizedSetup.mayors_permit_path;
      }
      if (normalizedSetup.bir_registration_path) {
        nextDocPaths.bir = normalizedSetup.bir_registration_path;
      }
      setDocumentPaths(nextDocPaths);

      setStep1Values({
        projectName:
          normalizedSetup.project_name ??
          project?.name ??
          DEFAULT_STEP1_VALUES.projectName,
        projectAddress:
          normalizedSetup.project_address ??
          project?.location ??
          DEFAULT_STEP1_VALUES.projectAddress,
        projectDescription:
          normalizedSetup.project_description ??
          project?.description ??
          DEFAULT_STEP1_VALUES.projectDescription,
        status: project?.status ?? DEFAULT_STEP1_VALUES.status,
        priority: project?.priority ?? DEFAULT_STEP1_VALUES.priority,
        projectManager:
          project?.projectManager ?? DEFAULT_STEP1_VALUES.projectManager,
        startDate: project?.startDate ?? DEFAULT_STEP1_VALUES.startDate,
        endDate: project?.endDate ?? DEFAULT_STEP1_VALUES.endDate,
        clientName: project?.clientName ?? DEFAULT_STEP1_VALUES.clientName,
        category: project?.category ?? DEFAULT_STEP1_VALUES.category,
        budget:
          project?.budget !== undefined && project?.budget !== null
            ? project.budget.toString()
            : DEFAULT_STEP1_VALUES.budget,
        documentPaths: nextDocPaths,
      });

      if (normalizedSetup.id) {
        const {
          data: materialRows,
          error: materialsError,
        } = await supabase
          .from("preconstruction_material")
          .select(
            "id, material_category, planned_supplier, material_name, warehouse_of_the_supplier, budgeted_cost, unit, sustainability_credentials, supplier_vetting_notes, spec_sheet_path, vetting_status"
          )
          .eq("project_setup_id", normalizedSetup.id)
          .order("created_at", { ascending: true });

        if (materialsError) {
          if (!isMissingRelationError(materialsError)) {
            throw materialsError;
          }
          setMaterials([]);
        } else {
          const mappedMaterials: Material[] = materialRows
            ? (materialRows as Array<{
                id: string;
                material_category: string;
                planned_supplier: string;
                material_name: string;
                warehouse_of_the_supplier: string | null;
                budgeted_cost: number | null;
                unit: string | null;
                sustainability_credentials: string | null;
                supplier_vetting_notes: string | null;
                spec_sheet_path: string | null;
                vetting_status: MaterialStatus;
              }>).map((materialRow) => ({
                id: materialRow.id,
                category: materialRow.material_category,
                name: materialRow.material_name,
                supplier: materialRow.planned_supplier,
                cost:
                  materialRow.budgeted_cost !== null
                    ? materialRow.budgeted_cost.toString()
                    : "",
                unit: materialRow.unit ?? undefined,
                notes: materialRow.supplier_vetting_notes ?? "",
                credentials:
                  materialRow.sustainability_credentials ?? undefined,
                status: materialRow.vetting_status,
                warehouse: materialRow.warehouse_of_the_supplier ?? undefined,
                specSheetPath: materialRow.spec_sheet_path ?? undefined,
              }))
            : [];

          setMaterials(mappedMaterials);
        }
      } else {
        setMaterials([]);
      }

      const projectIdForTargets = project?.id ?? null;

      if (projectIdForTargets) {
        const [
          electricityResponse,
          equipmentResponse,
          fuelResponse,
          wasteResponse,
          waterResponse,
          safetyResponse,
        ] = await Promise.all([
          supabase
            .from("dim_electricity_usage_target")
            .select("*")
            .eq("project_id", projectIdForTargets)
            .limit(1)
            .maybeSingle(),
          supabase
            .from("dim_equipment_usage_target")
            .select("*")
            .eq("project_id", projectIdForTargets)
            .limit(1)
            .maybeSingle(),
          supabase
            .from("dim_fuel_consumption_target")
            .select("*")
            .eq("project_id", projectIdForTargets)
            .limit(1)
            .maybeSingle(),
          supabase
            .from("dim_waste_generated_target")
            .select("*")
            .eq("project_id", projectIdForTargets)
            .limit(1)
            .maybeSingle(),
          supabase
            .from("dim_water_supply_target")
            .select("*")
            .eq("project_id", projectIdForTargets)
            .limit(1)
            .maybeSingle(),
          supabase
            .from("projects_safety_incident_targets")
            .select("*")
            .eq("project_id", projectIdForTargets)
            .limit(1)
            .maybeSingle(),
        ]);

        const nextTargets = createEmptyTargets();

        if (electricityResponse.error) {
          if (!isMissingRelationError(electricityResponse.error)) {
            throw electricityResponse.error;
          }
        } else if (electricityResponse.data) {
          const data = electricityResponse.data as Record<string, unknown>;
          registerColumnsFromRecord("electricityUsage", data);
          const timeframe = toStringOrEmpty(
            (data.timeframe as unknown) ?? (data.target_timeframe as unknown) ?? ""
          );
          const targetDate = formatDateForInput(
            (data.date as unknown) ?? (data.target_date as unknown)
          );
          const totalElectricityConsumed = toStringOrEmpty(
            (data.total_electricity_consumed as unknown) ??
              (data.totalElectricityConsumed as unknown) ??
              ""
          );

          if (hasAnyValue(timeframe, totalElectricityConsumed, targetDate)) {
            nextTargets.electricityUsage = {
              id: data.id != null ? String(data.id) : null,
              timeframe,
              date: targetDate,
              totalElectricityConsumed,
            };
          }
        }

        if (equipmentResponse.error) {
          if (!isMissingRelationError(equipmentResponse.error)) {
            throw equipmentResponse.error;
          }
        } else if (equipmentResponse.data) {
          const data = equipmentResponse.data as Record<string, unknown>;
          registerColumnsFromRecord("equipmentUsage", data);
          const timeframe = toStringOrEmpty(
            (data.timeframe as unknown) ?? (data.target_timeframe as unknown) ?? ""
          );
          const targetDate = formatDateForInput(
            (data.date as unknown) ?? (data.target_date as unknown)
          );
          const equipmentOperationLogs = toStringOrEmpty(
            (data.equipment_operation_logs as unknown) ??
              (data.equipmentOperationLogs as unknown) ??
              ""
          );
          const fuelRate = toStringOrEmpty(
            (data.fuel_rate as unknown) ?? (data.fuelRate as unknown) ?? ""
          );
          const totalFuel = toStringOrEmpty(
            (data.total_fuel as unknown) ?? (data.totalFuel as unknown) ?? ""
          );
          const combustionEmissionFactor =
            toStringOrEmpty(
              (data.combustion_emission_factor as unknown) ??
                (data.combustionEmissionFactor as unknown) ??
                ""
            ) || FIXED_EMISSION_FACTOR_STRING;

          if (
            hasAnyValue(
              timeframe,
              equipmentOperationLogs,
              fuelRate,
              totalFuel,
              combustionEmissionFactor,
              targetDate
            )
          ) {
            nextTargets.equipmentUsage = {
              id: data.id != null ? String(data.id) : null,
              timeframe,
              date: targetDate,
              equipmentOperationLogs,
              fuelRate,
              totalFuel,
              combustionEmissionFactor,
            };
          }
        }

        if (fuelResponse.error) {
          if (!isMissingRelationError(fuelResponse.error)) {
            throw fuelResponse.error;
          }
        } else if (fuelResponse.data) {
          const data = fuelResponse.data as Record<string, unknown>;
          registerColumnsFromRecord("fuelConsumption", data);
          const timeframe = toStringOrEmpty(
            (data.timeframe as unknown) ?? (data.target_timeframe as unknown) ?? ""
          );
          const targetDate = formatDateForInput(
            (data.date as unknown) ?? (data.target_date as unknown)
          );
          const totalDistance = toStringOrEmpty(
            (data.total_distance as unknown) ??
              (data.totalDistance as unknown) ??
              ""
          );
          const fuelEfficiency = toStringOrEmpty(
            (data.fuel_efficiency as unknown) ??
              (data.fuelEfficiency as unknown) ??
              ""
          );
          const rawTotalFuel = toStringOrEmpty(
            (data.total_fuel as unknown) ?? (data.totalFuel as unknown) ?? ""
          );
          const computedTotalFuel = (() => {
            if (rawTotalFuel.trim().length > 0) {
              return rawTotalFuel;
            }
            const distanceValue = Number(totalDistance);
            const efficiencyValue = Number(fuelEfficiency);
            if (
              Number.isFinite(distanceValue) &&
              Number.isFinite(efficiencyValue)
            ) {
              const product = distanceValue * efficiencyValue;
              if (Number.isFinite(product)) {
                return product.toString();
              }
            }
            return "";
          })();
          const fuelEmissionFactor =
            toStringOrEmpty(
              (data.fuel_emission_factor as unknown) ??
                (data.fuelEmissionFactor as unknown) ??
                ""
            ) || FIXED_EMISSION_FACTOR_STRING;

          if (
            hasAnyValue(
              timeframe,
              totalDistance,
              fuelEfficiency,
              computedTotalFuel,
              targetDate
            )
          ) {
            nextTargets.fuelConsumption = {
              id: data.id != null ? String(data.id) : null,
              timeframe,
              date: targetDate,
              totalDistance,
              fuelEfficiency,
              totalFuel: computedTotalFuel,
              fuelEmissionFactor,
            };
          }
        }

        if (wasteResponse.error) {
          if (!isMissingRelationError(wasteResponse.error)) {
            throw wasteResponse.error;
          }
        } else if (wasteResponse.data) {
          const data = wasteResponse.data as Record<string, unknown>;
          registerColumnsFromRecord("wasteGenerated", data);
          const timeframe = toStringOrEmpty(
            (data.timeframe as unknown) ?? (data.target_timeframe as unknown) ?? ""
          );
          const targetDate = formatDateForInput(
            (data.date as unknown) ?? (data.target_date as unknown)
          );
          const totalWasteMass = toStringOrEmpty(
            (data.total_waste_mass as unknown) ??
              (data.totalWasteMass as unknown) ??
              ""
          );
          const percentByTreatment = toStringOrEmpty(
            (data.percent_by_treatment as unknown) ??
              (data.percentByTreatment as unknown) ??
              ""
          );
          const emissionFactor = toStringOrEmpty(
            (data.emission_factor as unknown) ??
              (data.emissionFactor as unknown) ??
              ""
          );

          if (
            hasAnyValue(
              timeframe,
              totalWasteMass,
              percentByTreatment,
              emissionFactor,
              targetDate
            )
          ) {
            nextTargets.wasteGenerated = {
              id: data.id != null ? String(data.id) : null,
              timeframe,
              date: targetDate,
              totalWasteMass,
              percentByTreatment,
              emissionFactor,
            };
          }
        }

        if (waterResponse.error) {
          if (!isMissingRelationError(waterResponse.error)) {
            throw waterResponse.error;
          }
        } else if (waterResponse.data) {
          const data = waterResponse.data as Record<string, unknown>;
          registerColumnsFromRecord("waterSupply", data);
          const timeframe = toStringOrEmpty(
            (data.timeframe as unknown) ?? (data.target_timeframe as unknown) ?? ""
          );
          const targetDate = formatDateForInput(
            (data.date as unknown) ?? (data.target_date as unknown)
          );
          const totalWaterConsumed = toStringOrEmpty(
            (data.total_water_consumed as unknown) ??
              (data.totalWaterConsumed as unknown) ??
              ""
          );
          const waterSupplyEmissionFactor = toStringOrEmpty(
            (data.water_supply_emission_factor as unknown) ??
              (data.waterSupplyEmissionFactor as unknown) ??
              ""
          );

          if (
            hasAnyValue(
              timeframe,
              totalWaterConsumed,
              waterSupplyEmissionFactor,
              targetDate
            )
          ) {
            nextTargets.waterSupply = {
              id: data.id != null ? String(data.id) : null,
              timeframe,
              date: targetDate,
              totalWaterConsumed,
              waterSupplyEmissionFactor,
            };
          }
        }

        if (safetyResponse.error) {
          if (!isMissingRelationError(safetyResponse.error)) {
            throw safetyResponse.error;
          }
        } else if (safetyResponse.data) {
          const data = safetyResponse.data as Record<string, unknown>;
          registerColumnsFromRecord("safetyIncident", data);
          const timeframe = toStringOrEmpty(
            (data.timeframe as unknown) ?? (data.target_timeframe as unknown) ?? ""
          );
          const targetDate = formatDateForInput(
            (data.date as unknown) ?? (data.target_date as unknown)
          );
          const numberOfIncidents = toStringOrEmpty(
            (data.number_of_incidents as unknown) ??
              (data.numberOfIncidents as unknown) ??
              ""
          );
          const totalEmployeeHours = toStringOrEmpty(
            (data.total_employee_hours as unknown) ??
              (data.totalEmployeeHours as unknown) ??
              ""
          );

          if (
            hasAnyValue(
              timeframe,
              numberOfIncidents,
              totalEmployeeHours,
              targetDate
            )
          ) {
            nextTargets.safetyIncident = {
              id: data.id != null ? String(data.id) : null,
              timeframe,
              date: targetDate,
              numberOfIncidents,
              totalEmployeeHours,
            };
          }
        }

        setTargets(nextTargets);
      } else {
        setTargets(createEmptyTargets());
      }

      setErrorMessage(null);
    } catch (error) {
      if (isMissingRelationError(error)) {
        console.warn(
          "Optional pre-construction relations are not configured; continuing without targets/materials."
        );
        setErrorMessage(null);
        return;
      }

      console.error("Failed to load pre-construction data", error);
      const derivedMessage =
        error && typeof error === "object" && "message" in error
          ? String((error as { message: unknown }).message ?? "")
          : "";

      setErrorMessage(
        derivedMessage.trim().length > 0
          ? derivedMessage
          : "Failed to load data."
      );
    } finally {
      setIsLoading(false);
    }
  }, [project, registerColumnsFromRecord]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!projectSetupId && !isLoading) {
      setStep1Values((prev) => ({
        projectName:
          prev.projectName &&
          prev.projectName !== DEFAULT_STEP1_VALUES.projectName
            ? prev.projectName
            : project?.name ?? DEFAULT_STEP1_VALUES.projectName,
        projectAddress:
          prev.projectAddress &&
          prev.projectAddress !== DEFAULT_STEP1_VALUES.projectAddress
            ? prev.projectAddress
            : project?.location ?? DEFAULT_STEP1_VALUES.projectAddress,
        projectDescription:
          prev.projectDescription && prev.projectDescription.length > 0
            ? prev.projectDescription
            : project?.description ?? DEFAULT_STEP1_VALUES.projectDescription,
        status: prev.status ?? project?.status ?? DEFAULT_STEP1_VALUES.status,
        priority:
          prev.priority ?? project?.priority ?? DEFAULT_STEP1_VALUES.priority,
        projectManager:
          prev.projectManager ??
          project?.projectManager ??
          DEFAULT_STEP1_VALUES.projectManager,
        startDate:
          prev.startDate ?? project?.startDate ?? DEFAULT_STEP1_VALUES.startDate,
        endDate:
          prev.endDate ?? project?.endDate ?? DEFAULT_STEP1_VALUES.endDate,
        clientName:
          prev.clientName ??
          project?.clientName ??
          DEFAULT_STEP1_VALUES.clientName,
        category:
          prev.category ??
          project?.category ??
          DEFAULT_STEP1_VALUES.category,
        budget:
          prev.budget ??
          (project?.budget !== undefined && project?.budget !== null
            ? project.budget.toString()
            : DEFAULT_STEP1_VALUES.budget),
        documentPaths: prev.documentPaths,
      }));
    }
  }, [isLoading, project, projectSetupId]);

  type MaterialDraftInput = {
    category: string;
    name: string;
    supplier: string;
    cost: string;
    unit: string;
    notes: string;
    credentials?: string;
    status: MaterialStatus;
    warehouse?: string;
  };

  const handleSaveTargetSection = useCallback(
    async <K extends TargetSectionKey>(
      section: K,
      sectionValues: TargetSectionValuesMap[K]
    ) => {
      const activeProjectId = projectDetails?.id ?? project?.id ?? null;

      if (!activeProjectId) {
        setErrorMessage(
          "Project context is missing. Save project details before defining targets."
        );
        return;
      }

      resetFeedback();
      setSavingTargetSection(section);

      const saveTargetRecord = async (
        targetSection: TargetSectionKey,
        canonicalValues: Record<string, unknown>,
        existingId: string | null,
        options?: { useDirectColumnNames?: boolean }
      ): Promise<string | null> => {
        const config = TARGET_SECTION_CONFIG[targetSection];
        const { table } = config;
        const missingTableMessage = MISSING_TABLE_MESSAGES[targetSection];

        const applyTimeframeFallback = (): boolean => {
          const timeframeCandidates = config.candidates.timeframe;
          if (!timeframeCandidates || timeframeCandidates.length === 0) {
            return false;
          }

          const tableTypes = columnTypesRef.current[table] ?? {};
          const currentMapping = {
            ...(columnMapRef.current[targetSection] ?? {}),
          } as Record<string, string>;
          const currentColumn = currentMapping.timeframe;

          for (const candidateColumn of timeframeCandidates) {
            if (candidateColumn === currentColumn) {
              continue;
            }
            if (tableTypes[candidateColumn]) {
              currentMapping.timeframe = candidateColumn;
              columnMapRef.current[targetSection] = currentMapping;
              return true;
            }
          }

          return false;
        };

        const persist = async (
          currentId: string | null,
          retry: boolean
        ): Promise<string | null> => {
          let mappedValues: Record<string, unknown>;

          if (options?.useDirectColumnNames) {
            mappedValues = canonicalValues;
          } else {
            await ensureColumnMetadataLoaded();
            mappedValues = buildPayloadForSection(
              targetSection,
              canonicalValues
            );
          }
          const payload = {
            project_id: activeProjectId,
            ...mappedValues,
          };

          if (currentId) {
            const { error } = await supabase
              .from(table)
              .update(payload)
              .eq("id", currentId);

            if (error) {
              if (isMissingRelationError(error)) {
                throw new Error(missingTableMessage);
              }
              if (
                isMissingColumnError(error) &&
                !retry &&
                !options?.useDirectColumnNames
              ) {
                metadataLoadedRef.current = false;
                metadataPromiseRef.current = null;
                return persist(currentId, true);
              }
              if (
                isForeignKeyTimeframeError(error) &&
                !retry &&
                !options?.useDirectColumnNames &&
                applyTimeframeFallback()
              ) {
                return persist(currentId, true);
              }
              throw error;
            }

            return currentId;
          }

          const { data, error } = await supabase
            .from(table)
            .insert([payload])
            .select("id")
            .single();

          if (error) {
            if (isMissingRelationError(error)) {
              throw new Error(missingTableMessage);
            }
            if (
              isMissingColumnError(error) &&
              !retry &&
              !options?.useDirectColumnNames
            ) {
              metadataLoadedRef.current = false;
              metadataPromiseRef.current = null;
              return persist(null, true);
            }
            if (
              isForeignKeyTimeframeError(error) &&
              !retry &&
              !options?.useDirectColumnNames &&
              applyTimeframeFallback()
            ) {
              return persist(null, true);
            }
            throw error;
          }

          return data && data.id != null ? String(data.id) : null;
        };

        return persist(existingId, false);
      };

      try {
        if (section === "electricityUsage") {
          const values =
            sectionValues as TargetSectionValuesMap["electricityUsage"];
          const totalElectricityInput =
            values.totalElectricityConsumed.trim();
          if (!totalElectricityInput) {
            throw new Error(
              "Provide the total electricity consumed before saving."
            );
          }

          const totalElectricityConsumed = parseNumeric(
            totalElectricityInput,
            "Total electricity consumed"
          );
          const normalizedDate = normalizeDateInput(
            values.date ?? "",
            "Target date"
          );

          const recordId = await saveTargetRecord(
            "electricityUsage",
            {
              date: normalizedDate,
              totalElectricityConsumed,
            },
            values.id ?? null
          );

          setTargets((prev) => ({
            ...prev,
            electricityUsage: {
              id: recordId,
              timeframe: null,
              date: normalizedDate ?? "",
              totalElectricityConsumed: totalElectricityInput,
            },
          }));
          setSuccessMessage("Electricity usage target saved.");
          return;
        }

        if (section === "equipmentUsage") {
          const values =
            sectionValues as TargetSectionValuesMap["equipmentUsage"];
          const equipmentOperationLogsInput =
            values.equipmentOperationLogs.trim();
          const fuelRateInput = values.fuelRate.trim();
          const normalizedDate = normalizeDateInput(
            values.date ?? "",
            "Target date"
          );

          const equipmentOperationLogsValue = parseNumeric(
            equipmentOperationLogsInput,
            "Equipment operation logs"
          );
          const fuelRate = parseNumeric(fuelRateInput, "Fuel rate");
          const totalFuel = equipmentOperationLogsValue * fuelRate;
          const totalFuelString = totalFuel.toString();
          const combustionEmissionFactor = FIXED_EMISSION_FACTOR;

          const recordId = await saveTargetRecord(
            "equipmentUsage",
            {
              date: normalizedDate,
              equipmentOperationLogs: equipmentOperationLogsValue,
              fuelRate,
              totalFuel,
              combustionEmissionFactor,
            },
            values.id ?? null
          );

          setTargets((prev) => ({
            ...prev,
            equipmentUsage: {
              id: recordId,
              timeframe: null,
              date: normalizedDate ?? "",
              equipmentOperationLogs: equipmentOperationLogsInput,
              fuelRate: fuelRateInput,
              totalFuel: totalFuelString,
              combustionEmissionFactor: FIXED_EMISSION_FACTOR_STRING,
            },
          }));
          setSuccessMessage("Equipment usage target saved.");
          return;
        }

        if (section === "fuelConsumption") {
          const values =
            sectionValues as TargetSectionValuesMap["fuelConsumption"];
          const totalDistanceInput = values.totalDistance.trim();
          const fuelEfficiencyInput = values.fuelEfficiency.trim();
          const normalizedDate = normalizeDateInput(
            values.date ?? "",
            "Target date"
          );

          const totalDistance = parseNumeric(
            totalDistanceInput,
            "Total distance"
          );
          const fuelEfficiency = parseNumeric(
            fuelEfficiencyInput,
            "Fuel efficiency"
          );
          const totalFuel = totalDistance * fuelEfficiency;
          const totalFuelString = totalFuel.toString();
          const fuelEmissionFactor = FIXED_EMISSION_FACTOR;

          const recordId = await saveTargetRecord(
            "fuelConsumption",
            {
              date: normalizedDate,
              totalDistance,
              fuelEfficiency,
              totalFuel,
              fuelEmissionFactor,
            },
            values.id ?? null
          );

          setTargets((prev) => ({
            ...prev,
            fuelConsumption: {
              id: recordId,
              timeframe: null,
              date: normalizedDate ?? "",
              totalDistance: totalDistanceInput,
              fuelEfficiency: fuelEfficiencyInput,
              totalFuel: totalFuelString,
              fuelEmissionFactor: FIXED_EMISSION_FACTOR_STRING,
            },
          }));
          setSuccessMessage("Fuel consumption target saved.");
          return;
        }

        if (section === "wasteGenerated") {
          const values =
            sectionValues as TargetSectionValuesMap["wasteGenerated"];
          const totalWasteMassInput = values.totalWasteMass.trim();
          const percentByTreatmentInput = values.percentByTreatment.trim();
          const emissionFactorInput = values.emissionFactor.trim();
          const normalizedDate = normalizeDateInput(
            values.date ?? "",
            "Target date"
          );

          const totalWasteMass = parseNumeric(
            totalWasteMassInput,
            "Total waste mass"
          );
          const percentByTreatment = parseNumeric(
            percentByTreatmentInput,
            "Percent by treatment"
          );
          const emissionFactor = parseNumeric(
            emissionFactorInput,
            "Emission factor"
          );

          const recordId = await saveTargetRecord(
            "wasteGenerated",
            {
              date: normalizedDate,
              totalWasteMass,
              percentByTreatment,
              emissionFactor,
            },
            values.id ?? null
          );

          setTargets((prev) => ({
            ...prev,
            wasteGenerated: {
              id: recordId,
              timeframe: null,
              date: normalizedDate ?? "",
              totalWasteMass: totalWasteMassInput,
              percentByTreatment: percentByTreatmentInput,
              emissionFactor: emissionFactorInput,
            },
          }));
          setSuccessMessage("Waste generated target saved.");
          return;
        }

        if (section === "waterSupply") {
          const values =
            sectionValues as TargetSectionValuesMap["waterSupply"];
          const totalWaterConsumedInput =
            values.totalWaterConsumed.trim();
          const waterSupplyEmissionFactorInput =
            values.waterSupplyEmissionFactor.trim();
          const normalizedDate = normalizeDateInput(
            values.date ?? "",
            "Target date"
          );

          const totalWaterConsumed = parseNumeric(
            totalWaterConsumedInput,
            "Total water consumed"
          );
          const waterSupplyEmissionFactor = parseNumeric(
            waterSupplyEmissionFactorInput,
            "Water supply emission factor"
          );

          const recordId = await saveTargetRecord(
            "waterSupply",
            {
              date: normalizedDate,
              totalWaterConsumed,
              waterSupplyEmissionFactor,
            },
            values.id ?? null
          );

          setTargets((prev) => ({
            ...prev,
            waterSupply: {
              id: recordId,
              timeframe: null,
              date: normalizedDate ?? "",
              totalWaterConsumed: totalWaterConsumedInput,
              waterSupplyEmissionFactor: waterSupplyEmissionFactorInput,
            },
          }));
          setSuccessMessage("Water supply target saved.");
          return;
        }

        if (section === "safetyIncident") {
          const values =
            sectionValues as TargetSectionValuesMap["safetyIncident"];
          const numberOfIncidentsInput = values.numberOfIncidents.trim();
          const totalEmployeeHoursInput = values.totalEmployeeHours.trim();
          const normalizedDate = normalizeDateInput(
            values.date ?? "",
            "Target date"
          );

          const numberOfIncidents = parseNumeric(
            numberOfIncidentsInput,
            "Number of incidents"
          );
          const totalEmployeeHours = parseNumeric(
            totalEmployeeHoursInput,
            "Total employee hours"
          );

          const recordId = await saveTargetRecord(
            "safetyIncident",
            {
              date: normalizedDate,
              numberOfIncidents,
              totalEmployeeHours,
            },
            values.id ?? null
          );

          setTargets((prev) => ({
            ...prev,
            safetyIncident: {
              id: recordId,
              timeframe: null,
              date: normalizedDate ?? "",
              numberOfIncidents: numberOfIncidentsInput,
              totalEmployeeHours: totalEmployeeHoursInput,
            },
          }));
          setSuccessMessage("Safety incident target saved.");
          return;
        }
      } catch (error) {
        console.error("Failed to save ESG target section", error);
        setErrorMessage(
          getErrorMessage(error, "Unable to save ESG target section.")
        );
      } finally {
        setSavingTargetSection(null);
      }
    },
    [
      buildPayloadForSection,
      ensureColumnMetadataLoaded,
      project?.id,
      projectDetails?.id,
      resetFeedback,
    ]
  );

  const handleTargetsError = useCallback((message: string) => {
    setErrorMessage(message);
  }, []);

  const saveProjectSetup = useCallback(
    async (values: Step1FormValues, goToNext: boolean) => {
      if (!userId) {
        setErrorMessage("You must be signed in to save project setup details.");
        return;
      }

      resetFeedback();
      setIsSavingStep1(true);

      try {
        const setupId = projectSetupId ?? crypto.randomUUID();
        const storage = supabase.storage.from("preconstruction-docs");

        const ensureUniqueProjectSlug = async () => {
          if (!projectDetails?.id) {
            return null;
          }

          const baseSlug =
            generateSlug(values.projectName) ||
            projectDetails.slug ||
            buildSlugFallback(projectDetails.id);

          const { data, error } = await supabase
            .from("projects")
            .select("project_id, slug")
            .ilike("slug", `${baseSlug}%`);

          if (error) {
            throw error;
          }

          const slugRows = (data ?? []) as Array<{
            project_id: string | null;
            slug: string | null;
          }>;

          const conflictingSlugs = slugRows
            .filter(
              (row) =>
                row.project_id !== projectDetails.id &&
                typeof row.slug === "string"
            )
            .map((row) => row.slug as string);

          if (!conflictingSlugs.includes(baseSlug)) {
            return baseSlug;
          }

          let suffix = 2;
          let candidate = `${baseSlug}-${suffix}`;
          while (conflictingSlugs.includes(candidate)) {
            suffix += 1;
            candidate = `${baseSlug}-${suffix}`;
          }

          return candidate;
        };

        const uploads = await Promise.all(
          (
            Object.entries(values.files) as [
              DocumentKey,
              File | null | undefined
            ][]
          )
            .filter(([, file]) => !!file)
            .map(async ([key, file]) => {
              const extension = file!.name.split(".").pop() || "pdf";
              const filePath = `project/${setupId}/compliance/${key}.${extension}`;
              const { error: uploadError } = await storage.upload(
                filePath,
                file!,
                {
                  contentType: file!.type || "application/pdf",
                  upsert: true,
                }
              );
              if (uploadError) {
                throw uploadError;
              }
              return [key, filePath] as const;
            })
        );

        const nextDocPaths: DocumentPathMap = { ...documentPaths };
        uploads.forEach(([key, path]) => {
          nextDocPaths[key] = path;
        });

        const trimmedProjectName = values.projectName.trim();
        const trimmedProjectAddress = values.projectAddress.trim();
        const trimmedProjectDescription = values.projectDescription.trim();
        const trimmedProjectManager = values.projectManager.trim();
        const trimmedStartDate = values.startDate
          ? values.startDate.trim()
          : "";
        const trimmedEndDate = values.endDate
          ? values.endDate.trim()
          : "";
        const normalizedStatus = values.status;
        const normalizedPriority = values.priority;
        const trimmedClientName = values.clientName.trim();
        const trimmedCategory = values.category.trim();
        const trimmedBudgetInput = values.budget.trim();

        const parsedBudget =
          trimmedBudgetInput.length > 0 ? Number(trimmedBudgetInput) : null;

        if (
          trimmedBudgetInput.length > 0 &&
          Number.isNaN(parsedBudget)
        ) {
          throw new Error("Budget must be a valid number.");
        }

        const projectIdForSetup = projectDetails?.id ?? project?.id;

        if (!projectIdForSetup) {
          throw new Error(
            "Project context is missing. Reload the page and try again."
          );
        }

        const payload = {
          user_id: userId,
          project_id: projectIdForSetup,
          project_name: trimmedProjectName,
          project_address: trimmedProjectAddress,
          project_description: trimmedProjectDescription,
          sec_dti_path: nextDocPaths["sec-dti"] ?? null,
          mayors_permit_path: nextDocPaths["mayors-permit"] ?? null,
          bir_registration_path: nextDocPaths.bir ?? null,
        };

        if (projectSetupId) {
          const { error } = await supabase
            .from("preconstruction_project_setup")
            .update(payload)
            .eq("id", projectSetupId);

          if (error) {
            throw error;
          }
        } else {
          const { data, error } = await supabase
            .from("preconstruction_project_setup")
            .insert([{ id: setupId, ...payload }])
            .select("id")
            .single();

          if (error) {
            throw error;
          }
          setProjectSetupId(data.id);
        }

        let nextProjectState: Project | null = null;

        if (projectDetails?.id) {
          const nextSlug = await ensureUniqueProjectSlug();
          const updates: Record<string, string | number | null> = {};

          if (projectDetails.name !== trimmedProjectName) {
            updates.project_name = trimmedProjectName;
          }

          if (projectDetails.location !== trimmedProjectAddress) {
            updates.location = trimmedProjectAddress;
          }

          const incomingDescription = trimmedProjectDescription || null;
          if ((projectDetails.description ?? null) !== incomingDescription) {
            updates.description = incomingDescription;
          }

          if (projectDetails.status !== normalizedStatus) {
            updates.status = normalizedStatus;
          }

          if (projectDetails.priority !== normalizedPriority) {
            updates.priority = normalizedPriority;
          }

          const incomingClientName = trimmedClientName || null;
          if ((projectDetails.clientName ?? null) !== incomingClientName) {
            updates.client_name = incomingClientName;
          }

          const incomingCategory = trimmedCategory || null;
          if ((projectDetails.category ?? null) !== incomingCategory) {
            updates.category = incomingCategory;
          }

          if (
            (projectDetails.budget ?? null) !==
            (parsedBudget === null ? null : parsedBudget)
          ) {
            updates.budget = parsedBudget;
          }

          if (nextSlug && nextSlug !== projectDetails.slug) {
            updates.slug = nextSlug;
          }

          if (Object.keys(updates).length > 0) {
            const { data: updatedProjectRow, error: projectUpdateError } =
              await supabase
                .from("projects")
                .update(updates)
                .eq("project_id", projectDetails.id)
                .select(
                  "project_id, organization_id, project_name, slug, description, status, priority, category, client_name, location, budget, created_at, updated_at"
                )
                .maybeSingle();

            if (projectUpdateError) {
              throw projectUpdateError;
            }

            if (!updatedProjectRow) {
              throw new Error(
                "Project could not be updated. Check permissions or that the project still exists."
              );
            }

            const mappedProject = mapProjectFromSupabase(updatedProjectRow);
            nextProjectState = mappedProject;
            setProjectDetails(mappedProject);
          } else {
            nextProjectState = {
              ...projectDetails,
              name: trimmedProjectName,
              location: trimmedProjectAddress,
              description: trimmedProjectDescription || null,
              status: normalizedStatus,
              priority: normalizedPriority,
              clientName: trimmedClientName || null,
              category: trimmedCategory || null,
              budget: parsedBudget,
              projectManager: trimmedProjectManager || null,
              startDate: trimmedStartDate || null,
              endDate: trimmedEndDate || null,
            };
            setProjectDetails(nextProjectState);
          }
        }

        setDocumentPaths(nextDocPaths);
        setStep1Values({
          projectName: trimmedProjectName,
          projectAddress: trimmedProjectAddress,
          projectDescription: trimmedProjectDescription,
          status: normalizedStatus,
          priority: normalizedPriority,
          projectManager: trimmedProjectManager,
          startDate: trimmedStartDate,
          endDate: trimmedEndDate,
          clientName: trimmedClientName,
          category: trimmedCategory,
          budget: trimmedBudgetInput,
          documentPaths: nextDocPaths,
        });

        if (nextProjectState) {
          onProjectUpdated?.(nextProjectState);
        }

        setSuccessMessage("Project details saved.");
        if (goToNext) {
          nextStep();
        }
      } catch (error) {
        console.error("Failed to save project setup", error);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to save project setup."
        );
      } finally {
        setIsSavingStep1(false);
      }
    },
    [
      documentPaths,
      nextStep,
      onProjectUpdated,
      project?.id,
      projectDetails,
      projectSetupId,
      resetFeedback,
      userId,
    ]
  );

  const handleStep1Submit = useCallback(
    (values: Step1FormValues) => saveProjectSetup(values, true),
    [saveProjectSetup]
  );

  const handleStep1Save = useCallback(
    (values: Step1FormValues) => saveProjectSetup(values, false),
    [saveProjectSetup]
  );

  const handleSubmitForApproval = useCallback(async () => {
    if (!userId) {
      throw new Error("You must be signed in to submit for approval.");
    }

    if (!projectSetupId) {
      throw new Error(
        "Save project setup details before submitting for approval."
      );
    }

    resetFeedback();
    setIsSubmittingForApproval(true);

    try {
      const updates: Record<string, unknown> = {
        submitted_for_approval_at: new Date().toISOString(),
        approval_status: "pending",
      };

      if (!supportsSubmittedAtColumn) {
        delete updates.submitted_for_approval_at;
      }

      if (!supportsApprovalStatusColumn) {
        delete updates.approval_status;
      }

      if (Object.keys(updates).length === 0) {
        setSubmittedForApprovalAt(new Date().toISOString());
        setSuccessMessage("Submitted for approval.");
        return;
      }

      const { error } = await supabase
        .from("preconstruction_project_setup")
        .update(updates)
        .eq("id", projectSetupId)
        .eq("user_id", userId);

      if (error) {
        throw error;
      }

      setSubmittedForApprovalAt(
        supportsSubmittedAtColumn
          ? (updates.submitted_for_approval_at as string)
          : new Date().toISOString()
      );
      setSuccessMessage("Submitted for approval.");
    } catch (error) {
      console.error("Failed to submit for approval", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to submit for approval right now."
      );
      throw error instanceof Error
        ? error
        : new Error("Unable to submit for approval right now.");
    } finally {
      setIsSubmittingForApproval(false);
    }
  }, [
    projectSetupId,
    resetFeedback,
    supportsApprovalStatusColumn,
    supportsSubmittedAtColumn,
    userId,
  ]);

  const handleAddMaterial = useCallback(
    async (material: MaterialDraftInput, specSheet?: File | null) => {
      if (!projectSetupId) {
        setErrorMessage("Save project setup before adding sourcing materials.");
        return;
      }

      resetFeedback();

      if (
        !material.category ||
        !material.name ||
        !material.supplier ||
        !material.cost ||
        !material.unit ||
        !material.status
      ) {
        setErrorMessage("Please complete the material details before saving.");
        return;
      }

      setIsSavingMaterial(true);

      try {
        const parsedCost = Number(material.cost);
        if (!Number.isFinite(parsedCost)) {
          throw new Error("Budgeted cost must be a number.");
        }

        let specSheetPath: string | null = null;

        if (specSheet) {
          const extension = specSheet.name.split(".").pop() || "pdf";
          const fileName = `spec-${crypto.randomUUID()}.${extension}`;
          const storagePath = `project/${projectSetupId}/materials/${fileName}`;
          const { error } = await supabase.storage
            .from("preconstruction-docs")
            .upload(storagePath, specSheet, {
              contentType: specSheet.type || "application/pdf",
              upsert: true,
            });

          if (error) {
            throw error;
          }

          specSheetPath = storagePath;
        }

        const { data, error } = await supabase
          .from("preconstruction_material")
          .insert([
            {
              project_setup_id: projectSetupId,
              material_category: material.category,
              planned_supplier: material.supplier,
              material_name: material.name,
              warehouse_of_the_supplier:
                material.warehouse && material.warehouse.trim().length > 0
                  ? material.warehouse
                  : null,
              budgeted_cost: parsedCost,
              unit: material.unit,
              sustainability_credentials: material.credentials ?? null,
              supplier_vetting_notes: material.notes,
              spec_sheet_path: specSheetPath,
              vetting_status: material.status,
            },
          ])
          .select(
            "id, material_category, planned_supplier, material_name, warehouse_of_the_supplier, budgeted_cost, unit, sustainability_credentials, supplier_vetting_notes, spec_sheet_path, vetting_status"
          )
          .single();

        if (error) {
          throw error;
        }

        setMaterials((prev) => [
          ...prev,
          {
            id: data.id,
            category: data.material_category,
            name: data.material_name,
            supplier: data.planned_supplier,
            cost:
              data.budgeted_cost !== null && data.budgeted_cost !== undefined
                ? data.budgeted_cost.toString()
                : "",
            unit: data.unit ?? undefined,
            notes: data.supplier_vetting_notes ?? "",
            credentials: data.sustainability_credentials ?? undefined,
            status: data.vetting_status,
            warehouse: data.warehouse_of_the_supplier ?? undefined,
            specSheetPath: data.spec_sheet_path ?? undefined,
          },
        ]);
      } catch (error) {
        if (isMissingRelationError(error)) {
          console.warn(
            "Skipping sourcing material save because the related table is not configured."
          );
          return;
        }
        console.error("Failed to add material", error);
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to add material."
        );
      } finally {
        setIsSavingMaterial(false);
      }
    },
    [projectSetupId, resetFeedback]
  );

  const handleDeleteMaterial = useCallback(
    async (materialId: string) => {
      if (!projectSetupId) {
        setErrorMessage(
          "Save project setup before modifying sourcing materials."
        );
        return;
      }

      resetFeedback();
      setDeletingMaterialId(materialId);

      try {
        const { error } = await supabase
          .from("preconstruction_material")
          .delete()
          .eq("id", materialId)
          .eq("project_setup_id", projectSetupId);

        if (error) {
          throw error;
        }

        setMaterials((prev) =>
          prev.filter((material) => material.id !== materialId)
        );
      } catch (error) {
        if (isMissingRelationError(error)) {
          console.warn(
            "Skipping sourcing material delete because the related table is not configured."
          );
          return;
        }
        console.error("Failed to delete material", error);
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to delete material."
        );
      } finally {
        setDeletingMaterialId(null);
      }
    },
    [projectSetupId, resetFeedback]
  );

  const step1InitialValues = useMemo<Step1InitialValues>(
    () => ({
      ...DEFAULT_STEP1_VALUES,
      ...step1Values,
    }),
    [step1Values]
  );

  const savedTargetCount = useMemo(
    () => Object.values(targets).filter(Boolean).length,
    [targets]
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
        Loading pre-construction data...
      </div>
    );
  }

  const activeStep = STEP_DEFINITIONS.find((item) => item.id === step);

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}
      <div className="rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white/80 dark:bg-gray-900/60 p-4 space-y-3">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-200">
            {activeStep
              ? `Currently on: ${activeStep.title}`
              : "Pre-construction workflow"}
          </p>
          <p className="text-sm text-muted-foreground">
            Complete each step in order. Your progress saves automatically after
            each section.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span>{savedTargetCount} ESG target{savedTargetCount === 1 ? "" : "s"} saved</span>
          <span className="hidden h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-700 sm:inline-flex" />
          <span>{materials.length} materials tracked</span>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[280px_1fr] lg:items-start lg:gap-6 space-y-6 lg:space-y-0">
        <div className="space-y-4 lg:sticky lg:top-24">
          <StepIndicator currentStep={step} />
          <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/70 dark:bg-emerald-900/30 p-4 text-sm space-y-2">
            <p className="font-semibold text-emerald-800 dark:text-emerald-100">
              Quick tip
            </p>
            {step === 1 && (
              <p className="text-emerald-900/80 dark:text-emerald-100/80">
                Keep names short and confirm compliance files in the
                Organization tab so reviews move faster.
              </p>
            )}
            {step === 2 && (
              <p className="text-emerald-900/80 dark:text-emerald-100/80">
                Tie each ESG target to a measurable KPI, then match sourcing
                notes that support it.
              </p>
            )}
            {step === 3 && (
              <p className="text-emerald-900/80 dark:text-emerald-100/80">
                Scan for missing costs or vetting notes before submitting for
                approval.
              </p>
            )}
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 text-xs text-muted-foreground space-y-2">
            <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
              Need to pause?
            </p>
            <p>
              Your progress is saved locally after each step. You can return
              later from the project overview.
            </p>
          </div>
        </div>
        <div className="space-y-6">
          {step === 1 && (
            <Step1ProjectSetup
              onSubmit={handleStep1Submit}
              onSave={handleStep1Save}
              initialValues={step1InitialValues}
              isSubmitting={isSavingStep1}
            />
          )}
          {step === 2 && (
            <Step2TargetSetting
              onNext={nextStep}
              onBack={prevStep}
              onAddMaterial={handleAddMaterial}
              onDeleteMaterial={handleDeleteMaterial}
              projectId={projectDetails?.id ?? project?.id ?? null}
              targets={targets}
              onSaveTargetSection={handleSaveTargetSection}
              savingSection={savingTargetSection}
              onError={handleTargetsError}
              onResetFeedback={resetFeedback}
              materials={materials}
              isSavingMaterial={isSavingMaterial}
              deletingMaterialId={deletingMaterialId}
            />
          )}
          {step === 3 && (
            <Step3ReviewPlans
              onBack={prevStep}
              onSubmitApproval={handleSubmitForApproval}
              isSubmitting={isSubmittingForApproval}
              materials={materials}
              targets={targets}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default PreConstructionPhase;
