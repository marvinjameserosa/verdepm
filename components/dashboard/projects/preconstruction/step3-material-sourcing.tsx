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
    specSheet?: File | null
  ) => Promise<void>;
  onDeleteMaterial: (materialId: string) => Promise<void>;
  materials: Material[];
  isSavingMaterial: boolean;
  deletingMaterialId?: string | null;
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
        specSheet
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
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewMaterial((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <section className="w-full pb-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 sm:px-6">
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
                Material Sourcing & Due Diligence
              </CardTitle>
            </div>
            <CardDescription>
              Capture the sourcing pipeline for critical project materials and
              suppliers.
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
                <Label>Estimated Cost per Unit ($)</Label>
                <Input
                  type="number"
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
              <Input
                type="file"
                accept=".pdf"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  setSpecSheet(file ?? null);
                }}
              />
              {specSheet && (
                <p className="truncate text-xs text-muted-foreground">
                  Selected: {specSheet.name}
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
                    <SelectItem value="Not Delivered">Not Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={handleAddMaterial}
                disabled={isSavingMaterial || !materialIsValid}
              >
                {isSavingMaterial ? (
                  "Saving..."
                ) : (
                  <span className="flex items-center">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add to Sourcing Plan
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
                <div className="grid gap-3">
                  {materials.map((material) => (
                    <div
                      key={material.id}
                      className="rounded-lg border border-gray-200 bg-white/80 p-3 text-sm dark:border-gray-800 dark:bg-gray-900/60"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="font-semibold text-emerald-700 dark:text-emerald-200">
                            {material.name}
                          </div>
                          <div className="text-muted-foreground">
                            {material.supplier} • {material.unit ?? "--"}
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <span>Status: {material.status}</span>
                            {material.credentials && (
                              <span>• {material.credentials}</span>
                            )}
                            {material.specSheetUrl && (
                              <span>
                                •{" "}
                                <a
                                  href={material.specSheetUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline dark:text-blue-400"
                                >
                                  View Spec Sheet
                                </a>
                              </span>
                            )}
                          </div>
                        </div>
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
                    </div>
                  ))}
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
