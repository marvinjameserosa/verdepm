import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  PackageCheck,
  Truck,
  Edit,
  ExternalLink,
  Calendar,
} from "lucide-react";
import { SourcedMaterial } from "@/types/construction";
import { useState } from "react";
import { EditMaterialModal } from "./edit-material-modal";
import { updateMaterialDelivery } from "@/actions/material-actions";

interface MaterialSourcingSectionProps {
  materialLoading: boolean;
  sourcingMaterials: SourcedMaterial[];
  materialFetchError: string | null;
  onOpenLogisticsModal: (material: SourcedMaterial) => void;
  projectId: string;
  onMaterialUpdated: () => void;
  projectStartDate?: Date | string | null;
  projectEndDate?: Date | string | null;
}

const MATERIAL_STATUS_BADGE: Record<string, string> = {
  Vetted:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
  Identified: "bg-sky-100 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300",
  Denied: "bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300",
};

const formatCurrencyValue = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) {
    return "—";
  }

  const raw =
    typeof value === "string" ? Number(value.replace(/,/g, "")) : value;
  if (!Number.isFinite(raw)) {
    return typeof value === "string" && value.trim().length > 0 ? value : "—";
  }

  return Number(raw).toLocaleString();
};

const parseMaterialDate = (
  value: Date | string | null | undefined
): Date | null => {
  if (!value) return null;
  const instance = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(instance.getTime()) ? null : instance;
};

const formatDateValue = (value: Date | string | null | undefined) => {
  const parsed = parseMaterialDate(value);
  if (!parsed) return "—";
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const toDateInputValue = (value: Date | string | null | undefined) => {
  const parsed = parseMaterialDate(value);
  return parsed ? parsed.toISOString().split("T")[0] : "";
};

export function MaterialSourcingSection({
  materialLoading,
  sourcingMaterials,
  materialFetchError,
  onOpenLogisticsModal,
  projectId,
  onMaterialUpdated,
  projectStartDate,
  projectEndDate,
}: MaterialSourcingSectionProps) {
  const minDate = projectStartDate ? toDateInputValue(projectStartDate) : "";
  const maxDate = projectEndDate ? toDateInputValue(projectEndDate) : "";
  
  
  const [editingMaterial, setEditingMaterial] =
    useState<SourcedMaterial | null>(null);
  const [deliveryDateModalMaterial, setDeliveryDateModalMaterial] =
    useState<SourcedMaterial | null>(null);
  const [deliveryDateInput, setDeliveryDateInput] = useState("");
  const [deliveryDateError, setDeliveryDateError] = useState<string | null>(
    null
  );
  const [isSavingDeliveryDate, setIsSavingDeliveryDate] = useState(false);

  const resetDeliveryDateModal = () => {
    setDeliveryDateModalMaterial(null);
    setDeliveryDateInput("");
    setDeliveryDateError(null);
    setIsSavingDeliveryDate(false);
  };

  const handleOpenDeliveryDateModal = (material: SourcedMaterial) => {
    setDeliveryDateModalMaterial(material);
    setDeliveryDateInput(toDateInputValue(material.deliveryDate));
    setDeliveryDateError(null);
    setIsSavingDeliveryDate(false);
  };

  const handleDeliveryDateSave = async () => {
    if (!deliveryDateModalMaterial) {
      return;
    }

    setDeliveryDateError(null);
    const dateValue = deliveryDateInput.trim();
    const normalizedDate =
      dateValue.length === 0 ? null : new Date(`${dateValue}T00:00:00`);

    if (normalizedDate && Number.isNaN(normalizedDate.getTime())) {
      setDeliveryDateError("Enter a valid delivery date.");
      return;
    }

    // Validate delivery date is within project start and end dates
    if (normalizedDate) {
      const startDate = projectStartDate ? parseMaterialDate(projectStartDate) : null;
      const endDate = projectEndDate ? parseMaterialDate(projectEndDate) : null;

      if (startDate && normalizedDate < startDate) {
        setDeliveryDateError(`Delivery date must be on or after the project start date (${formatDateValue(startDate)}).`);
        return;
      }

      if (endDate && normalizedDate > endDate) {
        setDeliveryDateError(`Delivery date must be on or before the project end date (${formatDateValue(endDate)}).`);
        return;
      }
    }

    setIsSavingDeliveryDate(true);

    try {
      const result = await updateMaterialDelivery(
        deliveryDateModalMaterial.id,
        {
          delivery_date: normalizedDate,
        }
      );

      if (!result.success) {
        setDeliveryDateError(
          result.error ?? "Failed to update the delivery date."
        );
        return;
      }

      onMaterialUpdated();
      resetDeliveryDateModal();
    } catch (error) {
      setDeliveryDateError(
        error instanceof Error
          ? error.message
          : "Failed to update the delivery date."
      );
    } finally {
      setIsSavingDeliveryDate(false);
    }
  };

  const handleDeliveryDateDialogChange = (open: boolean) => {
    if (!open && !isSavingDeliveryDate) {
      resetDeliveryDateModal();
    }
  };

  return (
    <>
      <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
              <PackageCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            Material Delivery & Logistics
          </CardTitle>
          <CardDescription>
            Review sourcing commitments and log delivery logistics for each
            material.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            These entries mirror the{" "}
            <span className="font-medium text-emerald-700 dark:text-emerald-300">
              Material Sourcing &amp; Due Diligence
            </span>{" "}
            table completed before groundbreaking. Use this list to confirm
            deliveries match the approved sourcing strategy.
          </p>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead className="text-right">Cost per Unit</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Delivery Status</TableHead>
                  <TableHead>Delivery Date</TableHead>
                  <TableHead>Approval</TableHead>
                  {/* <TableHead>Fuel Summary (L)</TableHead> */}
                  {/*<TableHead>Credentials</TableHead>*/}
                  {/* <TableHead>Notes</TableHead> */}
                  <TableHead>Spec Sheet</TableHead>
                  <TableHead>Receipt</TableHead>
                  {/*<TableHead>Actions</TableHead>*/}
                </TableRow>
              </TableHeader>
              <TableBody>
                {materialLoading ? (
                  <TableRow>
                    <TableCell colSpan={16} className="text-center">
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading sourcing plan…
                      </div>
                    </TableCell>
                  </TableRow>
                ) : sourcingMaterials.length > 0 ? (
                  sourcingMaterials.map((material) => (
                    <TableRow key={material.id}>
                      <TableCell className="font-medium">
                        {material.name}
                      </TableCell>
                      <TableCell>{material.category}</TableCell>
                      <TableCell>{material.supplier}</TableCell>
                      <TableCell className="min-w-[150px] max-w-[250px] whitespace-normal">{material.warehouse ?? "—"}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrencyValue(material.cost)}
                      </TableCell>
                      <TableCell>{material.unit ?? "—"}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`border-transparent ${
                            MATERIAL_STATUS_BADGE[material.status] ??
                            "bg-muted text-muted-foreground"
                          }`}
                        >
                          {material.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{material.deliveryStatus ?? "—"}</TableCell>
                      <TableCell>
                        {formatDateValue(material.deliveryDate)}
                      </TableCell>
                      <TableCell>{material.approvalStatus ?? "—"}</TableCell>
                      {/* <TableCell className="text-right">
                        {material.fuelSummary
                          ? material.fuelSummary.toFixed(2)
                          : "—"}
                      </TableCell> */}
                      {/*<TableCell
                        className="max-w-[200px] break-words"
                      >
                        {material.credentials ?? "—"}
                      </TableCell>*/}
                      {/*<TableCell
                        className="max-w-[200px] break-words"
                      >
                        {material.notes ?? "—"}
                      </TableCell>*/}
                      <TableCell>
                        {material.specSheetUrl ? (
                          <a
                            href={material.specSheetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            View <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        {material.receiptUrl ? (
                          <a
                            href={material.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            View <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingMaterial(material)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-2"
                            onClick={() => onOpenLogisticsModal(material)}
                          >
                            <Truck className="h-3.5 w-3.5" />
                            Log
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={16}
                      className="text-center text-sm text-muted-foreground"
                    >
                      {materialFetchError ??
                        "No sourcing records found. Capture materials in the pre-construction workflow to populate this table."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <Dialog
        open={!!deliveryDateModalMaterial}
        onOpenChange={handleDeliveryDateDialogChange}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Delivery Date</DialogTitle>
            <DialogDescription>
              {deliveryDateModalMaterial
                ? `Adjust the delivery date for ${deliveryDateModalMaterial.name}.`
                : "Adjust the delivery date for this material."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="material-delivery-date-input">
                Delivery Date
              </Label>
              <Input
                id="material-delivery-date-input"
                type="date"
                value={deliveryDateInput}
                onChange={(event) => {
                  setDeliveryDateInput(event.target.value);
                  setDeliveryDateError(null);
                }}
                disabled={isSavingDeliveryDate}
                min={minDate || undefined}
                max={maxDate || undefined}
              />
              <p className="text-xs text-muted-foreground">
                {projectStartDate && projectEndDate
                  ? `Select a date between ${formatDateValue(projectStartDate)} and ${formatDateValue(projectEndDate)}.`
                  : "Leave blank to clear the delivery date."}
              </p>
            </div>
            {deliveryDateError && (
              <p className="text-sm text-rose-600">{deliveryDateError}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={resetDeliveryDateModal}
              disabled={isSavingDeliveryDate}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeliveryDateSave}
              disabled={isSavingDeliveryDate}
              className="gap-2"
            >
              {isSavingDeliveryDate ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Calendar className="h-4 w-4" />
              )}
              Save Date
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <EditMaterialModal
        isOpen={!!editingMaterial}
        onClose={() => setEditingMaterial(null)}
        material={editingMaterial}
        projectId={projectId}
        onMaterialUpdated={onMaterialUpdated}
        projectStartDate={projectStartDate}
        projectEndDate={projectEndDate}
      />
    </>
  );
}
