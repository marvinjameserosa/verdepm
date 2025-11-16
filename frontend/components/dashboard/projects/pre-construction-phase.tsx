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

const getDefaultStep1Values = (project?: Project): Step1InitialValues => ({
  projectName: project?.name ?? DEFAULT_STEP1_VALUES.projectName,
  projectAddress: project?.location ?? DEFAULT_STEP1_VALUES.projectAddress,
  projectDescription:
    project?.description ?? DEFAULT_STEP1_VALUES.projectDescription,
  documentPaths: {},
});

const StepIndicator = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { id: 1, title: "Project Setup" },
    { id: 2, title: "Target Setting" },
    { id: 3, title: "Review Plans" },
  ];
  return (
    <div className="flex justify-center items-center py-8">
      <div className="flex items-center">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= step.id
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}
              >
                {step.id}
              </div>
              <p
                className={`mt-2 text-sm ${
                  currentStep >= step.id
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-gray-500"
                }`}
              >
                {step.title}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-auto border-t-2 mx-4 ${
                  currentStep > step.id
                    ? "border-emerald-500"
                    : "border-gray-300 dark:border-gray-700"
                }`}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

type PreConstructionPhaseProps = {
  project?: Project;
};

export function PreConstructionPhase({ project }: PreConstructionPhaseProps) {
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);
  const [projectSetupId, setProjectSetupId] = useState<string | null>(null);
  const [step1Values, setStep1Values] = useState<Step1InitialValues>(() =>
    getDefaultStep1Values(project)
  );
  const [targets, setTargets] = useState<EsgTarget[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [documentPaths, setDocumentPaths] = useState<DocumentPathMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSavingStep1, setIsSavingStep1] = useState(false);
  const [isSavingTarget, setIsSavingTarget] = useState(false);
  const [isSavingMaterial, setIsSavingMaterial] = useState(false);

  const nextStep = useCallback(() => setStep((s) => Math.min(s + 1, 3)), []);
  const prevStep = useCallback(() => setStep((s) => Math.max(s - 1, 1)), []);

  const resetErrors = useCallback(() => setErrorMessage(null), []);

  const loadData = useCallback(async () => {
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

      const {
        data: setupData,
        error: setupError,
      } = await supabase
        .from("preconstruction_project_setup")
        .select(
          "id, project_name, project_address, project_description, sec_dti_path, mayors_permit_path, bir_registration_path"
        )
        .eq("user_id", user.id)
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
              material.budgeted_cost !== null && material.budgeted_cost !== undefined
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
          prev.projectName && prev.projectName !== DEFAULT_STEP1_VALUES.projectName
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

      resetErrors();
      setIsSavingStep1(true);

      try {
        const setupId = projectSetupId ?? crypto.randomUUID();
        const storage = supabase.storage.from("preconstruction-docs");

        const uploads = await Promise.all(
          (Object.entries(values.files) as [DocumentKey, File | null | undefined][])
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

        const payload = {
          user_id: userId,
          project_name: values.projectName,
          project_address: values.projectAddress,
          project_description: values.projectDescription,
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

        setDocumentPaths(nextDocPaths);
        setStep1Values({
          projectName: values.projectName,
          projectAddress: values.projectAddress,
          projectDescription: values.projectDescription,
          documentPaths: nextDocPaths,
        });

        nextStep();
      } catch (error) {
        console.error("Failed to save project setup", error);
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to save project setup."
        );
      } finally {
        setIsSavingStep1(false);
      }
    },
    [documentPaths, nextStep, projectSetupId, resetErrors, userId]
  );

  const handleSaveTarget = useCallback(
    async (target: TargetFormInput) => {
      if (!projectSetupId) {
        setErrorMessage("Save project setup before adding ESG targets.");
        return;
      }

      resetErrors();

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
    [projectSetupId, resetErrors]
  );

  const handleAddMaterial = useCallback(
    async (material: MaterialDraftInput, specSheet?: File | null) => {
      if (!projectSetupId) {
        setErrorMessage(
          "Save project setup before adding sourcing materials."
        );
        return;
      }

      resetErrors();

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
          const { error } = await supabase
            .storage.from("preconstruction-docs")
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
    [projectSetupId, resetErrors]
  );

  const step1InitialValues = useMemo<Step1InitialValues>(() => ({
    projectName: step1Values.projectName,
    projectAddress: step1Values.projectAddress,
    projectDescription: step1Values.projectDescription,
    documentPaths,
  }), [documentPaths, step1Values.projectAddress, step1Values.projectDescription, step1Values.projectName]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
        Loading pre-construction data...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {errorMessage && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}
      <StepIndicator currentStep={step} />
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
          targets={targets}
          materials={materials}
          isSavingTarget={isSavingTarget}
          isSavingMaterial={isSavingMaterial}
        />
      )}
      {step === 3 && (
        <Step3ReviewPlans onBack={prevStep} materials={materials} targets={targets} />
      )}
    </div>
  );
}

export default PreConstructionPhase;
