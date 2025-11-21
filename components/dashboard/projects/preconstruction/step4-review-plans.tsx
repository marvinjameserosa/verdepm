"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClipboardList, CheckCircle2, AlertCircle } from "lucide-react";
import { type Material } from "./types";
import { type ProjectEsgTargets } from "@/types/preconstruction";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getReviewPlansData } from "@/actions/preconstruction/fetch";

type Props = {
  onBack: () => void;
  onSubmitApproval?: () => Promise<void> | void;
  isSubmitting?: boolean;
  materials: Material[];
  targets: ProjectEsgTargets;
  projectId?: string | null;
};

const numberFormatter = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function Step4ReviewPlans({
  onBack,
  onSubmitApproval,
  isSubmitting,
  materials: initialMaterials,
  targets: initialTargets,
  projectId,
}: Props) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [approvalError, setApprovalError] = useState<string | null>(null);

  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [targets, setTargets] = useState<ProjectEsgTargets>(initialTargets);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (projectId) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const data = await getReviewPlansData(projectId);
          setMaterials(data.materials);
          if (data.targets) {
            // Cast or ensure type safety if needed, assuming the action returns compatible structure
            setTargets(data.targets as unknown as ProjectEsgTargets);
          }
        } catch (error) {
          console.error("Failed to fetch review data", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [projectId]);

  // Update local state if props change (and we are not fetching or just to sync)
  useEffect(() => {
    if (!projectId) {
      setMaterials(initialMaterials);
      setTargets(initialTargets);
    }
  }, [initialMaterials, initialTargets, projectId]);

  const formatValueDisplay = (value: string | undefined | null) => {
    if (!value) {
      return "-";
    }
    const trimmed = value.trim();
    return trimmed ? trimmed : "-";
  };

  const formatCost = (value: string) => {
    if (!value) {
      return "-";
    }
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) {
      return value;
    }
    return numberFormatter.format(numericValue);
  };

  const ReviewCard = ({
    title,
    children,
    status = "complete",
  }: {
    title: string;
    children: React.ReactNode;
    status?: "complete" | "empty";
  }) => (
    <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950/40 shadow-sm h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </CardTitle>
          {status === "complete" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-amber-500" />
          )}
        </div>
      </CardHeader>
      <CardContent className="text-sm">{children}</CardContent>
    </Card>
  );

  const MetricRow = ({
    label,
    value,
  }: {
    label: string;
    value: string | null | undefined;
  }) => (
    <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">
        {formatValueDisplay(value)}
      </span>
    </div>
  );

  return (
    <section className="w-full pb-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 sm:px-6">
        <header className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
              <ClipboardList className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold sm:text-xl">
              Step 4: Review Plans
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Review your ESG targets and sourcing record before submitting for
            approvals.
          </p>
        </header>

        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground">
            Loading review data...
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Project ESG Targets</h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <ReviewCard
                  title="Electricity Usage"
                  status={targets.electricityUsage ? "complete" : "empty"}
                >
                  {targets.electricityUsage ? (
                    <div className="space-y-1">

                      <MetricRow
                        label="Total Consumed"
                        value={`${targets.electricityUsage.totalElectricityConsumed} kWh`}
                      />
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">
                      No targets set
                    </p>
                  )}
                </ReviewCard>

                <ReviewCard
                  title="Equipment Usage"
                  status={targets.equipmentUsage ? "complete" : "empty"}
                >
                  {targets.equipmentUsage ? (
                    <div className="space-y-1">

                      <MetricRow
                        label="Total Fuel"
                        value={`${targets.equipmentUsage.totalFuel} L`}
                      />
                      <MetricRow
                        label="Emission Factor"
                        value={targets.equipmentUsage.combustionEmissionFactor}
                      />
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">
                      No targets set
                    </p>
                  )}
                </ReviewCard>

                <ReviewCard
                  title="Fuel Consumption"
                  status={targets.fuelConsumption ? "complete" : "empty"}
                >
                  {targets.fuelConsumption ? (
                    <div className="space-y-1">

                      <MetricRow
                        label="Total Fuel"
                        value={`${targets.fuelConsumption.totalFuel} L`}
                      />
                      <MetricRow
                        label="Total Distance"
                        value={`${targets.fuelConsumption.totalDistance} km`}
                      />
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">
                      No targets set
                    </p>
                  )}
                </ReviewCard>

                <ReviewCard
                  title="Waste Generated"
                  status={targets.wasteGenerated ? "complete" : "empty"}
                >
                  {targets.wasteGenerated ? (
                    <div className="space-y-1">

                      <MetricRow
                        label="Total Mass"
                        value={`${targets.wasteGenerated.totalWasteMass} kg`}
                      />
                      <MetricRow
                        label="% by Treatment"
                        value={`${targets.wasteGenerated.percentByTreatment}%`}
                      />
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">
                      No targets set
                    </p>
                  )}
                </ReviewCard>

                <ReviewCard
                  title="Water Supply"
                  status={targets.waterSupply ? "complete" : "empty"}
                >
                  {targets.waterSupply ? (
                    <div className="space-y-1">

                      <MetricRow
                        label="Total Consumed"
                        value={`${targets.waterSupply.totalWaterConsumed} m³`}
                      />
                      <MetricRow
                        label="Emission Factor"
                        value={targets.waterSupply.waterSupplyEmissionFactor}
                      />
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">
                      No targets set
                    </p>
                  )}
                </ReviewCard>

                <ReviewCard
                  title="Safety Incidents"
                  status={targets.safetyIncident ? "complete" : "empty"}
                >
                  {targets.safetyIncident ? (
                    <div className="space-y-1">

                      <MetricRow
                        label="Incidents"
                        value={targets.safetyIncident.numberOfIncidents}
                      />
                      <MetricRow
                        label="Employee Hours"
                        value={targets.safetyIncident.totalEmployeeHours}
                      />
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">
                      No targets set
                    </p>
                  )}
                </ReviewCard>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Material Sourcing Plan</h3>
              <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950/40 shadow-sm overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material Details</TableHead>
                      <TableHead>Sustainability & Compliance</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Estimated Cost per Unit</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materials.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-sm text-muted-foreground h-24"
                        >
                          No materials added yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      materials.map((mat) => (
                        <TableRow key={mat.id}>
                          <TableCell>
                            <div className="font-medium">{mat.name}</div>
                            <div className="text-xs text-muted-foreground mb-0.5">
                              {mat.category}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              {mat.credentials && (
                                <div className="flex flex-wrap gap-1">
                                  {mat.credentials
                                    .split(";")
                                    .map((s) => s.trim())
                                    .filter(Boolean)
                                    .map((c) => (
                                      <Badge
                                        key={c}
                                        variant="outline"
                                        className="text-[10px] px-1.5 py-0 h-5 font-normal"
                                      >
                                        {c}
                                      </Badge>
                                    ))}
                                </div>
                              )}
                              {mat.specSheetUrl && (
                                <a
                                  href={mat.specSheetUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-xs text-blue-600 hover:underline dark:text-blue-400"
                                >
                                  View Spec Sheet
                                </a>
                              )}
                              {!mat.credentials && !mat.specSheetUrl && (
                                <span className="text-xs text-muted-foreground italic">
                                  None
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            <div className="font-medium">{mat.supplier}</div>
                            {mat.warehouse && (
                              <div className="text-xs text-muted-foreground">
                                {mat.warehouse}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {formatCost(mat.cost)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              per {mat.unit}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant={
                                mat.status === "Vetted"
                                  ? "default"
                                  : mat.status === "Denied"
                                  ? "destructive"
                                  : "outline"
                              }
                            >
                              {mat.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-100 pt-6 dark:border-gray-800 lg:flex-row lg:items-center lg:justify-between">
              <p className="text-sm text-muted-foreground">
                Need feedback? Share this summary before you submit.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onBack}>
                  Previous
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setApprovalError(null);
                    setIsConfirmOpen(true);
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit for Approval"}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <Dialog
        open={isConfirmOpen}
        onOpenChange={(open) => {
          if (!open) {
            setApprovalError(null);
          }
          setIsConfirmOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Submit for approval?</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              This will notify approvers that the pre-construction plan is ready
              for review. Make sure targets, materials, and compliance documents
              are complete.
            </p>
            {approvalError ? (
              <p className="rounded-md border border-red-200 bg-red-50 p-2 text-red-700">
                {approvalError}
              </p>
            ) : null}
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!onSubmitApproval) {
                  setIsConfirmOpen(false);
                  return;
                }

                setApprovalError(null);
                try {
                  await onSubmitApproval();
                  setIsConfirmOpen(false);
                  setIsSuccessOpen(true);
                } catch (error) {
                  console.error("Failed to submit for approval", error);
                  setApprovalError(
                    error instanceof Error
                      ? error.message
                      : "Unable to submit for approval."
                  );
                }
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Confirm submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle className="text-emerald-600">
              Pre-construction plan submitted!
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Approvers have been notified. You can continue refining details
            while the review is underway.
          </p>
          <DialogFooter>
            <Button onClick={() => setIsSuccessOpen(false)}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
