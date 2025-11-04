"use client";

import React, { useState } from "react";
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
  PlusCircle,
  Search,
  Target,
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
import { Material, units } from "./types";

type Props = {
  onNext: () => void;
  onBack: () => void;
  addMaterial: (material: Material) => void;
};

export default function Step2TargetSetting({
  onNext,
  onBack,
  addMaterial,
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
  const [open, setOpen] = React.useState(false);

  const handleSelectChange = (name: string, value: string) => {
    setNewMaterial((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddMaterial = () => {
    if (
      newMaterial.name &&
      newMaterial.supplier &&
      newMaterial.cost &&
      newMaterial.unit &&
      newMaterial.status
    ) {
      addMaterial({
        id: Date.now(),
        ...newMaterial,
      } as Material);
      setNewMaterial({
        category: "",
        name: "",
        supplier: "",
        cost: "",
        unit: "",
        notes: "",
        status: "Identified",
      });
    } else {
      console.log("Please fill all required fields");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-4xl backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
              <GanttChartSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            Step 2: Target Setting & Material Sourcing
          </CardTitle>
          <CardDescription>
            Set ESG targets and identify potential sustainable materials and
            suppliers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Target className="h-5 w-5" /> Define ESG Targets
            </h4>
            <div className="p-4 border rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select>
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
                  <Input placeholder="e.g., Reduce Embodied Carbon" />
                </div>
                <div className="space-y-2">
                  <Label>Metric / KPI</Label>
                  <Input placeholder="e.g., < 500 kgCO2e/m²" />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Layers className="h-5 w-5" /> Material Sourcing & Due Diligence
            </h4>
            <div className="p-4 border rounded-lg space-y-4">
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
                <Input placeholder="e.g., '456 Logistics Rd, Industrial Park'" />
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
                  <Input type="file" />
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
                <Button onClick={handleAddMaterial}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add to Sourcing Plan
                </Button>
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={onBack}>
              Previous
            </Button>
            <Button onClick={onNext}>Next</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
