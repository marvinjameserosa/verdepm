"use client";

import { useState } from "react";
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
import { type ProjectTargets } from "@/types/preconstruction";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";


type Props = {
  onBack: () => void;
  onSubmitApproval?: () => Promise<void> | void;
  isSubmitting?: boolean;
  materials: Material[];
  targets: ProjectTargets | null;
  projectId?: string | null;
};

const numberFormatter = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});

export default function Step4ReviewPlans({
  onBack,
  onSubmitApproval,
  isSubmitting,
  materials,
  targets,
  projectId,
}: Props) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [approvalError, setApprovalError] = useState<string | null>(null);

  const formatCost = (value: string) => {
    if (!value) {
      return "-";
    }
    const numericValue =Number(value);
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

        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Project ESG Targets</h3>
          <div className="grid gap-6 md:grid-cols-2">
            <ReviewCard
              title="Scope 1 Emissions"
              status={targets?.scopeOne ? "complete" : "empty"}
            >
              {targets?.scopeOne ? (
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-muted-foreground text-sm">Target</span>
                    <span className="font-semibold text-lg">
                      {targets.scopeOne} <span className="text-sm font-normal text-muted-foreground">tCO2e</span>
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground pt-1">
                    Direct emissions from logistics and equipment usage
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground italic">
                  No target set
                </p>
              )}
            </ReviewCard>

            <ReviewCard
              title="Scope 2 Emissions"
              status={targets?.scopeTwo ? "complete" : "empty"}
            >
              {targets?.scopeTwo ? (
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-muted-foreground text-sm">Target</span>
                    <span className="font-semibold text-lg">
                      {targets.scopeTwo} <span className="text-sm font-normal text-muted-foreground">tCO2e</span>
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground pt-1">
                    Indirect emissions from electricity usage
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground italic">
                  No target set
                </p>
              )}
            </ReviewCard>

            <ReviewCard
              title="Scope 3 Emissions"
              status={targets?.scopeThree ? "complete" : "empty"}
            >
              {targets?.scopeThree ? (
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-muted-foreground text-sm">Target</span>
                    <span className="font-semibold text-lg">
                      {targets.scopeThree} <span className="text-sm font-normal text-muted-foreground">tCO2e</span>
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground pt-1">
                    Other indirect emissions from waste and water consumption
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground italic">
                  No target set
                </p>
              )}
            </ReviewCard>

            <ReviewCard
              title="Total Recordable Incident Rate (TRIR)"
              status={targets?.trir ? "complete" : "empty"}
            >
              {targets?.trir ? (
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-muted-foreground text-sm">Target</span>
                    <span className="font-semibold text-lg">
                      {targets.trir}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground pt-1">
                    Incidents per 200,000 hours worked
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground italic">
                  No target set
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
                  <TableHead>Delivery Status</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
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
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {mat.deliveryStatus ?? "—"}
                        </span>
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
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
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
