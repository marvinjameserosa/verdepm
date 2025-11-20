"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Layers, Loader2, Trash2 } from "lucide-react";
import {
  Material,
  SupplierApprovalStatus,
} from "./types";

type Props = {
  onNext: () => void;
  onBack: () => void;
  onDeleteMaterial: (materialId: string) => Promise<void>;
  materials: Material[];
  deletingMaterialId?: string | null;
  readOnly?: boolean;
  showNavigation?: boolean;
  allowApprovals?: boolean;
  onMaterialApproval?: (
    materialId: string,
    nextStatus: SupplierApprovalStatus
  ) => Promise<void>;
  materialApprovalLoadingId?: string | null;
  projectName?: string | null;
};

export default function Step2TargetSetting({
  onNext,
  onBack,
  onDeleteMaterial,
  materials,
  deletingMaterialId,
  readOnly = false,
  showNavigation = true,
  allowApprovals = false,
  onMaterialApproval,
  materialApprovalLoadingId = null,
  projectName,
}: Props) {
  const handleMaterialApproval = async (
    materialId: string,
    nextStatus: SupplierApprovalStatus
  ) => {
    if (!onMaterialApproval) {
      return;
    }
    await onMaterialApproval(materialId, nextStatus);
  };

  const renderApprovalBadge = (status?: SupplierApprovalStatus) => {
    const normalized = status ?? "pending";
    const styles: Record<SupplierApprovalStatus, string> = {
      approved:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300",
      pending:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300",
      rejected:
        "bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-300",
    };
    return (
      <Badge
        variant="outline"
        className={`text-xs border-transparent ${styles[normalized]}`}
      >
        {normalized.charAt(0).toUpperCase() + normalized.slice(1)}
      </Badge>
    );
  };

  return (
    <section className="w-full space-y-6">
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
              <Layers className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            Step 2: Supplier Logistics Plan
          </CardTitle>
          <CardDescription>
            All sourcing data for {projectName ?? "this project"} is now
            maintained through the Supplier Workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Supplier submissions automatically sync here once they complete the
            Construction Verde Supplier Logistics Form. Use this tab to monitor
            and approve their entries.
          </p>
          <p>
            Owners and managers can still remove or approve items here, but data
            entry happens exclusively through the supplier portal.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle className="text-emerald-700 dark:text-emerald-300">
            Submitted Materials
          </CardTitle>
          <CardDescription>
            Materials provided via supplier logistics plans. Approved entries
            proceed to the review step.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {materials.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No supplier submissions yet. Share the Supplier Workspace link to
              begin collecting sourcing plans.
            </p>
          ) : (
            <div className="grid gap-3">
              {materials.map((material) => (
                <div
                  key={material.id}
                  className="border border-gray-200 dark:border-gray-800 rounded-lg p-3 text-sm bg-white/80 dark:bg-gray-900/60 space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-emerald-700 dark:text-emerald-200">
                          {material.name}
                        </div>
                        {renderApprovalBadge(material.approvalStatus)}
                      </div>
                      <div className="text-muted-foreground">
                        {material.supplier} • {material.unit ?? "--"}
                      </div>
                      {material.warehouse && (
                        <div className="text-xs text-muted-foreground">
                          Destination: {material.warehouse}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground flex flex-wrap gap-2">
                        <span>Status: {material.status}</span>
                        {material.credentials && (
                          <span>• {material.credentials}</span>
                        )}
                      </div>
                      {material.notes && (
                        <p className="text-xs text-muted-foreground whitespace-pre-line">
                          {material.notes}
                        </p>
                      )}
                    </div>
                    {!readOnly && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50"
                        onClick={() => {
                          void onDeleteMaterial(material.id);
                        }}
                        disabled={deletingMaterialId === material.id}
                        aria-label="Delete material"
                      >
                        {deletingMaterialId === material.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                  {allowApprovals && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          void handleMaterialApproval(material.id, "approved")
                        }
                        disabled={materialApprovalLoadingId === material.id}
                      >
                        {materialApprovalLoadingId === material.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                        ) : null}
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/40"
                        onClick={() =>
                          void handleMaterialApproval(material.id, "rejected")
                        }
                        disabled={materialApprovalLoadingId === material.id}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      {showNavigation && (
        <div className="flex flex-col gap-3 border-t border-gray-100 dark:border-gray-800 pt-6 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-sm text-muted-foreground">
            Review supplier submissions before moving to the Review Plans step.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onBack}>
              Previous
            </Button>
            <Button onClick={onNext}>Next</Button>
          </div>
        </div>
      )}
    </section>
  );
}
