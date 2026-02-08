"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Layers, Target } from "lucide-react";
import Step2TargetSetting from "./preconstruction/step2-target-setting";
import Step3MaterialSourcing from "./preconstruction/step3-material-sourcing";
import Step4ReviewPlans from "./preconstruction/step4-review-plans";
import { type Material, type MaterialStatus } from "./preconstruction/types";

import type { Project } from "@/types/project";
import {
  getPreconstructionData,
  getTargetColumnMetadata,
} from "@/actions/preconstruction/fetch";
import {
  submitForApproval,
} from "@/actions/preconstruction/setup";
import { saveSimplifiedTargets } from "@/actions/preconstruction/save-targets";
import {
  addMaterialSourcing,
  deleteMaterialSourcing,
} from "@/actions/preconstruction/material-sourcing";
import { updateMaterialSourcing } from "@/actions/preconstruction/update-material";
import {
  type TargetSectionKey,
  type PreConstructionPhaseProps,
  type ColumnMapping,
  type SectionConfig,
  type ColumnInfo,
  type ProjectTargets,
} from "@/types/preconstruction";
import { isMissingRelationError } from "@/lib/supabase/errors";

import {
  buildDefaultColumnMapping,
  selectColumnName,
  STEP_DEFINITIONS,
  TARGET_SECTION_CONFIG,
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

type ConfirmationVariant = "step2Save" | "step3Add" | "step3Update";

type MaterialRecord = {
  id: string;
  material_category: string;
  supplier: string;
  material_name: string;
  warehouse: string | null;
  estimated_cost: number | null;
  unit: string | null;
  sustainability_credentials: string | null;
  supplier_vetting_notes: string | null;
  spec_sheet_path: string | null;
  spec_sheet_url: string | null;
  vetting: MaterialStatus;
  delivery_status: string | null;
};

const PRECONSTRUCTION_WORKFLOW_STEPS = STEP_DEFINITIONS.slice(1).map(
  ({ title, description }) => ({ title, description })
);

export function PreConstructionPhase({
  project,
  onProjectUpdated,
  refreshKey,
}: PreConstructionPhaseProps) {
  const [projectDetails, setProjectDetails] = useState<Project | null>(
    project ?? null
  );
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);
  const [projectSetupId, setProjectSetupId] = useState<string | null>(null);
  const [targets, setTargets] = useState<ProjectTargets | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
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

  useEffect(() => {
    setProjectDetails(project ?? null);
  }, [project]);

  useEffect(() => {
    void ensureColumnMetadataLoaded();
  }, [ensureColumnMetadataLoaded]);

  const nextStep = useCallback(() => setStep((s) => Math.min(s + 1, 3)), []);
  const prevStep = useCallback(() => setStep((s) => Math.max(s - 1, 1)), []);
  const handleModalClose = useCallback(() => {
    setConfirmationVariant(null);
    setModalContext({});
  }, []);

  const handleModalConfirm = useCallback(() => {
    handleModalClose();
  }, [handleModalClose]);

  const resetFeedback = useCallback(() => {
    setErrorMessage(null);
    setSuccessMessage(null);
    handleModalClose();
  }, [handleModalClose]);

  const loadData = useCallback(async () => {
    if (!project?.id) {
      setProjectSetupId(null);
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
        materials: rawMaterials,
        targets: fetchedTargets,
        project: fetchedProject,
      } = await getPreconstructionData(project.id);

      if (fetchedProject) {
        setProjectDetails(fetchedProject);
        // onProjectUpdated?.(fetchedProject);
      }

      if (!user) {
        setUserId(null);
        setProjectSetupId(null);
        setMaterials([]);
        setTargets(null);
        return;
      }

      setUserId(user.id);

      // Use project ID as setup ID since we streamlined the tables
      setProjectSetupId(project.id);

      const fetchedMaterials = rawMaterials as MaterialRecord[];

      const mappedMaterials: Material[] = fetchedMaterials.map(
        (materialRow) => ({
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
        })
      );
      setMaterials(mappedMaterials);

      if (fetchedTargets) {
        setTargets(fetchedTargets);
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
          } catch {
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
  }, [project]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshKey]);

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

        let data: MaterialRecord;
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

  const modalPresentation = useMemo(() => {
    if (!confirmationVariant) {
      return null;
    }

    const iconWrapperClass =
      "mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200";
    const materialName = modalContext.materialName;

    switch (confirmationVariant) {
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

  const activeStep = PRECONSTRUCTION_WORKFLOW_STEPS[step - 1];

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
          <StepIndicator
            currentStep={step}
            steps={PRECONSTRUCTION_WORKFLOW_STEPS}
          />
          <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/70 dark:bg-emerald-900/30 p-4 text-sm space-y-2">
            <p className="font-semibold text-emerald-800 dark:text-emerald-100">
              Quick tip
            </p>
            {step === 1 && (
              <p className="text-emerald-900/80 dark:text-emerald-100/80">
                Tie each ESG target to a measurable KPI.
              </p>
            )}
            {step === 2 && (
              <p className="text-emerald-900/80 dark:text-emerald-100/80">
                Match sourcing notes that support your targets.
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
          {step === 2 && (
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
          {step === 3 && (
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
