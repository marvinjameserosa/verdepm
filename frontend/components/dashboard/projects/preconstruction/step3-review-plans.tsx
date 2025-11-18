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
import { ClipboardList } from "lucide-react";
import { type EsgTarget, type Material } from "./types";
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
  targets: EsgTarget[];
};

const numberFormatter = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function Step3ReviewPlans({
  onBack,
  onSubmitApproval,
  isSubmitting,
  materials,
  targets,
}: Props) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [approvalError, setApprovalError] = useState<string | null>(null);

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

  return (
    <section className="w-full">
      <Card className="w-full max-w-5xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-md">
        <CardHeader className="gap-4 border-b border-gray-100 dark:border-gray-800">
          <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
              <ClipboardList className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            Step 3: Review Plans
          </CardTitle>
          <CardDescription>
            Review your ESG targets and sourcing record before submitting for
            approvals.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 p-6 lg:p-8">
          <div className="space-y-3">
            <h4 className="font-semibold">Project ESG Targets</h4>
            <p className="text-sm text-muted-foreground">
              Double-check that metrics are measurable and achievable.
            </p>
            <div className="border rounded-xl overflow-hidden bg-white dark:bg-gray-950/40 shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Goal</TableHead>
                    <TableHead>Metric / KPI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {targets.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                        No ESG targets captured yet.
                      </TableCell>
                    </TableRow>
                  )}
                  {targets.map((target) => (
                    <TableRow key={target.id}>
                      <TableCell>
                        <Badge variant="secondary">{target.category}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{target.goal}</TableCell>
                      <TableCell>{target.metric}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Material Sourcing Plan</h4>
            <p className="text-sm text-muted-foreground">
              Validate budgets, statuses, and any missing credentials before
              routing for signature.
            </p>
            <div className="border rounded-xl overflow-hidden bg-white dark:bg-gray-950/40 shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material / Supplier</TableHead>
                    <TableHead>Vetting Notes</TableHead>
                    <TableHead>Budgeted Cost</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materials.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                        No materials added yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    materials.map((mat) => (
                      <TableRow key={mat.id}>
                        <TableCell>
                          <div className="font-medium">{mat.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {mat.supplier}
                          </div>
                          {mat.warehouse && (
                            <div className="text-xs text-muted-foreground">
                              Warehouse: {mat.warehouse}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm max-w-xs truncate">
                          {mat.notes}
                        </TableCell>
                        <TableCell>
                          {formatCost(mat.cost)}{" "}
                          <span className="text-xs text-muted-foreground">
                            {mat.unit}
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
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
        </CardContent>
      </Card>

      <Dialog open={isConfirmOpen} onOpenChange={(open) => {
        if (!open) {
          setApprovalError(null);
        }
        setIsConfirmOpen(open);
      }}>
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
            Approvers have been notified. You can continue refining details while the review is underway.
          </p>
          <DialogFooter>
            <Button onClick={() => setIsSuccessOpen(false)}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
