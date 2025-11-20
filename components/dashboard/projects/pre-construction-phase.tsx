"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Step1ProjectSetup from "./preconstruction/step1-project-setup";
import Step2TargetSetting from "./preconstruction/step2-target-setting";
import Step3ReviewPlans from "./preconstruction/step3-review-plans";
import {
  type EsgTarget,
  type Material,
  type MaterialStatus,
} from "./preconstruction/types";
import { supabase } from "@/lib/supabase/client";
import type { Project } from "@/types/project";
import {
  type DocumentKey,
  type ExistingFileState,
  type Step1FormValues,
} from "@/types/forms";
import { mapProjectFromSupabase } from "./project-helpers";
import { isMissingRelationError } from "@/lib/supabase/errors";

type Step1InitialValues = NonNullable<
  Parameters<typeof Step1ProjectSetup>[0]["initialValues"]
>;

type DocumentPathMap = ExistingFileState;

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
};

export function PreConstructionPhase({
  project,
  onProjectUpdated,
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
  const [targets, setTargets] = useState<EsgTarget[]>([]);
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
  const [isSubmittingForApproval, setIsSubmittingForApproval] = useState(false);
  const [, setSubmittedForApprovalAt] = useState<string | null>(null);
  const supportsSubmittedAtColumn = false;
  const supportsApprovalStatusColumn = false;

  useEffect(() => {
    setProjectDetails(project ?? null);
  }, [project]);

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
      setTargets([]);
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
        setTargets([]);
        return;
      }

      if (!user) {
        setUserId(null);
        setProjectSetupId(null);
        setStep1Values(getDefaultStep1Values(project));
        setDocumentPaths({});
        setMaterials([]);
        setTargets([]);
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
        setTargets([]);
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
        const [targetsResponse, materialsResponse] = await Promise.all([
          supabase
            .from("preconstruction_esg_target")
            .select("id, category, goal, metric_kpi")
            .eq("project_setup_id", normalizedSetup.id)
            .order("created_at", { ascending: true }),
          supabase
            .from("preconstruction_material")
            .select(
              "id, material_category, planned_supplier, material_name, warehouse_of_the_supplier, budgeted_cost, unit, sustainability_credentials, supplier_vetting_notes, spec_sheet_path, vetting_status"
            )
            .eq("project_setup_id", normalizedSetup.id)
            .order("created_at", { ascending: true }),
        ]);

        if (targetsResponse.error) {
          if (!isMissingRelationError(targetsResponse.error)) {
            throw targetsResponse.error;
          }
        }

        if (materialsResponse.error) {
          if (!isMissingRelationError(materialsResponse.error)) {
            throw materialsResponse.error;
          }
        }

        const targetRows =
          targetsResponse.error || !targetsResponse.data
            ? []
            : (targetsResponse.data as Array<{
                id: string;
                category: EsgTarget["category"];
                goal: string;
                metric_kpi: string;
              }>);

        const materialRows =
          materialsResponse.error || !materialsResponse.data
            ? []
            : (materialsResponse.data as Array<{
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
              }>);

        const mappedTargets: EsgTarget[] = targetRows.map((targetRow) => ({
          id: targetRow.id,
          category: targetRow.category,
          goal: targetRow.goal,
          metric: targetRow.metric_kpi,
        }));

        const mappedMaterials: Material[] = materialRows.map(
          (materialRow) => ({
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
          })
        );

        setTargets(mappedTargets);
        setMaterials(mappedMaterials);
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
  }, [project]);

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
          <span>{targets.length} ESG targets saved</span>
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
              projectSetupId={projectSetupId}
              initialTargets={targets}
              onTargetsChange={setTargets}
              onError={setErrorMessage}
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
