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
import { Loader2, Upload } from "lucide-react";
import { StorageService } from "@/lib/storage";
import { createClient } from "@/lib/supabase/client";

interface EditMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: SourcedMaterial | null;
  projectId: string;
  onMaterialUpdated: () => void;
}

export function EditMaterialModal({
  isOpen,
  onClose,
  material,
  projectId,
  onMaterialUpdated,
}: EditMaterialModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<SourcedMaterial>>({});
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [specSheetFile, setSpecSheetFile] = useState<File | null>(null);

  useEffect(() => {
    if (material) {
      setFormData({ ...material });
      setReceiptFile(null);
      setSpecSheetFile(null);
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
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept=".pdf,.doc,.docx,image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setSpecSheetFile(file);
                }}
                className="text-sm"
              />
              {specSheetFile && (
                <span className="text-xs text-emerald-600 font-medium">
                  Selected: {specSheetFile.name}
                </span>
              )}
            </div>
            {formData.specSheetUrl && !specSheetFile && (
              <div className="text-xs text-muted-foreground mt-1">
                Current spec sheet:{" "}
                <a
                  href={formData.specSheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View
                </a>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>Receipt Upload</Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setReceiptFile(file);
                }}
                className="text-sm"
              />
              {receiptFile && (
                <span className="text-xs text-emerald-600 font-medium">
                  Selected: {receiptFile.name}
                </span>
              )}
            </div>
            {formData.receiptUrl && !receiptFile && (
              <div className="text-xs text-muted-foreground mt-1">
                Current receipt:{" "}
                <a
                  href={formData.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View
                </a>
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
