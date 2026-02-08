import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SourcedMaterial } from "@/types/construction";
import { updateMaterialSourcing } from "@/actions/preconstruction/update-material";
import { FileText, Loader2, Upload } from "lucide-react";
import { StorageService } from "@/lib/storage";
import { createClient } from "@/lib/supabase/client";

interface EditMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: SourcedMaterial | null;
  projectId: string;
  onMaterialUpdated: () => void;
  projectStartDate?: Date | string | null;
  projectEndDate?: Date | string | null;
}

export function EditMaterialModal({
  isOpen,
  onClose,
  material,
  projectId,
  onMaterialUpdated,
  projectStartDate,
  projectEndDate,
}: EditMaterialModalProps) {
  const minDate = projectStartDate
    ? new Date(projectStartDate).toISOString().split("T")[0]
    : "";
  const maxDate = projectEndDate
    ? new Date(projectEndDate).toISOString().split("T")[0]
    : "";

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<SourcedMaterial>>({});
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [specSheetFile, setSpecSheetFile] = useState<File | null>(null);
  const [isReplacingSpecSheet, setIsReplacingSpecSheet] = useState(false);
  const [isReplacingReceipt, setIsReplacingReceipt] = useState(false);

  useEffect(() => {
    if (material) {
      setFormData({ ...material });
      setReceiptFile(null);
      setSpecSheetFile(null);
      setIsReplacingSpecSheet(false);
      setIsReplacingReceipt(false);
    }
  }, [material]);

  const handleChange = (field: keyof SourcedMaterial, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!material) return;
    setIsLoading(true);
    try {
      let receiptUrl = formData.receiptUrl;
      let receiptPath = formData.receiptPath;
      let specSheetUrl = formData.specSheetUrl;
      let specSheetPath = formData.specSheetPath;

      const supabase = createClient();

      if (receiptFile) {
        const path = `materials/${projectId}/${material.id}/${Date.now()}_${
          receiptFile.name
        }`;
        const { path: uploadedPath } = await StorageService.uploadFile(
          "receipts",
          path,
          receiptFile
        );
        receiptPath = uploadedPath;

        const {
          data: { publicUrl },
        } = supabase.storage.from("receipts").getPublicUrl(uploadedPath);
        receiptUrl = publicUrl;
      }

      if (specSheetFile) {
        const path = `materials/${projectId}/${material.id}/${Date.now()}_${
          specSheetFile.name
        }`;
        const { path: uploadedPath } = await StorageService.uploadFile(
          "construction-docs",
          path,
          specSheetFile
        );
        specSheetPath = uploadedPath;

        const {
          data: { publicUrl },
        } = supabase.storage
          .from("construction-docs")
          .getPublicUrl(uploadedPath);
        specSheetUrl = publicUrl;
      }

      await updateMaterialSourcing(material.id, projectId, {
        ...formData,
        receiptUrl,
        receiptPath,
        specSheetUrl,
        specSheetPath,
      });
      onMaterialUpdated();
      onClose();
    } catch (error) {
      console.error("Failed to update material", error);
      // You might want to show an error toast here
    } finally {
      setIsLoading(false);
    }
  };

  if (!material) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Material</DialogTitle>
          <DialogDescription>
            Update the details for {material.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Material Name</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category || ""}
                onChange={(e) => handleChange("category", e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={formData.supplier || ""}
                onChange={(e) => handleChange("supplier", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="warehouse">Warehouse</Label>
              <Input
                id="warehouse"
                value={formData.warehouse || ""}
                onChange={(e) => handleChange("warehouse", e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost">Cost</Label>
              <Input
                id="cost"
                type="number"
                value={formData.cost || ""}
                onChange={(e) => handleChange("cost", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={formData.unit || ""}
                onChange={(e) => handleChange("unit", e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Vetting Status</Label>
              <Select
                value={formData.status || "Identified"}
                onValueChange={(value) => handleChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Identified">Identified</SelectItem>
                  <SelectItem value="Vetted">Vetted</SelectItem>
                  <SelectItem value="Denied">Denied</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="approvalStatus">Approval Status</Label>
              <Input
                id="approvalStatus"
                value={formData.approvalStatus || ""}
                onChange={(e) => handleChange("approvalStatus", e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deliveryDate">Delivery Date</Label>
              <Input
                id="deliveryDate"
                type="date"
                value={
                  formData.deliveryDate
                    ? new Date(formData.deliveryDate).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    deliveryDate: e.target.value
                      ? new Date(e.target.value)
                      : undefined,
                  }))
                }
                min={minDate || undefined}
                max={maxDate || undefined}
              />
              {projectStartDate && projectEndDate && (
                <p className="text-xs text-muted-foreground">
                  Must be between {new Date(projectStartDate).toLocaleDateString()} and {new Date(projectEndDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="credentials">Sustainability Credentials</Label>
            <Textarea
              id="credentials"
              value={formData.credentials || ""}
              onChange={(e) => handleChange("credentials", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Vetting Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ""}
              onChange={(e) => handleChange("notes", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Spec Sheet Upload</Label>
            {formData.specSheetUrl && !isReplacingSpecSheet && !specSheetFile ? (
              <div className="rounded-md border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-gray-800 rounded-md border border-gray-100 dark:border-gray-700">
                      <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Spec sheet on file
                      </span>
                      <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {formData.specSheetPath?.split("/").pop() ?? "spec-sheet.pdf"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (formData.specSheetUrl) {
                          window.open(formData.specSheetUrl, "_blank", "noopener,noreferrer");
                        }
                      }}
                    >
                      View
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsReplacingSpecSheet(true)}
                    >
                      Replace
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <label
                  htmlFor="specSheetUpload"
                  className="group flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-emerald-300/60 bg-emerald-50/60 px-4 py-3 text-sm font-medium text-emerald-700 transition-all hover:border-emerald-400 hover:bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100 dark:hover:border-emerald-700/70 dark:hover:bg-emerald-900/40"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 transition-colors group-hover:bg-emerald-500/20">
                      <Upload className="h-4 w-4" />
                    </span>
                    <div className="flex flex-col gap-1 text-left">
                      <span className="leading-none">Choose File</span>
                      <span className="text-xs text-muted-foreground dark:text-emerald-100/70">
                        PDF, DOC, DOCX, or Image · Max 10 MB
                      </span>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-600 transition group-hover:bg-emerald-500/20">
                    Browse
                  </span>
                </label>
                <Input
                  id="specSheetUpload"
                  type="file"
                  accept=".pdf,.doc,.docx,image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setSpecSheetFile(file);
                    if (file) {
                      setIsReplacingSpecSheet(true);
                    }
                  }}
                />
                {specSheetFile ? (
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-100">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate" title={specSheetFile.name}>
                        {specSheetFile.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-600 hover:bg-emerald-500/20 dark:bg-emerald-900/40 dark:text-emerald-200 dark:hover:bg-emerald-900/60"
                        onClick={() => {
                          setSpecSheetFile(null);
                        }}
                      >
                        Remove
                      </button>
                      {formData.specSheetUrl ? (
                        <button
                          type="button"
                          className="rounded-full bg-gray-200/60 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                          onClick={() => {
                            setSpecSheetFile(null);
                            setIsReplacingSpecSheet(false);
                          }}
                        >
                          Cancel
                        </button>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Accepted formats: PDF, DOC, DOCX, JPG, PNG. Max size 10 MB.
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>Receipt Upload</Label>
            {formData.receiptUrl && !isReplacingReceipt && !receiptFile ? (
              <div className="rounded-md border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-gray-800 rounded-md border border-gray-100 dark:border-gray-700">
                      <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Receipt on file
                      </span>
                      <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {formData.receiptPath?.split("/").pop() ?? "receipt.pdf"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (formData.receiptUrl) {
                          window.open(formData.receiptUrl, "_blank", "noopener,noreferrer");
                        }
                      }}
                    >
                      View
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsReplacingReceipt(true)}
                    >
                      Replace
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <label
                  htmlFor="receiptUpload"
                  className="group flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-emerald-300/60 bg-emerald-50/60 px-4 py-3 text-sm font-medium text-emerald-700 transition-all hover:border-emerald-400 hover:bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100 dark:hover:border-emerald-700/70 dark:hover:bg-emerald-900/40"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 transition-colors group-hover:bg-emerald-500/20">
                      <Upload className="h-4 w-4" />
                    </span>
                    <div className="flex flex-col gap-1 text-left">
                      <span className="leading-none">Choose File</span>
                      <span className="text-xs text-muted-foreground dark:text-emerald-100/70">
                        PDF or Image · Max 10 MB
                      </span>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-600 transition group-hover:bg-emerald-500/20">
                    Browse
                  </span>
                </label>
                <Input
                  id="receiptUpload"
                  type="file"
                  accept="image/*,.pdf"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setReceiptFile(file);
                    if (file) {
                      setIsReplacingReceipt(true);
                    }
                  }}
                />
                {receiptFile ? (
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-100">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate" title={receiptFile.name}>
                        {receiptFile.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-600 hover:bg-emerald-500/20 dark:bg-emerald-900/40 dark:text-emerald-200 dark:hover:bg-emerald-900/60"
                        onClick={() => setReceiptFile(null)}
                      >
                        Remove
                      </button>
                      {formData.receiptUrl ? (
                        <button
                          type="button"
                          className="rounded-full bg-gray-200/60 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                          onClick={() => {
                            setReceiptFile(null);
                            setIsReplacingReceipt(false);
                          }}
                        >
                          Cancel
                        </button>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Accepted formats: PDF, JPG, PNG. Max size 10 MB.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
