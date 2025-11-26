"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GanttChartSquare, Layers, Target } from "lucide-react";
import Step1ProjectSetup from "./preconstruction/step1-project-setup";
import Step2TargetSetting from "./preconstruction/step2-target-setting";
import Step3MaterialSourcing from "./preconstruction/step3-material-sourcing";
import Step4ReviewPlans from "./preconstruction/step4-review-plans";
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
import { saveSimplifiedTargets } from "@/actions/preconstruction/save-targets";
import {
  saveTarget,
  saveProjectTarget,
} from "@/actions/preconstruction/targets";
import {
  addMaterialSourcing,
  deleteMaterialSourcing,
} from "@/actions/preconstruction/material-sourcing";
import { updateMaterialSourcing } from "@/actions/preconstruction/update-material";
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
  type ProjectTargets,
} from "@/types/preconstruction";
import { isMissingRelationError } from "@/lib/supabase/errors";

import {
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ConfirmationVariant =
  | "step1Save"
  | "step1Next"
  | "step2Save"
  | "step3Add"
  | "step3Update";

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
  const [targets, setTargets] = useState<ProjectTargets | null>(null);
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
  const [isSavingTargets, setIsSavingTargets] = useState(false);
  const [isSubmittingForApproval, setIsSubmittingForApproval] = useState(false);
  const [, setSubmittedForApprovalAt] = useState<string | null>(null);
  const supportsSubmittedAtColumn = false;
  const supportsApprovalStatusColumn = false;
  const [confirmationVariant, setConfirmationVariant] =
    useState<ConfirmationVariant | null>(null);
  const [modalContext, setModalContext] = useState<{ materialName?: string }>({});
  const [pendingStepAction, setPendingStepAction] =
    useState<(() => void) | null>(null);

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

  const nextStep = useCallback(() => setStep((s) => Math.min(s + 1, 4)), []);
  const prevStep = useCallback(() => setStep((s) => Math.max(s - 1, 1)), []);
  const handleModalClose = useCallback(() => {
    setConfirmationVariant(null);
    setModalContext({});
    setPendingStepAction(null);
  }, []);

  const handleModalConfirm = useCallback(() => {
    if (confirmationVariant === "step1Next" && pendingStepAction) {
      pendingStepAction();
    }
    handleModalClose();
  }, [confirmationVariant, pendingStepAction, handleModalClose]);

  const resetFeedback = useCallback(() => {
    setErrorMessage(null);
    setSuccessMessage(null);
    handleModalClose();
  }, [handleModalClose]);

  const loadData = useCallback(async () => {
    if (!project?.id) {
      setProjectSetupId(null);
      setStep1Values(getDefaultStep1Values(project));
      setDocumentPaths({});
      setMaterials([]);
      setTargets(null);
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
        // onProjectUpdated?.(fetchedProject);
      }

      if (!user) {
        setUserId(null);
        setProjectSetupId(null);
        setStep1Values(getDefaultStep1Values(project));
        setDocumentPaths({});
        setMaterials([]);
        setTargets(null);
        return;
      }

      setUserId(user.id);

      // Use project ID as setup ID since we streamlined the tables
      setProjectSetupId(project.id);

      const nextDocPaths: DocumentPathMap = {};
      setDocumentPaths(nextDocPaths);

      const effectiveProject = fetchedProject || project;

      setStep1Values({
        projectName: effectiveProject?.name ?? DEFAULT_STEP1_VALUES.projectName,
        projectAddress:
          effectiveProject?.location ?? DEFAULT_STEP1_VALUES.projectAddress,
        projectDescription:
          effectiveProject?.description ??
          DEFAULT_STEP1_VALUES.projectDescription,
        status: effectiveProject?.status ?? DEFAULT_STEP1_VALUES.status,
        priority: effectiveProject?.priority ?? DEFAULT_STEP1_VALUES.priority,
        startDate:
          effectiveProject?.startDate ?? DEFAULT_STEP1_VALUES.startDate,
        endDate: effectiveProject?.endDate ?? DEFAULT_STEP1_VALUES.endDate,
        clientName:
          effectiveProject?.clientName ?? DEFAULT_STEP1_VALUES.clientName,
        category: effectiveProject?.category ?? DEFAULT_STEP1_VALUES.category,
        budget:
          effectiveProject?.budget !== undefined &&
          effectiveProject?.budget !== null
            ? effectiveProject.budget.toString()
            : DEFAULT_STEP1_VALUES.budget,
        documentPaths: {
          ...nextDocPaths,
          "building-permit":
            effectiveProject?.buildingPermitStoragePath ?? undefined,
        },
      });

      const mappedMaterials: Material[] = materials.map((materialRow: any) => ({
        id: materialRow.id,
        category: materialRow.material_category,
        name: materialRow.material_name,
        supplier: materialRow.supplier,
        cost:
          materialRow.estimated_cost !== null
            ? materialRow.estimated_cost.toString()
            : "",
        unit: materialRow.unit ?? undefined,
        notes: materialRow.supplier_vetting_notes ?? "",
        credentials: materialRow.sustainability_credentials ?? undefined,
        status: materialRow.vetting,
        deliveryStatus: materialRow.delivery_status ?? undefined,
        warehouse: materialRow.warehouse ?? undefined,
        specSheetPath: materialRow.spec_sheet_path ?? undefined,
        specSheetUrl: materialRow.spec_sheet_url ?? undefined,
      }));
      setMaterials(mappedMaterials);

      if (targets) {
        setTargets(targets);
      } else {
        setTargets(null);
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

  const handleSaveTargets = useCallback(
    async (values: ProjectTargets) => {
      const activeProjectId = projectDetails?.id ?? project?.id ?? null;

      if (!activeProjectId) {
        setErrorMessage(
          "Project context is missing. Save project details before defining targets."
        );
        return;
      }

      resetFeedback();
      setIsSavingTargets(true);

      try {
        const recordId = await saveSimplifiedTargets(activeProjectId, values);

        setTargets({
          ...values,
          id: recordId,
        });

        setModalContext({});
        setPendingStepAction(null);
        setConfirmationVariant("step2Save");
      } catch (error) {
        console.error("Failed to save targets", error);
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to save targets."
        );
      } finally {
        setIsSavingTargets(false);
      }
    },
    [projectDetails?.id, project?.id, resetFeedback]
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

              if (key === "building-permit") {
                formData.append("bucket", "projects");
              }

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
            serverUpdates.start_date = trimmedStartDate || null;
          }
          if (trimmedEndDate !== projectDetails.endDate) {
            updates.endDate = trimmedEndDate;
            serverUpdates.end_date = trimmedEndDate || null;
          }

          if (
            nextDocPaths["building-permit"] &&
            nextDocPaths["building-permit"] !==
              projectDetails.buildingPermitStoragePath
          ) {
            updates.buildingPermitStoragePath = nextDocPaths["building-permit"];
            serverUpdates.building_permit_storage_path =
              nextDocPaths["building-permit"];

            // Construct the public URL
            const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/projects/${nextDocPaths["building-permit"]}`;
            updates.buildingPermitUrl = publicUrl;
            serverUpdates.building_permit_url = publicUrl;
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

        setModalContext({});
        if (goToNext) {
          setPendingStepAction(() => nextStep);
          setConfirmationVariant("step1Next");
        } else {
          setPendingStepAction(null);
          setConfirmationVariant("step1Save");
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
    async (
      material: MaterialDraftInput,
      specSheet?: File | null,
      materialId?: string
    ) => {
      if (!projectSetupId) {
        setErrorMessage("Save project setup before adding sourcing materials.");
        return;
      }

      const projectId = projectDetails?.id ?? project?.id;
      if (!projectId) {
        setErrorMessage("Project ID is missing.");
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
        const savedMaterialName = material.name;
        const parsedCost = Number(material.cost);
        if (!Number.isFinite(parsedCost)) {
          throw new Error("Budgeted cost must be a number.");
        }

        let specSheetPath: string | null = null;
        let specSheetUrl: string | null = null;

        if (specSheet) {
          const extension = specSheet.name.split(".").pop() || "pdf";
          const fileName = `spec-${crypto.randomUUID()}.${extension}`;
          const storagePath = `project/${projectId}/materials/${fileName}`;

          const formData = new FormData();
          formData.append("file", specSheet);
          formData.append("path", storagePath);
          formData.append("bucket", "materials");

          const { error } = await uploadProjectFile(formData);

          if (error) {
            console.warn("Failed to upload spec sheet", error);
            // Continue even if upload fails
          } else {
            specSheetPath = storagePath;
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(
              /\/$/,
              ""
            );
            if (supabaseUrl) {
              specSheetUrl = `${supabaseUrl}/storage/v1/object/public/materials/${storagePath}`;
            }
          }
        }

        let data: any;
        if (materialId) {
          data = await updateMaterialSourcing(materialId, projectId, {
            ...material,
            cost: parsedCost,
            specSheetPath,
            specSheetUrl,
          });

          setMaterials((prev) =>
            prev.map((m) =>
              m.id === materialId
                ? {
                    id: data.id,
                    category: data.material_category,
                    name: data.material_name,
                    supplier: data.supplier,
                    cost:
                      data.estimated_cost !== null &&
                      data.estimated_cost !== undefined
                        ? data.estimated_cost.toString()
                        : "",
                    unit: data.unit ?? undefined,
                    notes: data.supplier_vetting_notes ?? "",
                    credentials: data.sustainability_credentials ?? undefined,
                    status: data.vetting,
                    warehouse: data.warehouse ?? undefined,
                    specSheetPath: data.spec_sheet_path ?? undefined,
                    specSheetUrl: data.spec_sheet_url ?? undefined,
                    deliveryStatus: data.delivery_status ?? undefined,
                  }
                : m
            )
          );
        } else {
          data = await addMaterialSourcing(projectId, {
            ...material,
            cost: parsedCost,
            specSheetPath,
            specSheetUrl,
          });

          setMaterials((prev) => [
            ...prev,
            {
              id: data.id,
              category: data.material_category,
              name: data.material_name,
              supplier: data.supplier,
              cost:
                data.estimated_cost !== null &&
                data.estimated_cost !== undefined
                  ? data.estimated_cost.toString()
                  : "",
              unit: data.unit ?? undefined,
              notes: data.supplier_vetting_notes ?? "",
              credentials: data.sustainability_credentials ?? undefined,
              status: data.vetting,
              warehouse: data.warehouse ?? undefined,
              specSheetPath: data.spec_sheet_path ?? undefined,
              specSheetUrl: data.spec_sheet_url ?? undefined,
              deliveryStatus: data.delivery_status ?? undefined,
            },
          ]);
        }

        setModalContext({ materialName: savedMaterialName });
        setPendingStepAction(null);
        setConfirmationVariant(materialId ? "step3Update" : "step3Add");
      } catch (error) {
        if (isMissingRelationError(error)) {
          console.warn(
            "Skipping sourcing material save because the related table is not configured."
          );
          return;
        }
        console.error("Failed to add/update material", error);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to add/update material."
        );
      } finally {
        setIsSavingMaterial(false);
      }
    },
    [projectSetupId, resetFeedback, projectDetails?.id, project?.id]
  );

  const handleDeleteMaterial = useCallback(
    async (materialId: string) => {
      if (!projectSetupId) {
        setErrorMessage(
          "Save project setup before modifying sourcing materials."
        );
        return;
      }

      const projectId = projectDetails?.id ?? project?.id;
      if (!projectId) {
        setErrorMessage("Project ID is missing.");
        return;
      }

      resetFeedback();
      setDeletingMaterialId(materialId);

      try {
        await deleteMaterialSourcing(materialId, projectId);

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
    [projectSetupId, resetFeedback, projectDetails?.id, project?.id]
  );

  const step1InitialValues = useMemo<Step1InitialValues>(
    () => ({
      ...DEFAULT_STEP1_VALUES,
      ...step1Values,
    }),
    [step1Values]
  );

  const modalPresentation = useMemo(() => {
    if (!confirmationVariant) {
      return null;
    }

    const iconWrapperClass =
      "mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200";
    const materialName = modalContext.materialName;

    switch (confirmationVariant) {
      case "step1Save":
        return {
          title: "Project details saved",
          description:
            "Your setup is stored. You can revisit Step 1 any time without losing progress.",
          buttonLabel: "Close",
          icon: (
            <div className={iconWrapperClass}>
              <GanttChartSquare className="h-6 w-6" />
            </div>
          ),
        };
      case "step1Next":
        return {
          title: "Step 1 complete",
          description:
            "Project details are locked in. Continue to Step 2 to define ESG targets.",
          buttonLabel: "Continue to Step 2",
          icon: (
            <div className={iconWrapperClass}>
              <GanttChartSquare className="h-6 w-6" />
            </div>
          ),
        };
      case "step2Save":
        return {
          title: "Targets saved",
          description:
            "Your emissions and safety targets are now tracked for this project.",
          buttonLabel: "Close",
          icon: (
            <div className={iconWrapperClass}>
              <Target className="h-6 w-6" />
            </div>
          ),
        };
      case "step3Add":
        return {
          title: "Material added",
          description: materialName
            ? `${materialName} is now part of the sourcing plan.`
            : "Material saved to the sourcing plan.",
          buttonLabel: "Close",
          icon: (
            <div className={iconWrapperClass}>
              <Layers className="h-6 w-6" />
            </div>
          ),
        };
      case "step3Update":
        return {
          title: "Material updated",
          description: materialName
            ? `${materialName} has been refreshed with the latest details.`
            : "Material details updated successfully.",
          buttonLabel: "Close",
          icon: (
            <div className={iconWrapperClass}>
              <Layers className="h-6 w-6" />
            </div>
          ),
        };
      default:
        return null;
    }
  }, [confirmationVariant, modalContext.materialName]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
        Loading pre-construction data...
      </div>
    );
  }

  const activeStep = STEP_DEFINITIONS.find((item) => item.id === step);

  return (
    <>
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
                Tie each ESG target to a measurable KPI.
              </p>
            )}
            {step === 3 && (
              <p className="text-emerald-900/80 dark:text-emerald-100/80">
                Match sourcing notes that support your targets.
              </p>
            )}
            {step === 4 && (
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
              projectId={projectDetails?.id ?? project?.id ?? null}
              targets={targets}
              onSaveTargets={handleSaveTargets}
              isSaving={isSavingTargets}
              onError={handleTargetsError}
              onResetFeedback={resetFeedback}
            />
          )}
          {step === 3 && (
            <Step3MaterialSourcing
              onNext={nextStep}
              onBack={prevStep}
              onAddMaterial={handleAddMaterial}
              onDeleteMaterial={handleDeleteMaterial}
              materials={materials}
              isSavingMaterial={isSavingMaterial}
              deletingMaterialId={deletingMaterialId}
            />
          )}
          {step === 4 && (
            <Step4ReviewPlans
              onBack={prevStep}
              onSubmitApproval={handleSubmitForApproval}
              isSubmitting={isSubmittingForApproval}
              materials={materials}
              targets={targets}
              projectId={projectDetails?.id ?? project?.id ?? null}
            />
          )}
        </div>
      </div>
      </div>

      <Dialog
        open={Boolean(confirmationVariant)}
        onOpenChange={(open) => {
          if (!open) {
            handleModalClose();
          }
        }}
      >
        {modalPresentation ? (
          <DialogContent
            showCloseButton={false}
            className="sm:max-w-md backdrop-blur-xl bg-white/90 dark:bg-gray-900/80 border border-white/40 shadow-2xl"
          >
            <DialogHeader className="space-y-3 text-center">
              {modalPresentation.icon}
              <DialogTitle className="text-lg font-semibold">
                {modalPresentation.title}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {modalPresentation.description}
              </DialogDescription>
            </DialogHeader>
            <div className="pt-2 flex justify-center">
              <Button onClick={handleModalConfirm} className="px-6">
                {modalPresentation.buttonLabel}
              </Button>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </>
  );
}

export default PreConstructionPhase;
