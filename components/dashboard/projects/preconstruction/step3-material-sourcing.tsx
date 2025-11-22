"use client";

import React, { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronsUpDown,
  Layers,
  Loader2,
  PlusCircle,
  Search,
  Trash2,
  Upload,
  X,
  ExternalLink,
  Edit,
  FileText,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import LocationPicker from "@/components/ui/location-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Material, MaterialStatus, units } from "./types";

type MaterialDraft = {
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

type Props = {
  onNext: () => void;
  onBack: () => void;
  onAddMaterial: (
    material: MaterialDraft,
    specSheet?: File | null,
    materialId?: string
  ) => Promise<void>;
  onDeleteMaterial: (materialId: string) => Promise<void>;
  materials: Material[];
  isSavingMaterial: boolean;
  deletingMaterialId?: string | null;
};

const MATERIAL_STATUS_BADGE: Record<string, string> = {
  Vetted:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
  Identified: "bg-sky-100 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300",
  Denied: "bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300",
  "Not Delivered":
    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
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

export default function Step3MaterialSourcing({
  onNext,
  onBack,
  onAddMaterial,
  onDeleteMaterial,
  materials,
  isSavingMaterial,
  deletingMaterialId,
}: Props) {
  const [newMaterial, setNewMaterial] = useState<Partial<Material>>({
    category: "",
    name: "",
    supplier: "",
    cost: "",
    unit: "",
    notes: "",
    status: "Identified",
  });
  const [warehouse, setWarehouse] = useState("");
  const [open, setOpen] = React.useState(false);
  const [specSheet, setSpecSheet] = useState<File | null>(null);
  const [credentialInput, setCredentialInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleEditMaterial = (material: Material) => {
    setNewMaterial({
      category: material.category,
      name: material.name,
      supplier: material.supplier,
      cost: material.cost,
      unit: material.unit,
      notes: material.notes,
      credentials: material.credentials,
      status: material.status,
    });
    setWarehouse(material.warehouse || "");
    setEditingId(material.id);
    // Scroll to top to see the form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    resetMaterialForm();
  };

  const handleAddCredential = () => {
    const trimmed = credentialInput.trim().replace(/;$/, "");
    if (!trimmed) return;

    const currentCredentials = newMaterial.credentials
      ? newMaterial.credentials
          .split(";")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    if (!currentCredentials.includes(trimmed)) {
      const newCredentials = [...currentCredentials, trimmed].join(";");
      setNewMaterial((prev) => ({ ...prev, credentials: newCredentials }));
    }
    setCredentialInput("");
  };

  const handleRemoveCredential = (credentialToRemove: string) => {
    const currentCredentials = newMaterial.credentials
      ? newMaterial.credentials
          .split(";")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    const newCredentials = currentCredentials
      .filter((n) => n !== credentialToRemove)
      .join(";");
    setNewMaterial((prev) => ({ ...prev, credentials: newCredentials }));
  };

  const handleCredentialKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter" || e.key === ";") {
      e.preventDefault();
      handleAddCredential();
    }
  };

  const materialIsValid = useMemo(() => {
    return (
      !!newMaterial.category &&
      !!newMaterial.name &&
      !!newMaterial.supplier &&
      !!newMaterial.cost &&
      !!newMaterial.unit &&
      !!newMaterial.status
    );
  }, [
    newMaterial.category,
    newMaterial.name,
    newMaterial.supplier,
    newMaterial.cost,
    newMaterial.unit,
    newMaterial.status,
  ]);

  const handleAddMaterial = async () => {
    if (!materialIsValid) {
      console.warn("Please fill all required fields");
      return;
    }

    try {
      await onAddMaterial(
        {
          category: newMaterial.category!,
          name: newMaterial.name!,
          supplier: newMaterial.supplier!,
          cost: newMaterial.cost!,
          unit: newMaterial.unit!,
          notes: newMaterial.notes ?? "",
          credentials: newMaterial.credentials,
          status: newMaterial.status!,
          warehouse,
        },
        specSheet,
        editingId ?? undefined
      );
      resetMaterialForm();
    } catch (error) {
      console.error("Failed to add material", error);
    }
  };

  const resetMaterialForm = () => {
    setNewMaterial({
      category: "",
      name: "",
      supplier: "",
      cost: "",
      unit: "",
      notes: "",
      credentials: "",
      status: "Identified",
    });
    setWarehouse("");
    setSpecSheet(null);
    setCredentialInput("");
    setEditingId(null);
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewMaterial((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <section className="w-full pb-12">
      <div className="mx-auto flex w-full flex-col gap-8 px-4 sm:px-6">
        <header className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <div className="rounded-lg bg-emerald-100 p-1.5 dark:bg-emerald-900/40">
              <Layers className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold sm:text-xl">
              Step 3: Material Sourcing & Due Diligence
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Capture the sourcing pipeline for critical project materials and
            suppliers.
          </p>
        </header>

        <Card className="border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950/40">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {editingId
                  ? "Edit Material"
                  : "Material Sourcing & Due Diligence"}
              </CardTitle>
            </div>
            <CardDescription>
              {editingId
                ? "Update the details for this sourced material."
                : "Capture the sourcing pipeline for critical project materials and suppliers."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Material Category</Label>
                <Select
                  value={newMaterial.category || ""}
                  onValueChange={(value) =>
                    handleSelectChange("category", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Material" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Concrete">Concrete</SelectItem>
                    <SelectItem value="Masonry">Masonry</SelectItem>
                    <SelectItem value="Structural Steel">
                      Structural Steel
                    </SelectItem>
                    <SelectItem value="Carpentry">Carpentry</SelectItem>
                    <SelectItem value="Roofing & Waterproofing">
                      Roofing & Waterproofing
                    </SelectItem>
                    <SelectItem value="Doors & Windows">
                      Doors & Windows
                    </SelectItem>
                    <SelectItem value="Interior Finishes">
                      Interior Finishes
                    </SelectItem>
                    <SelectItem value="Plumbing">Plumbing</SelectItem>
                    <SelectItem value="Electrical">Electrical</SelectItem>
                    <SelectItem value="Landscaping">Landscaping</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Planned Supplier</Label>
                <Input
                  placeholder="e.g., KLH Massivholz"
                  value={newMaterial.supplier || ""}
                  onChange={(event) =>
                    setNewMaterial({
                      ...newMaterial,
                      supplier: event.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Material Name</Label>
              <Input
                placeholder="e.g., Cross-Laminated Timber"
                value={newMaterial.name || ""}
                onChange={(event) =>
                  setNewMaterial({ ...newMaterial, name: event.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Warehouse of the supplier</Label>
              <LocationPicker value={warehouse} onChange={setWarehouse} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Cost per Unit</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="150000"
                  value={newMaterial.cost || ""}
                  onChange={(event) =>
                    setNewMaterial({
                      ...newMaterial,
                      cost: event.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="flex w-full justify-between border-gray-300 bg-white/80 dark:border-gray-700 dark:bg-gray-900/80"
                    >
                      {newMaterial.unit
                        ? units.find((unit) => unit.value === newMaterial.unit)
                            ?.label
                        : "Select unit..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Search unit..." />
                      <CommandEmpty>No unit found.</CommandEmpty>
                      <CommandGroup>
                        {units.map((unit) => (
                          <CommandItem
                            key={unit.value}
                            value={unit.value}
                            onSelect={(currentValue) => {
                              handleSelectChange(
                                "unit",
                                currentValue === newMaterial.unit
                                  ? ""
                                  : currentValue
                              );
                              setOpen(false);
                            }}
                          >
                            {unit.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Sustainability Credentials</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {newMaterial.credentials
                  ?.split(";")
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .map((credential, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {credential}
                      <button
                        type="button"
                        onClick={() => handleRemoveCredential(credential)}
                        className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      </button>
                    </Badge>
                  ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., FSC Certified; EPD Available"
                  value={credentialInput}
                  onChange={(e) => setCredentialInput(e.target.value)}
                  onKeyDown={handleCredentialKeyDown}
                  onBlur={handleAddCredential}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAddCredential}
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Separate multiple credentials with semicolons or press Enter.
              </p>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center">
                <Search className="mr-2 h-4 w-4" /> Supplier Vetting Notes
              </Label>
              <Textarea
                placeholder="Document your due diligence here. Why this supplier? ESG score? Transport distance?"
                value={newMaterial.notes || ""}
                onChange={(event) =>
                  setNewMaterial({ ...newMaterial, notes: event.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center">
                <Upload className="mr-2 h-4 w-4" /> Upload Spec Sheet/EPD
              </Label>
              <label
                htmlFor="spec-sheet-upload"
                className="group flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-emerald-300/60 bg-emerald-50/60 px-4 py-3 text-sm font-medium text-emerald-700 transition-all hover:border-emerald-400 hover:bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100 dark:hover:border-emerald-700/70 dark:hover:bg-emerald-900/40"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 transition-colors group-hover:bg-emerald-500/20">
                    <Upload className="h-4 w-4" />
                  </span>
                  <div className="flex flex-col gap-1 text-left">
                    <span className="leading-none">Choose PDF</span>
                    <span className="text-xs text-muted-foreground dark:text-emerald-100/70">
                      Max 10 MB · .pdf only
                    </span>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-600 transition group-hover:bg-emerald-500/20">
                  Browse
                </span>
              </label>
              <Input
                id="spec-sheet-upload"
                type="file"
                accept=".pdf"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  setSpecSheet(file ?? null);
                }}
              />
              {specSheet ? (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-100">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate" title={specSheet.name}>
                      {specSheet.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-600 hover:bg-emerald-500/20 dark:bg-emerald-900/40 dark:text-emerald-200 dark:hover:bg-emerald-900/60"
                    onClick={() => setSpecSheet(null)}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Attach lifecycle documentation to strengthen ESG review.
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Vetting Status</Label>
                <Select
                  name="status"
                  value={newMaterial.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vetted">Vetted</SelectItem>
                    <SelectItem value="Identified">Identified</SelectItem>
                    <SelectItem value="Denied">Denied</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isSavingMaterial}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="button"
                onClick={handleAddMaterial}
                disabled={isSavingMaterial || !materialIsValid}
              >
                {isSavingMaterial ? (
                  "Saving..."
                ) : (
                  <span className="flex items-center">
                    <PlusCircle className="mr-2 h-4 w-4" />{" "}
                    {editingId ? "Update Material" : "Add to Sourcing Plan"}
                  </span>
                )}
              </Button>
            </div>
            <div className="space-y-3 border-t border-dashed border-gray-200 pt-6 dark:border-gray-800">
              <h5 className="text-sm font-medium text-muted-foreground">
                Materials Added
              </h5>
              {materials.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Log at least one sourced item to complete this stage.
                </p>
              ) : (
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Material</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Planned Supplier</TableHead>
                        <TableHead>Warehouse</TableHead>
                        <TableHead className="text-right">
                          Cost per Unit
                        </TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Delivery Status</TableHead>
                        <TableHead>Credentials</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead>Spec Sheet</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {materials.map((material) => (
                        <TableRow key={material.id}>
                          <TableCell className="font-medium">
                            {material.name}
                          </TableCell>
                          <TableCell>{material.category}</TableCell>
                          <TableCell>{material.supplier}</TableCell>
                          <TableCell>
                            <div
                              className="max-w-[150px] truncate"
                              title={material.warehouse}
                            >
                              {material.warehouse ?? "—"}
                            </div>
                          </TableCell>
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
                          <TableCell>
                            {material.deliveryStatus ?? "—"}
                          </TableCell>
                          <TableCell
                            className="max-w-[200px] truncate"
                            title={material.credentials}
                          >
                            {material.credentials ?? "—"}
                          </TableCell>
                          <TableCell
                            className="max-w-[200px] truncate"
                            title={material.notes}
                          >
                            {material.notes ?? "—"}
                          </TableCell>
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
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditMaterial(material)}
                                disabled={
                                  isSavingMaterial ||
                                  deletingMaterialId === material.id
                                }
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50"
                                onClick={() => {
                                  void onDeleteMaterial(material.id);
                                }}
                                disabled={
                                  isSavingMaterial ||
                                  deletingMaterialId === material.id
                                }
                                aria-label="Delete material"
                              >
                                {deletingMaterialId === material.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 border-t border-gray-100 pt-6 dark:border-gray-800 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-sm text-muted-foreground">
            Save at least one material before moving forward.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onBack}>
              Previous
            </Button>
            <Button onClick={onNext}>Next</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
