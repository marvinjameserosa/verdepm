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
import { supabase } from "@/utils/supabase/client";
import type { Project } from "@/types/project";
import { mapProjectFromSupabase } from "./project-helpers";

type Step1InitialValues = NonNullable<
  Parameters<typeof Step1ProjectSetup>[0]["initialValues"]
>;

type DocumentKey = "sec-dti" | "mayors-permit" | "bir";

type DocumentPathMap = Partial<Record<DocumentKey, string>>;

const DEFAULT_STEP1_VALUES: Step1InitialValues = {
  projectName: "Greenwood Tower",
  projectAddress: "123 Sustainable Ave, Eco City",
  projectDescription: "",
  documentPaths: {},
};

const generateSlug = (input: string) =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const buildSlugFallback = (identifier: string) =>
  `project-${identifier.replace(/[^a-z0-9]+/gi, "").slice(0, 12).toLowerCase() || crypto.randomUUID().slice(0, 12)}`;

const getDefaultStep1Values = (project?: Project): Step1InitialValues => ({
  projectName: project?.name ?? DEFAULT_STEP1_VALUES.projectName,
  projectAddress: project?.location ?? DEFAULT_STEP1_VALUES.projectAddress,
  projectDescription:
    project?.description ?? DEFAULT_STEP1_VALUES.projectDescription,
  documentPaths: {},
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

export function PreConstructionPhase({ project, onProjectUpdated }: PreConstructionPhaseProps) {
  const [projectDetails, setProjectDetails] = useState<Project | null>(project ?? null);
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
  const [isSavingTarget, setIsSavingTarget] = useState(false);
  const [isSavingMaterial, setIsSavingMaterial] = useState(false);
  const [deletingTargetId, setDeletingTargetId] = useState<string | null>(null);
  const [deletingMaterialId, setDeletingMaterialId] = useState<string | null>(null);
  const [isSubmittingForApproval, setIsSubmittingForApproval] = useState(false);
  const [submittedForApprovalAt, setSubmittedForApprovalAt] = useState<string | null>(null);
  const [supportsSubmittedAtColumn, setSupportsSubmittedAtColumn] = useState(false);
  const [supportsApprovalStatusColumn, setSupportsApprovalStatusColumn] = useState(false);

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
        .maybeSingle();

      if (setupError) {
        throw setupError;
      }

      if (!setupData) {
        setProjectSetupId(null);
        setStep1Values(getDefaultStep1Values(project));
        setDocumentPaths({});
        setMaterials([]);
        setTargets([]);
        return;
      }

      setProjectSetupId(setupData.id);

      const nextDocPaths: DocumentPathMap = {};
      if (setupData.sec_dti_path) {
        nextDocPaths["sec-dti"] = setupData.sec_dti_path;
      }
      if (setupData.mayors_permit_path) {
        nextDocPaths["mayors-permit"] = setupData.mayors_permit_path;
      }
      if (setupData.bir_registration_path) {
        nextDocPaths.bir = setupData.bir_registration_path;
      }
      setDocumentPaths(nextDocPaths);

      setStep1Values({
        projectName:
          setupData.project_name ??
          project?.name ??
          DEFAULT_STEP1_VALUES.projectName,
        projectAddress:
          setupData.project_address ??
          project?.location ??
          DEFAULT_STEP1_VALUES.projectAddress,
        projectDescription:
          setupData.project_description ??
          project?.description ??
          DEFAULT_STEP1_VALUES.projectDescription,
        documentPaths: nextDocPaths,
      });

      if (setupData.id) {
        const [targetsResponse, materialsResponse] = await Promise.all([
          supabase
            .from("preconstruction_esg_target")
            .select("id, category, goal, metric_kpi")
            .eq("project_setup_id", setupData.id)
            .order("created_at", { ascending: true }),
          supabase
            .from("preconstruction_material")
            .select(
              "id, material_category, planned_supplier, material_name, warehouse_of_the_supplier, budgeted_cost, unit, sustainability_credentials, supplier_vetting_notes, spec_sheet_path, vetting_status"
            )
            .eq("project_setup_id", setupData.id)
            .order("created_at", { ascending: true }),
        ]);

        if (targetsResponse.error) {
          throw targetsResponse.error;
        }
        if (materialsResponse.error) {
          throw materialsResponse.error;
        }

        setTargets(
          (targetsResponse.data ?? []).map((target) => ({
            id: target.id,
            category: target.category,
            goal: target.goal,
            metric: target.metric_kpi,
          }))
        );

        setMaterials(
          (materialsResponse.data ?? []).map((material) => ({
            id: material.id,
            category: material.material_category,
            name: material.material_name,
            supplier: material.planned_supplier,
            cost:
              material.budgeted_cost !== null &&
              material.budgeted_cost !== undefined
                ? material.budgeted_cost.toString()
                : "",
            unit: material.unit ?? undefined,
            notes: material.supplier_vetting_notes ?? "",
            credentials: material.sustainability_credentials ?? undefined,
            status: material.vetting_status,
            warehouse: material.warehouse_of_the_supplier ?? undefined,
            specSheetPath: material.spec_sheet_path ?? undefined,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to load pre-construction data", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to load data."
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
        documentPaths: prev.documentPaths,
      }));
    }
  }, [isLoading, project, projectSetupId]);

  type Step1FormValues = {
    projectName: string;
    projectAddress: string;
    projectDescription: string;
    files: Partial<Record<DocumentKey, File | null>>;
  };

  type TargetFormInput = {
    category: "" | "Environmental" | "Social" | "Governance";
    goal: string;
    metric: string;
  };

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

  const handleStep1Submit = useCallback(
    async (values: Step1FormValues) => {
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
            .select("id, slug")
            .ilike("slug", `${baseSlug}%`);

          if (error) {
            throw error;
          }

          const conflictingSlugs = (data ?? [])
            .filter((row) => row.id !== projectDetails.id && typeof row.slug === "string")
            .map((row) => row.slug);

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

        const projectIdForSetup = projectDetails?.id ?? project?.id;

        if (!projectIdForSetup) {
          throw new Error("Project context is missing. Reload the page and try again.");
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
          const updates: Record<string, string | null> = {};

          if (projectDetails.name !== trimmedProjectName) {
            updates.name = trimmedProjectName;
          }

          if (projectDetails.location !== trimmedProjectAddress) {
            updates.location = trimmedProjectAddress;
          }

          const incomingDescription = trimmedProjectDescription || null;
          if ((projectDetails.description ?? null) !== incomingDescription) {
            updates.description = incomingDescription;
          }

          if (nextSlug && nextSlug !== projectDetails.slug) {
            updates.slug = nextSlug;
          }

          if (Object.keys(updates).length > 0) {
            const {
              data: updatedProjectRow,
              error: projectUpdateError,
            } = await supabase
              .from("projects")
              .update(updates)
              .eq("id", projectDetails.id)
              .select(
                "id, owner_id, name, slug, description, status, priority, category, project_manager, client_name, location, budget, start_date, end_date, created_at, updated_at"
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
            };
            setProjectDetails(nextProjectState);
          }
        }

        setDocumentPaths(nextDocPaths);
        setStep1Values({
          projectName: trimmedProjectName,
          projectAddress: trimmedProjectAddress,
          projectDescription: trimmedProjectDescription,
          documentPaths: nextDocPaths,
        });

        if (nextProjectState) {
          onProjectUpdated?.(nextProjectState);
        }

        setSuccessMessage("Project details saved.");
        nextStep();
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
    [documentPaths, nextStep, onProjectUpdated, projectDetails, projectSetupId, resetFeedback, userId]
  );

  const handleSubmitForApproval = useCallback(async () => {
    if (!userId) {
      throw new Error("You must be signed in to submit for approval.");
    }

    if (!projectSetupId) {
      throw new Error("Save project setup details before submitting for approval.");
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

      const { error } = await supabase
        .from("preconstruction_project_setup")
        .update(updates)
        .eq("id", projectSetupId)
        .eq("user_id", userId);

      if (error) {
        throw error;
      }

      setSubmittedForApprovalAt(
        supportsSubmittedAtColumn ? (updates.submitted_for_approval_at as string) : new Date().toISOString()
      );
      setSuccessMessage("Submitted for approval.");
    } catch (error) {
      console.error("Failed to submit for approval", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to submit for approval right now."
      );
      throw error instanceof Error ? error : new Error("Unable to submit for approval right now.");
    } finally {
      setIsSubmittingForApproval(false);
    }
  }, [projectSetupId, resetFeedback, supportsApprovalStatusColumn, supportsSubmittedAtColumn, userId]);

  const handleSaveTarget = useCallback(
    async (target: TargetFormInput) => {
      if (!projectSetupId) {
        setErrorMessage("Save project setup before adding ESG targets.");
        return;
      }

      resetFeedback();

      if (!target.category || !target.goal || !target.metric) {
        setErrorMessage("Please complete the target details before saving.");
        return;
      }

      setIsSavingTarget(true);

      try {
        const { data, error } = await supabase
          .from("preconstruction_esg_target")
          .insert([
            {
              project_setup_id: projectSetupId,
              category: target.category,
              goal: target.goal,
              metric_kpi: target.metric,
            },
          ])
          .select("id, category, goal, metric_kpi")
          .single();

        if (error) {
          throw error;
        }

        setTargets((prev) => [
          ...prev,
          {
            id: data.id,
            category: data.category,
            goal: data.goal,
            metric: data.metric_kpi,
          },
        ]);
      } catch (error) {
        console.error("Failed to save ESG target", error);
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to save ESG target."
        );
      } finally {
        setIsSavingTarget(false);
      }
    },
    [projectSetupId, resetFeedback]
  );

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

  const handleDeleteTarget = useCallback(
    async (targetId: string) => {
      if (!projectSetupId) {
        setErrorMessage("Save project setup before modifying ESG targets.");
        return;
      }

      resetFeedback();
      setDeletingTargetId(targetId);

      try {
        const { error } = await supabase
          .from("preconstruction_esg_target")
          .delete()
          .eq("id", targetId)
          .eq("project_setup_id", projectSetupId);

        if (error) {
          throw error;
        }

        setTargets((prev) => prev.filter((target) => target.id !== targetId));
      } catch (error) {
        console.error("Failed to delete ESG target", error);
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to delete ESG target."
        );
      } finally {
        setDeletingTargetId(null);
      }
    },
    [projectSetupId, resetFeedback]
  );

  const handleDeleteMaterial = useCallback(
    async (materialId: string) => {
      if (!projectSetupId) {
        setErrorMessage("Save project setup before modifying sourcing materials.");
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

        setMaterials((prev) => prev.filter((material) => material.id !== materialId));
      } catch (error) {
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
      projectName: step1Values.projectName,
      projectAddress: step1Values.projectAddress,
      projectDescription: step1Values.projectDescription,
      documentPaths: {},
    }),
    [
      step1Values.projectAddress,
      step1Values.projectDescription,
      step1Values.projectName,
    ]
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
                Keep names short and upload clearly labeled files to speed up
                compliance checks.
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
              initialValues={step1InitialValues}
              isSubmitting={isSavingStep1}
            />
          )}
          {step === 2 && (
            <Step2TargetSetting
              onNext={nextStep}
              onBack={prevStep}
              onSaveTarget={handleSaveTarget}
              onAddMaterial={handleAddMaterial}
              onDeleteTarget={handleDeleteTarget}
              onDeleteMaterial={handleDeleteMaterial}
              targets={targets}
              materials={materials}
              isSavingTarget={isSavingTarget}
              isSavingMaterial={isSavingMaterial}
              deletingTargetId={deletingTargetId}
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
