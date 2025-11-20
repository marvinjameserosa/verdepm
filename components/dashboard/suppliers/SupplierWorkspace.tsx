"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Truck } from "lucide-react";
import { useCurrentRole } from "@/hooks/useCurrentRole";
import type { Project } from "@/types/project";
import {
  SupplierLogisticsForm,
  type SupplierLogisticsFormValues,
} from "./SupplierLogisticsForm";
import { supabase } from "@/lib/supabase/client";

type SupplierWorkspaceProps = {
  initialProjects: Project[];
  initialError?: string | null;
};

const SUPPLIER_ACCESS_ROLES = ["owner", "manager", "supplier"];

export function SupplierWorkspace({
  initialProjects,
  initialError,
}: SupplierWorkspaceProps) {
  const { role } = useCurrentRole();
  const normalizedRole = role?.toLowerCase() ?? null;
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    initialProjects[0]?.id ?? null
  );

  useEffect(() => {
    if (!selectedProjectId && initialProjects.length > 0) {
      setSelectedProjectId(initialProjects[0].id);
    }
  }, [initialProjects, selectedProjectId]);

  const selectedProject = useMemo(
    () =>
      selectedProjectId
        ? initialProjects.find((project) => project.id === selectedProjectId) ??
          null
        : null,
    [initialProjects, selectedProjectId]
  );

  const canAccess =
    normalizedRole !== null &&
    SUPPLIER_ACCESS_ROLES.includes(normalizedRole.toLowerCase());

  const canReview =
    normalizedRole === "owner" || normalizedRole === "manager";

  const [profileFeedback, setProfileFeedback] = useState<string | null>(null);
  const [projectSetupId, setProjectSetupId] = useState<string | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [isLoadingSetup, setIsLoadingSetup] = useState(false);
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const resolveSetup = async () => {
      if (!selectedProjectId) {
        if (isMounted) {
          setProjectSetupId(null);
          setSetupError(null);
        }
        return;
      }
      setIsLoadingSetup(true);
      setSetupError(null);
      const { data, error } = await supabase
        .from("preconstruction_project_setup")
        .select("id")
        .eq("project_id", selectedProjectId)
        .maybeSingle();
      if (!isMounted) return;
      if (error) {
        setSetupError(error.message);
        setProjectSetupId(null);
      } else {
        setProjectSetupId(data?.id ?? null);
      }
      setIsLoadingSetup(false);
    };
    void resolveSetup();
    return () => {
      isMounted = false;
    };
  }, [selectedProjectId]);

  const handleLogisticsSubmit = async (
    values: SupplierLogisticsFormValues,
    projectId: string | null
  ) => {
    if (!projectId || !projectSetupId) {
      setProfileFeedback(
        "Unable to save. Make sure the project setup has been completed."
      );
      return;
    }

    try {
      setIsSavingPlan(true);
      setProfileFeedback(null);

      const plannedSupplier =
        role && typeof role === "string"
          ? role.charAt(0).toUpperCase() + role.slice(1)
          : "Supplier Workspace";

      for (const entry of values.materials) {
        const summary = [
          `Specification: ${entry.specification}`,
          `Packing: ${entry.packingType}`,
          entry.storageRequirements
            ? `Storage: ${entry.storageRequirements}`
            : null,
          `PO Number: ${values.poNumber}`,
          `Scheduled Delivery: ${values.scheduledDate} ${values.scheduledTimeSlot}`,
          `Quantity Ordered: ${values.quantityOrdered}`,
          `Vehicle: ${values.vehicleType} (${values.licensePlate})`,
          `Driver: ${values.driverName}`,
          `Unloading Method: ${values.unloadingMethod}`,
          `Destination: ${values.destinationZone}`,
          `Delivery Receipt: ${values.deliveryReceipt}`,
        ]
          .filter(Boolean)
          .join("\n");

        const budgetedCost = Number(values.unitPrice);

        const { error } = await supabase.from("preconstruction_material").insert({
          project_setup_id: projectSetupId,
          material_category: entry.materialCategory || "Uncategorized",
          planned_supplier: plannedSupplier,
          material_name: entry.materialName,
          warehouse_of_the_supplier: values.destinationZone || null,
          budgeted_cost: Number.isFinite(budgetedCost) ? budgetedCost : null,
          unit: entry.unitOfMeasure,
          sustainability_credentials: entry.qualityCertificateAttached
            ? "Quality documents attached"
            : null,
          supplier_vetting_notes: summary,
          vetting_status: entry.qualityCertificateAttached ? "Vetted" : "Identified",
        });

        if (error) {
          throw error;
        }
      }

      setProfileFeedback(
        `Submitted logistics plan for ${selectedProject?.name ?? "the project"}.`
      );
    } catch (error) {
      console.error("Failed to save supplier logistics form", error);
      setProfileFeedback(
        error instanceof Error
          ? error.message
          : "Unable to save logistics plan."
      );
    } finally {
      setIsSavingPlan(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 dark:bg-gray-900/70 border border-white/40 dark:border-gray-800/60 backdrop-blur-xl shadow-xl">
        <CardHeader className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <div className="p-2 rounded-xl bg-emerald-100/80 dark:bg-emerald-900/40">
              <Truck className="h-5 w-5" />
            </div>
            <CardTitle>Supplier Workspace</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Capture sourcing commitments in collaboration with your project
            team. Managers can approve submissions before they flow into the
            pre-construction plan.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Select project
            </p>
            <Select
              value={selectedProjectId ?? undefined}
              onValueChange={(value) => setSelectedProjectId(value)}
              disabled={initialProjects.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a project" />
              </SelectTrigger>
              <SelectContent>
                {initialProjects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {initialProjects.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No projects available. Create a project first.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Your access
            </p>
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/50 p-3 text-sm text-muted-foreground">
              {role ? (
                <>
                  Signed in as{" "}
                  <span className="font-semibold text-foreground">{role}</span>.
                  {canReview
                    ? " You can approve supplier submissions."
                    : " Waiting for manager approval before items move to the pre-construction plan."}
                </>
              ) : (
                "Resolving your organization role..."
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {initialError && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <AlertCircle className="h-4 w-4" />
          {initialError}
        </div>
      )}

      {setupError && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          {setupError}
        </div>
      )}

      {canAccess ? (
        selectedProject ? (
          <SupplierLogisticsForm
            projectName={selectedProject.name}
            onSubmit={(values) =>
              handleLogisticsSubmit(values, selectedProjectId)
            }
            disabled={!projectSetupId || isLoadingSetup || isSavingPlan}
            disabledReason={
              isLoadingSetup
                ? "Resolving project setup..."
                : !projectSetupId
                ? "Complete Pre-Construction Step 1 before logging sourcing plans."
                : undefined
            }
          />
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Select a project to start filling in the supplier logistics form.
            </CardContent>
          </Card>
        )
      ) : null}

      {profileFeedback && (
        <Card>
          <CardContent className="py-3 text-sm text-muted-foreground">
            {profileFeedback}
          </CardContent>
        </Card>
      )}

      {!canAccess ? (
        <Card className="border border-destructive/20 bg-destructive/5">
          <CardContent className="flex items-center gap-3 py-6 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            You do not have access to the supplier workspace. Ask an owner or
            manager to adjust your role.
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

export default SupplierWorkspace;

