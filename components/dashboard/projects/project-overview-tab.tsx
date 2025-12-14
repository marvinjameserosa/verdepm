"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { GanttChartSquare } from "lucide-react";

import Step1ProjectSetup from "./preconstruction/step1-project-setup";

import type { Project } from "@/types/project";
import type { Step1FormValues, DocumentKey } from "@/types/forms";
import type { Step1InitialValues, DocumentPathMap } from "@/types/preconstruction";
import {
  DEFAULT_STEP1_VALUES,
  getDefaultStep1Values,
} from "@/lib/preconstruction";
import { getPreconstructionData } from "@/actions/preconstruction/fetch";
import {
  ensureUniqueProjectSlug,
  saveProjectSetup as saveProjectSetupAction,
} from "@/actions/preconstruction/setup";
import { uploadProjectFile } from "@/actions/preconstruction/storage";
import { isMissingRelationError } from "@/lib/supabase/errors";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ConfirmationVariant = "step1Save" | "step1Next";

type ProjectOverviewTabProps = {
  project?: Project;
  onProjectUpdated?: (project: Project) => void;
  onContinueToPreConstruction?: () => void;
  onSetupSaved?: () => void;
};

export default function ProjectOverviewTab({
  project,
  onProjectUpdated,
  onContinueToPreConstruction,
  onSetupSaved,
}: ProjectOverviewTabProps) {
  const [projectDetails, setProjectDetails] = useState<Project | null>(
    project ?? null
  );
  const [userId, setUserId] = useState<string | null>(null);
  const [projectSetupId, setProjectSetupId] = useState<string | null>(null);
  const [step1Values, setStep1Values] = useState<Step1InitialValues>(() =>
    getDefaultStep1Values(project ?? undefined)
  );
  const [documentPaths, setDocumentPaths] = useState<DocumentPathMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSavingStep1, setIsSavingStep1] = useState(false);
  const [confirmationVariant, setConfirmationVariant] =
    useState<ConfirmationVariant | null>(null);

  useEffect(() => {
    setProjectDetails(project ?? null);
  }, [project]);

  const resetFeedback = useCallback(() => {
    setErrorMessage(null);
    setConfirmationVariant(null);
  }, []);

  const loadData = useCallback(async () => {
    if (!project?.id) {
      setProjectSetupId(null);
      setDocumentPaths({});
      setStep1Values(getDefaultStep1Values(project));
      setUserId(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { user, project: fetchedProject } = await getPreconstructionData(
        project.id
      );

      if (fetchedProject) {
        setProjectDetails(fetchedProject);
        if (project?.updatedAt !== fetchedProject.updatedAt) {
          onProjectUpdated?.(fetchedProject);
        }
      }

      if (!user) {
        setUserId(null);
        setProjectSetupId(null);
        setDocumentPaths({});
        setStep1Values(getDefaultStep1Values(fetchedProject || project));
        return;
      }

      setUserId(user.id);
      setProjectSetupId(project.id);

      const nextDocPaths: DocumentPathMap = {};
      setDocumentPaths(nextDocPaths);

      const effectiveProject = fetchedProject || project;

      setStep1Values({
        projectName:
          effectiveProject?.name ?? DEFAULT_STEP1_VALUES.projectName,
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
    } catch (error) {
      if (isMissingRelationError(error)) {
        console.warn(
          "Optional pre-construction relations are not configured; continuing without documents."
        );
        setErrorMessage(null);
        return;
      }

      console.error("Failed to load project overview", error);

      let message = "Failed to load project setup.";

      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === "string") {
        message = error;
      } else if (error && typeof error === "object" && "message" in error) {
        message = String((error as { message: unknown }).message);
      }

      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, [project, onProjectUpdated]);

  useEffect(() => {
    void loadData();
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

  const step1InitialValues = useMemo<Step1InitialValues>(
    () => ({
      ...DEFAULT_STEP1_VALUES,
      ...step1Values,
    }),
    [step1Values]
  );

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

        const updates: Record<string, string | number | null> = {};
        const serverUpdates: Record<string, string | number | null> = {};
        let nextSlug: string | null = null;

        if (projectDetails?.id) {
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

        onSetupSaved?.();

        setConfirmationVariant(goToNext ? "step1Next" : "step1Save");
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
      onProjectUpdated,
      onSetupSaved,
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

  const handleModalClose = useCallback(() => {
    setConfirmationVariant(null);
  }, []);

  const handleModalConfirm = useCallback(() => {
    if (confirmationVariant === "step1Next") {
      onContinueToPreConstruction?.();
    }
    handleModalClose();
  }, [confirmationVariant, handleModalClose, onContinueToPreConstruction]);

  const modalPresentation = useMemo(() => {
    if (!confirmationVariant) {
      return null;
    }

    const iconWrapperClass =
      "mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200";

    switch (confirmationVariant) {
      case "step1Save":
        return {
          title: "Project details saved",
          description:
            "Your setup is stored. You can revisit this overview any time without losing progress.",
          buttonLabel: "Close",
          icon: (
            <div className={iconWrapperClass}>
              <GanttChartSquare className="h-6 w-6" />
            </div>
          ),
        };
      case "step1Next":
        return {
          title: "Project overview ready",
          description:
            "Project details are locked in. Continue in the Pre-Construction tab to define targets.",
          buttonLabel: "Go to Pre-Construction",
          icon: (
            <div className={iconWrapperClass}>
              <GanttChartSquare className="h-6 w-6" />
            </div>
          ),
        };
      default:
        return null;
    }
  }, [confirmationVariant]);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Loading project overview...
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {errorMessage && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}
        <div className="rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white/80 dark:bg-gray-900/60 p-4 space-y-2">
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-200">
            Project Overview
          </p>
          <p className="text-sm text-muted-foreground">
            Capture the foundational project details and confirm compliance files before the ESG workflow.
          </p>
        </div>
        <Step1ProjectSetup
          onSubmit={handleStep1Submit}
          onSave={handleStep1Save}
          initialValues={step1InitialValues}
          isSubmitting={isSavingStep1}
        />
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
