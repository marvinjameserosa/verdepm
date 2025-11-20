"use client";

import React, { useEffect, useMemo, useState } from "react";
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
  GanttChartSquare,
  Layers,
  Loader2,
  PlusCircle,
  Search,
  Target,
  Trash2,
  Upload,
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
import { Material, MaterialStatus, type EsgTarget, units } from "./types";
import {
  TargetDraft,
  usePreconstructionEsgTargets,
} from "@/hooks/usePreconstructionEsgTargets";

type TargetForm = TargetDraft & {
  category: TargetDraft["category"] | "";
};

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
  onAddMaterial: (material: MaterialDraft, specSheet?: File | null) => Promise<void>;
  onDeleteMaterial: (materialId: string) => Promise<void>;
  projectSetupId?: string | null;
  initialTargets?: EsgTarget[];
  onTargetsChange?: (targets: EsgTarget[]) => void;
  onError?: (message: string) => void;
  onResetFeedback?: () => void;
  materials: Material[];
  isSavingMaterial: boolean;
  deletingMaterialId?: string | null;
};

export default function Step2TargetSetting({
  onNext,
  onBack,
  onAddMaterial,
  onDeleteMaterial,
  projectSetupId,
  initialTargets,
  onTargetsChange,
  onError,
  onResetFeedback,
  materials,
  isSavingMaterial,
  deletingMaterialId,
}: Props) {
  const [targetForm, setTargetForm] = useState<TargetForm>({
    category: "",
    goal: "",
    metric: "",
  });
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

  const {
    targets: targetItems,
    isLoading: isLoadingTargets,
    isSaving: isSavingTarget,
    deletingTargetId,
    saveTarget,
    deleteTarget,
  } = usePreconstructionEsgTargets({
    projectSetupId,
    initialTargets,
    onError,
    onResetFeedback,
  });

  useEffect(() => {
    onTargetsChange?.(targetItems);
  }, [onTargetsChange, targetItems]);

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
  };

  const handleTargetSave = async () => {
    if (!targetForm.category || !targetForm.goal || !targetForm.metric) {
      console.warn("Target details are incomplete.");
      return;
    }
    if (!projectSetupId) {
      onResetFeedback?.();
      onError?.("Save project setup before adding ESG targets.");
      return;
    }
    try {
      const savedTarget = await saveTarget({
        category: targetForm.category as TargetDraft["category"],
        goal: targetForm.goal,
        metric: targetForm.metric,
      });
      if (savedTarget) {
        setTargetForm({ category: "", goal: "", metric: "" });
      }
    } catch (error) {
      console.error("Failed to save target", error);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewMaterial((prev) => ({ ...prev, [name]: value }));
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
    if (
      !materialIsValid
    ) {
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

  return (
    <section className="w-full">
      <Card className="w-full max-w-5xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-md">
        <CardHeader className="gap-4 border-b border-gray-100 dark:border-gray-800">
          <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
              <GanttChartSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            Step 2: Target Setting & Material Sourcing
          </CardTitle>
          <CardDescription>
            Capture measurable ESG ambitions, then log supporting materials and
            suppliers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 p-6 lg:p-8">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950/40 p-5 space-y-5 h-full shadow-sm">
            <h4 className="font-semibold flex items-center gap-2">
              <Target className="h-5 w-5" /> Define ESG Targets
            </h4>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={targetForm.category}
                    onValueChange={(value: TargetForm["category"]) =>
                      setTargetForm((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Environmental">
                        Environmental
                      </SelectItem>
                      <SelectItem value="Social">Social</SelectItem>
                      <SelectItem value="Governance">Governance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Goal</Label>
                  <Input
                    placeholder="e.g., Reduce Embodied Carbon"
                    value={targetForm.goal}
                    onChange={(e) =>
                      setTargetForm((prev) => ({ ...prev, goal: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Metric / KPI</Label>
                  <Input
                    placeholder="e.g., < 500 kgCO2e/m²"
                    value={targetForm.metric}
                    onChange={(e) =>
                      setTargetForm((prev) => ({ ...prev, metric: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={handleTargetSave}
                  disabled={
                    isSavingTarget ||
                    !projectSetupId ||
                    !targetForm.category ||
                    !targetForm.goal.trim() ||
                    !targetForm.metric.trim()
                  }
                >
                  {isSavingTarget ? "Saving..." : "Save Target"}
                </Button>
              </div>
              <div className="space-y-2 pt-4 border-t border-dashed border-gray-200 dark:border-gray-800">
                <h5 className="text-sm font-medium text-muted-foreground">
                  Saved Targets
                </h5>
                {isLoadingTargets ? (
                  <p className="text-xs text-muted-foreground">
                    Loading saved ESG targets...
                  </p>
                ) : targetItems.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Once saved, your ESG goals will appear here for quick
                    reference.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {targetItems.map((target) => (
                      <li
                        key={target.id}
                        className="flex flex-col gap-2 rounded-lg border border-gray-200 dark:border-gray-800 p-3 bg-white/80 dark:bg-gray-900/60"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <span className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-200">
                              {target.category}
                            </span>
                            <span className="block text-sm font-semibold">{target.goal}</span>
                            <span className="block text-xs text-muted-foreground">
                              Metric: {target.metric}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50"
                            onClick={() => {
                              void deleteTarget(target.id);
                            }}
                            disabled={isSavingTarget || deletingTargetId === target.id}
                            aria-label="Delete target"
                          >
                            {deletingTargetId === target.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 bg-white dark:bg-gray-950/40 space-y-5 h-full shadow-sm">
            <h4 className="font-semibold flex items-center gap-2">
              <Layers className="h-5 w-5" /> Material Sourcing & Due Diligence
            </h4>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    onChange={(e) =>
                      setNewMaterial({
                        ...newMaterial,
                        supplier: e.target.value,
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
                  onChange={(e) =>
                    setNewMaterial({ ...newMaterial, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Warehouse of the supplier</Label>
                <Input
                  placeholder="e.g., '456 Logistics Rd, Industrial Park'"
                  value={warehouse}
                  onChange={(event) => setWarehouse(event.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Budgeted Cost ($)</Label>
                  <Input
                    type="number"
                    placeholder="150000"
                    value={newMaterial.cost || ""}
                    onChange={(e) =>
                      setNewMaterial({
                        ...newMaterial,
                        cost: e.target.value,
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
                        className="w-full justify-between bg-white/80 dark:bg-gray-900/80 border-gray-300 dark:border-gray-700"
                      >
                        {newMaterial.unit
                          ? units.find(
                              (unit) => unit.value === newMaterial.unit
                            )?.label
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
                <Input
                  placeholder="e.g., FSC Certified, EPD Available"
                  value={newMaterial.credentials || ""}
                  onChange={(e) =>
                    setNewMaterial({
                      ...newMaterial,
                      credentials: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center">
                  <Search className="mr-2 h-4 w-4" /> Supplier Vetting Notes
                </Label>
                <Textarea
                  placeholder="Document your due diligence here. Why this supplier? ESG score? Transport distance?"
                  value={newMaterial.notes || ""}
                  onChange={(e) =>
                    setNewMaterial({ ...newMaterial, notes: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <p className="text-xs text-muted-foreground truncate">
                      Selected: {specSheet.name}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Vetting Status</Label>
                  <Select
                    name="status"
                    value={newMaterial.status}
                    onValueChange={(value) =>
                      handleSelectChange("status", value)
                    }
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
              <div className="pt-6 border-t border-dashed border-gray-200 dark:border-gray-800 space-y-3">
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
                        className="border border-gray-200 dark:border-gray-800 rounded-lg p-3 text-sm bg-white/80 dark:bg-gray-900/60"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="font-semibold text-emerald-700 dark:text-emerald-200">
                              {material.name}
                            </div>
                            <div className="text-muted-foreground">
                              {material.supplier} • {material.unit ?? "--"}
                            </div>
                            <div className="text-xs text-muted-foreground flex flex-wrap gap-2">
                              <span>Status: {material.status}</span>
                              {material.credentials && (
                                <span>• {material.credentials}</span>
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
                            disabled={isSavingMaterial || deletingMaterialId === material.id}
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
            </div>
          </div>
          <div className="flex flex-col gap-3 border-t border-gray-100 dark:border-gray-800 pt-6 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-sm text-muted-foreground">
              Save at least one target and one material before moving forward.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onBack}>
                Previous
              </Button>
              <Button onClick={onNext}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
