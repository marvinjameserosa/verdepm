"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Step1ProjectSetup from "./preconstruction/step1-project-setup";
import Step2TargetSetting from "./preconstruction/step2-target-setting";
import Step3ReviewPlans from "./preconstruction/step3-review-plans";
import { type Material, type MaterialStatus } from "./preconstruction/types";

import type { Project } from "@/types/project";
import {
  type DocumentKey,
  type ExistingFileState,
  type Step1FormValues,
} from "@/types/forms";
import {
  getPreconstructionData,
  getTargetColumnMetadata,
} from "@/actions/preconstruction/fetch";
import {
  ensureUniqueProjectSlug,
  saveProjectSetup as saveProjectSetupAction,
  submitForApproval,
} from "@/actions/preconstruction/setup";
import { saveTarget } from "@/actions/preconstruction/targets";
import {
  addMaterial,
  deleteMaterial,
} from "@/actions/preconstruction/materials";
import {
  type TargetSectionKey,
  type TargetSectionValuesMap,
  type PreConstructionPhaseProps,
  type Step1InitialValues,
  type DocumentPathMap,
  type ColumnMapping,
  type SectionConfig,
  type ColumnDescriptor,
  type ColumnInfo,
  type ProjectEsgTargets,
} from "@/types/preconstruction";
import { isMissingRelationError } from "@/lib/supabase/errors";

import {
  createEmptyTargets,
  getDefaultStep1Values,
  buildDefaultColumnMapping,
  selectColumnName,
  isMissingColumnError,
  isForeignKeyTimeframeError,
  getErrorMessage,
  toStringOrEmpty,
  hasAnyValue,
  normalizeDateInput,
  formatDateForInput,
  parseNumeric,
  generateSlug,
  buildSlugFallback,
  STEP_DEFINITIONS,
  TARGET_SECTION_CONFIG,
  MISSING_TABLE_MESSAGES,
  DEFAULT_STEP1_VALUES,
  FIXED_EMISSION_FACTOR,
  FIXED_EMISSION_FACTOR_STRING,
} from "@/lib/preconstruction";
import { StepIndicator } from "./preconstruction/step-indicator";
import { uploadProjectFile } from "@/actions/preconstruction/storage";

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

    try {
      const metadata = await getTargetColumnMetadata();

      Object.entries(metadata).forEach(([table, columns]) => {
        updatedTypes[table] = columns;
      });

      // Update column mapping based on metadata
      (
        Object.entries(TARGET_SECTION_CONFIG) as Array<
          [TargetSectionKey, SectionConfig]
        >
      ).forEach(([section, config]) => {
        if (!metadata[config.table]) return;

        const columns = Object.entries(metadata[config.table]).map(
          ([name, dataType]) => ({
            name,
            lower: name.toLowerCase(),
            dataType,
          })
        );

        const available: ColumnInfo[] = columns.map((c) => ({
          name: c.name,
          lower: c.lower,
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
      });

      columnTypesRef.current = updatedTypes;
    } catch (error) {
      console.warn("Failed to load target column metadata", error);
    }
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
        user,
        setup,
        materials,
        targets,
        project: fetchedProject,
      } = await getPreconstructionData(project.id);

      if (fetchedProject) {
        setProjectDetails(fetchedProject);
        // Avoid calling onProjectUpdated here to prevent infinite refresh loops
        // onProjectUpdated?.(fetchedProject);
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

      // Use project ID as setup ID since we streamlined the tables
      const currentProject = fetchedProject || project;
      setProjectSetupId(currentProject.id);

      const nextDocPaths: DocumentPathMap = {};
      setDocumentPaths(nextDocPaths);

      setStep1Values({
        projectName: currentProject?.name ?? DEFAULT_STEP1_VALUES.projectName,
        projectAddress:
          currentProject?.location ?? DEFAULT_STEP1_VALUES.projectAddress,
        projectDescription:
          currentProject?.description ??
          DEFAULT_STEP1_VALUES.projectDescription,
        status: currentProject?.status ?? DEFAULT_STEP1_VALUES.status,
        priority: currentProject?.priority ?? DEFAULT_STEP1_VALUES.priority,
        startDate: currentProject?.startDate ?? DEFAULT_STEP1_VALUES.startDate,
        endDate: currentProject?.endDate ?? DEFAULT_STEP1_VALUES.endDate,
        clientName:
          currentProject?.clientName ?? DEFAULT_STEP1_VALUES.clientName,
        category: currentProject?.category ?? DEFAULT_STEP1_VALUES.category,
        budget:
          currentProject?.budget !== undefined &&
          currentProject?.budget !== null
            ? currentProject.budget.toString()
            : DEFAULT_STEP1_VALUES.budget,
        documentPaths: nextDocPaths,
      });

      const mappedMaterials: Material[] = materials.map((materialRow: any) => ({
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
        credentials: materialRow.sustainability_credentials ?? undefined,
        status: materialRow.vetting_status,
        warehouse: materialRow.warehouse_of_the_supplier ?? undefined,
        specSheetPath: materialRow.spec_sheet_path ?? undefined,
      }));
      setMaterials(mappedMaterials);

      if (targets) {
        const nextTargets = createEmptyTargets();

        // Process targets using helper function to avoid repetition
        const processTarget = (section: TargetSectionKey, data: any) => {
          if (!data) return;
          registerColumnsFromRecord(section, data);

          // Map fields based on section type
          if (section === "electricityUsage") {
            const timeframe = toStringOrEmpty(
              data.timeframe ?? data.target_timeframe ?? ""
            );
            const targetDate = formatDateForInput(
              data.date ?? data.target_date
            );
            const totalElectricityConsumed = toStringOrEmpty(
              data.total_electricity_consumed ??
                data.totalElectricityConsumed ??
                ""
            );

            if (hasAnyValue(timeframe, totalElectricityConsumed, targetDate)) {
              nextTargets.electricityUsage = {
                id: String(data.id),
                timeframe: timeframe || null,
                date: targetDate,
                totalElectricityConsumed,
              };
            }
          } else if (section === "equipmentUsage") {
            const timeframe = toStringOrEmpty(
              data.timeframe ?? data.target_timeframe ?? ""
            );
            const targetDate = formatDateForInput(
              data.date ?? data.target_date
            );
            const equipmentOperationLogs = toStringOrEmpty(
              data.equipment_operation_logs ?? data.equipmentOperationLogs ?? ""
            );
            const fuelRate = toStringOrEmpty(
              data.fuel_rate ?? data.fuelRate ?? ""
            );
            const totalFuel = toStringOrEmpty(
              data.total_fuel ?? data.totalFuel ?? ""
            );
            const combustionEmissionFactor =
              toStringOrEmpty(
                data.combustion_emission_factor ??
                  data.combustionEmissionFactor ??
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
                id: String(data.id),
                timeframe: timeframe || null,
                date: targetDate,
                equipmentOperationLogs,
                fuelRate,
                totalFuel,
                combustionEmissionFactor,
              };
            }
          } else if (section === "fuelConsumption") {
            const timeframe = toStringOrEmpty(
              data.timeframe ?? data.target_timeframe ?? ""
            );
            const targetDate = formatDateForInput(
              data.date ?? data.target_date
            );
            const totalDistance = toStringOrEmpty(
              data.total_distance ?? data.totalDistance ?? ""
            );
            const fuelEfficiency = toStringOrEmpty(
              data.fuel_efficiency ?? data.fuelEfficiency ?? ""
            );
            const rawTotalFuel = toStringOrEmpty(
              data.total_fuel ?? data.totalFuel ?? ""
            );
            const fuelEmissionFactor =
              toStringOrEmpty(
                data.fuel_emission_factor ?? data.fuelEmissionFactor ?? ""
              ) || FIXED_EMISSION_FACTOR_STRING;

            // Recompute total fuel if missing but components exist
            let computedTotalFuel = rawTotalFuel;
            if (!computedTotalFuel && totalDistance && fuelEfficiency) {
              const dist = parseFloat(totalDistance);
              const eff = parseFloat(fuelEfficiency);
              if (!isNaN(dist) && !isNaN(eff)) {
                computedTotalFuel = (dist * eff).toString();
              }
            }

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
                id: String(data.id),
                timeframe: timeframe || null,
                date: targetDate,
                totalDistance,
                fuelEfficiency,
                totalFuel: computedTotalFuel,
                fuelEmissionFactor,
              };
            }
          } else if (section === "wasteGenerated") {
            const timeframe = toStringOrEmpty(
              data.timeframe ?? data.target_timeframe ?? ""
            );
            const targetDate = formatDateForInput(
              data.date ?? data.target_date
            );
            const totalWasteMass = toStringOrEmpty(
              data.total_waste_mass ?? data.totalWasteMass ?? ""
            );
            const percentByTreatment = toStringOrEmpty(
              data.percent_by_treatment ?? data.percentByTreatment ?? ""
            );
            const emissionFactor = toStringOrEmpty(
              data.emission_factor ?? data.emissionFactor ?? ""
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
                id: String(data.id),
                timeframe: timeframe || null,
                date: targetDate,
                totalWasteMass,
                percentByTreatment,
                emissionFactor,
              };
            }
          } else if (section === "waterSupply") {
            const timeframe = toStringOrEmpty(
              data.timeframe ?? data.target_timeframe ?? ""
            );
            const targetDate = formatDateForInput(
              data.date ?? data.target_date
            );
            const totalWaterConsumed = toStringOrEmpty(
              data.total_water_consumed ?? data.totalWaterConsumed ?? ""
            );
            const waterSupplyEmissionFactor = toStringOrEmpty(
              data.water_supply_emission_factor ??
                data.waterSupplyEmissionFactor ??
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
                id: String(data.id),
                timeframe: timeframe || null,
                date: targetDate,
                totalWaterConsumed,
                waterSupplyEmissionFactor,
              };
            }
          } else if (section === "safetyIncident") {
            const timeframe = toStringOrEmpty(
              data.timeframe ?? data.target_timeframe ?? ""
            );
            const targetDate = formatDateForInput(
              data.date ?? data.target_date
            );
            const numberOfIncidents = toStringOrEmpty(
              data.number_of_incidents ?? data.numberOfIncidents ?? ""
            );
            const totalEmployeeHours = toStringOrEmpty(
              data.total_employee_hours ?? data.totalEmployeeHours ?? ""
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
                id: String(data.id),
                timeframe: timeframe || null,
                date: targetDate,
                numberOfIncidents,
                totalEmployeeHours,
              };
            }
          }
        };

        processTarget("electricityUsage", targets.electricityUsage);
        processTarget("equipmentUsage", targets.equipmentUsage);
        processTarget("fuelConsumption", targets.fuelConsumption);
        processTarget("wasteGenerated", targets.wasteGenerated);
        processTarget("waterSupply", targets.waterSupply);
        processTarget("safetyIncident", targets.safetyIncident);

        setTargets(nextTargets);
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

      let message = "Failed to load data.";

      if (error instanceof Error) {
        message = error.message;
        // Try to parse if it looks like a JSON stringified Supabase error
        if (message.startsWith("{") && message.includes('"message":')) {
          try {
            const parsed = JSON.parse(message);
            if (parsed.message) {
              message = parsed.message;
            }
          } catch (e) {
            // ignore parse error
          }
        }
      } else if (typeof error === "string") {
        message = error;
      } else if (error && typeof error === "object" && "message" in error) {
        message = String((error as { message: unknown }).message);
      }

      setErrorMessage(message);
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
        startDate:
          prev.startDate ??
          project?.startDate ??
          DEFAULT_STEP1_VALUES.startDate,
        endDate:
          prev.endDate ?? project?.endDate ?? DEFAULT_STEP1_VALUES.endDate,
        clientName:
          prev.clientName ??
          project?.clientName ??
          DEFAULT_STEP1_VALUES.clientName,
        category:
          prev.category ?? project?.category ?? DEFAULT_STEP1_VALUES.category,
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

          try {
            const recordId = await saveTarget(
              targetSection,
              activeProjectId,
              mappedValues,
              currentId
            );
            return recordId;
          } catch (error) {
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
        };

        return persist(existingId, false);
      };

      try {
        if (section === "electricityUsage") {
          const values =
            sectionValues as TargetSectionValuesMap["electricityUsage"];
          const totalElectricityInput = values.totalElectricityConsumed.trim();
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
          const values = sectionValues as TargetSectionValuesMap["waterSupply"];
          const totalWaterConsumedInput = values.totalWaterConsumed.trim();
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
        const projectIdForSetup = projectDetails?.id ?? project?.id;
        const setupId =
          projectSetupId ?? projectIdForSetup ?? crypto.randomUUID();

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

              const formData = new FormData();
              formData.append("file", file!);
              formData.append("path", filePath);

              const { error: uploadError } = await uploadProjectFile(formData);

              if (uploadError) {
                throw new Error(uploadError);
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
        const trimmedStartDate = values.startDate
          ? values.startDate.trim()
          : "";
        const trimmedEndDate = values.endDate ? values.endDate.trim() : "";
        const normalizedStatus = values.status;
        const normalizedPriority = values.priority;
        const trimmedClientName = values.clientName.trim();
        const trimmedCategory = values.category.trim();
        const trimmedBudgetInput = values.budget.trim();

        const parsedBudget =
          trimmedBudgetInput.length > 0 ? Number(trimmedBudgetInput) : null;

        if (trimmedBudgetInput.length > 0 && Number.isNaN(parsedBudget)) {
          throw new Error("Budget must be a valid number.");
        }

        if (!projectIdForSetup) {
          throw new Error(
            "Project context is missing. Reload the page and try again."
          );
        }

        // Calculate project updates
        const updates: Record<string, string | number | null> = {};
        const serverUpdates: Record<string, string | number | null> = {};
        let nextSlug: string | null = null;

        if (projectDetails?.id) {
          // Check slug uniqueness on server
          nextSlug = await ensureUniqueProjectSlug(
            trimmedProjectName,
            projectDetails.id,
            projectDetails.slug
          );

          if (projectDetails.name !== trimmedProjectName) {
            updates.name = trimmedProjectName;
            serverUpdates.project_name = trimmedProjectName;
          }
          if (projectDetails.location !== trimmedProjectAddress) {
            updates.location = trimmedProjectAddress;
            serverUpdates.location = trimmedProjectAddress;
          }
          if (
            (projectDetails.description ?? null) !==
            (trimmedProjectDescription || null)
          ) {
            updates.description = trimmedProjectDescription || null;
            serverUpdates.description = trimmedProjectDescription || null;
          }
          if (projectDetails.status !== normalizedStatus) {
            updates.status = normalizedStatus;
            serverUpdates.status = normalizedStatus;
          }
          if (projectDetails.priority !== normalizedPriority) {
            updates.priority = normalizedPriority;
            serverUpdates.priority = normalizedPriority;
          }
          if (
            (projectDetails.clientName ?? null) !== (trimmedClientName || null)
          ) {
            updates.clientName = trimmedClientName || null;
            serverUpdates.client_name = trimmedClientName || null;
          }
          if ((projectDetails.category ?? null) !== (trimmedCategory || null)) {
            updates.category = trimmedCategory || null;
            serverUpdates.category = trimmedCategory || null;
          }
          if ((projectDetails.budget ?? null) !== parsedBudget) {
            updates.budget = parsedBudget;
            serverUpdates.budget = parsedBudget;
          }
          if (nextSlug && nextSlug !== projectDetails.slug) {
            updates.slug = nextSlug;
            serverUpdates.slug = nextSlug;
          }

          if (trimmedStartDate !== projectDetails.startDate) {
            updates.startDate = trimmedStartDate;
            serverUpdates.start_date = trimmedStartDate;
          }
          if (trimmedEndDate !== projectDetails.endDate) {
            updates.endDate = trimmedEndDate;
            serverUpdates.end_date = trimmedEndDate;
          }
        }

        const { setupId: savedSetupId } = await saveProjectSetupAction(
          userId,
          projectIdForSetup,
          serverUpdates
        );

        setProjectSetupId(savedSetupId);

        // Update local project details state if we have updates
        if (projectDetails && Object.keys(updates).length > 0) {
          const nextProjectState = { ...projectDetails, ...updates } as Project;
          setProjectDetails(nextProjectState);
          onProjectUpdated?.(nextProjectState);
        }

        setDocumentPaths(nextDocPaths);
        setStep1Values({
          projectName: trimmedProjectName,
          projectAddress: trimmedProjectAddress,
          projectDescription: trimmedProjectDescription,
          status: normalizedStatus,
          priority: normalizedPriority,
          startDate: trimmedStartDate,
          endDate: trimmedEndDate,
          clientName: trimmedClientName,
          category: trimmedCategory,
          budget: trimmedBudgetInput,
          documentPaths: nextDocPaths,
        });

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

      await submitForApproval(userId, projectSetupId, updates);

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

          const formData = new FormData();
          formData.append("file", specSheet);
          formData.append("path", storagePath);

          const { error } = await uploadProjectFile(formData);

          if (error) {
            console.warn("Failed to upload spec sheet", error);
            // Continue even if upload fails
          } else {
            specSheetPath = storagePath;
          }
        }

        const data = await addMaterial(projectSetupId, {
          ...material,
          cost: parsedCost,
          specSheetPath,
        });

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
        await deleteMaterial(materialId, projectSetupId);

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
          <span>
            {savedTargetCount} ESG target{savedTargetCount === 1 ? "" : "s"}{" "}
            saved
          </span>
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
