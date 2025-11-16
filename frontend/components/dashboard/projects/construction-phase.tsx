"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Fuel,
  Zap,
  Droplets,
  Construction,
  Trash2,
  ShieldAlert,
  Target,
  Send,
  PackageCheck,
  PlusCircle,
} from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import type { Project } from "@/types/project";

interface MaterialLogEntry {
  id: string;
  materialName: string;
  supplier: string;
  quantity: string;
  unit: string;
  cost: string;
  fuel: string;
  receiptFile?: File | null;
  receiptPath?: string | null;
}

// --- Mock Data from Pre-Construction Phase (Passed as props or fetched) ---
const preConstructionData = {
  targets: {
    emissions: {
      goal: "Reduce Embodied & Operational Carbon",
      metric: "< 500 kgCO2e/m²",
    },
    water: {
      goal: "Achieve Net-Zero Water",
      metric: "100% rainwater harvesting",
    },
    waste: {
      goal: "Divert 90% of Waste from Landfill",
      metric: "90% by weight",
    },
    safety: { goal: "Maintain a Zero-Incident Site", metric: "0 LTI" },
  },
  materials: [
    { name: "Cross-Laminated Timber (CLT)", plannedSupplier: "KLH Massivholz" },
    { name: "Recycled Steel Beams", plannedSupplier: "Gerdau" },
    { name: "Low-E Glass Panels", plannedSupplier: "Guardian Glass" },
    { name: "Rainwater Harvesting System", plannedSupplier: "WaterHarv Co." },
  ],
};

// --- Reusable Metric Card Component (No changes here) ---
interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  unit: string;
  relatedTarget: { goal: string; metric: string };
  value: string;
  onChange: (value: string) => void;
  dailyGoal: number;
}

function MetricCard({
  icon,
  title,
  unit,
  relatedTarget,
  value,
  onChange,
  dailyGoal,
}: MetricCardProps) {
  const numericValue = parseFloat(value) || 0;
  const progress = Math.min((numericValue / dailyGoal) * 100, 100);
  const isOverTarget = numericValue > dailyGoal && dailyGoal > 0;

  return (
    <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
          {title}
        </CardTitle>
        <div className="p-1 rounded bg-emerald-100 dark:bg-emerald-900/40">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-xs text-muted-foreground mb-4 p-2 bg-secondary rounded-md">
          <Target className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>
            Tracking against goal: <strong>{relatedTarget.goal}</strong>
          </span>
        </div>
        <div className="space-y-2">
          <Label htmlFor={title}>{`Today's ${title} (${unit})`}</Label>
          <Input
            id={title}
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter value in ${unit}`}
          />
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Daily Progress</span>
            <span>
              {numericValue} / {dailyGoal} {unit}
            </span>
          </div>
          <Progress
            value={progress}
            className={isOverTarget ? "progress-red" : ""}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// --- Main Construction Phase Component ---
type ConstructionPhaseProps = {
  project: Project;
};

export default function ConstructionPhase({ project }: ConstructionPhaseProps) {
  const [dailyMetrics, setDailyMetrics] = useState<Record<string, string>>({
    fuel: "",
    electricity: "",
    water: "",
    equipment: "",
    waste: "",
    safety: "",
  });
  const [loggedMaterials, setLoggedMaterials] = useState<MaterialLogEntry[]>(
    []
  );
  const [newMaterialEntry, setNewMaterialEntry] = useState<
    Partial<MaterialLogEntry>
  >({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const resetMessages = () => {
    setStatusMessage(null);
    setErrorMessage(null);
  };

  const handleInputChange = (metric: string, value: string) => {
    setDailyMetrics((prev) => ({ ...prev, [metric]: value }));
  };

  const handleMaterialEntryChange = (
    field: keyof MaterialLogEntry,
    value: string
  ) => {
    setNewMaterialEntry((prev) => ({ ...prev, [field]: value }));
  };

  const handleReceiptChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setNewMaterialEntry((prev) => ({ ...prev, receiptFile: file }));
  };

  const addMaterialToLog = () => {
    if (!newMaterialEntry.materialName) {
      setErrorMessage("Select a material from the plan before adding.");
      return;
    }
    if (!newMaterialEntry.quantity) {
      setErrorMessage("Enter the delivered quantity before adding.");
      return;
    }
    if (!newMaterialEntry.unit) {
      setErrorMessage("Provide the unit for the delivered quantity.");
      return;
    }
    if (!newMaterialEntry.supplier || newMaterialEntry.supplier.trim().length === 0) {
      setErrorMessage("Enter the actual supplier for this delivery.");
      return;
    }
    setLoggedMaterials([
      ...loggedMaterials,
      {
        ...newMaterialEntry,
        id: crypto.randomUUID(),
      } as MaterialLogEntry,
    ]);
    setNewMaterialEntry({}); // Reset form
    setErrorMessage(null);
  };

  const handleSubmit = async () => {
    resetMessages();

    if (
      !dailyMetrics.fuel &&
      !dailyMetrics.electricity &&
      !dailyMetrics.water &&
      !dailyMetrics.equipment &&
      !dailyMetrics.waste &&
      !dailyMetrics.safety
    ) {
      setErrorMessage("Enter at least one daily metric before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      const parseNumber = (value: string) => {
        if (!value) {
          return null;
        }
        const trimmed = value.trim();
        if (!trimmed) {
          return null;
        }
        const parsed = Number(trimmed);
        if (Number.isNaN(parsed)) {
          throw new Error("One of the numeric fields contains invalid data.");
        }
        return parsed;
      };

      const parseOptionalNumber = (value?: string) => {
        if (!value) {
          return null;
        }
        const trimmed = value.trim();
        if (!trimmed) {
          return null;
        }
        const parsed = Number(trimmed);
        if (Number.isNaN(parsed)) {
          throw new Error("Material entries contain an invalid number.");
        }
        return parsed;
      };

      const safetyValue = dailyMetrics.safety
        ? Number(dailyMetrics.safety)
        : 0;
      if (Number.isNaN(safetyValue)) {
        throw new Error("Safety incidents must be a number.");
      }

      const { data: dailyLog, error: dailyError } = await supabase
        .from("construction_daily_log")
        .insert([
          {
            project_id: project.id,
            log_date: today,
            fuel_consumption_liters: parseNumber(dailyMetrics.fuel),
            electricity_usage_kwh: parseNumber(dailyMetrics.electricity),
            water_consumption_cubic_m: parseNumber(dailyMetrics.water),
            equipment_usage_hours: parseNumber(dailyMetrics.equipment),
            todays_waste_generated_kg: parseNumber(dailyMetrics.waste),
            safety_incidents: safetyValue,
          },
        ])
        .select("id")
        .single();

      if (dailyError) {
        if ("code" in dailyError && dailyError.code === "23505") {
          throw new Error("A daily report for today already exists.");
        }
        throw dailyError;
      }

      let dailyLogId = dailyLog?.id as string | undefined;

      if (!dailyLogId) {
        const { data: fallback, error: fetchError } = await supabase
          .from("construction_daily_log")
          .select("id")
          .eq("project_id", project.id)
          .eq("log_date", today)
          .maybeSingle();

        if (fetchError) {
          throw fetchError;
        }
        if (!fallback) {
          throw new Error("Daily report saved but could not retrieve identifier.");
        }
        dailyLogId = fallback.id;
      }

      const bucket = supabase.storage.from("construction-docs");

      if (loggedMaterials.length > 0) {
        const materialPayload = await Promise.all(
          loggedMaterials.map(async (entry) => {
            let receiptPath: string | null = null;

            if (entry.receiptFile) {
              const extension = entry.receiptFile.name.split(".").pop() || "pdf";
              const storagePath = `project/${project.id}/daily/${dailyLog.id}/receipts/${crypto.randomUUID()}.${extension}`;
              const { error: uploadError } = await bucket.upload(
                storagePath,
                entry.receiptFile,
                {
                  contentType: entry.receiptFile.type || "application/pdf",
                  upsert: true,
                }
              );

              if (uploadError) {
                throw uploadError;
              }

              receiptPath = storagePath;
            }

            return {
              project_id: project.id,
                daily_log_id: dailyLogId,
              material_plan: entry.materialName,
              actual_supplier: entry.supplier,
              quantity_and_unit: `${entry.quantity ?? ""} ${entry.unit ?? ""}`.trim(),
              total_cost: parseOptionalNumber(entry.cost),
              delivery_fuel_used_liters: parseOptionalNumber(entry.fuel),
              receipt_path: receiptPath,
            };
          })
        );

        const { error: materialError } = await supabase
          .from("construction_material_log")
          .insert(materialPayload);

        if (materialError) {
          throw materialError;
        }
      }

      setStatusMessage("Daily report saved successfully.");
      setDailyMetrics({
        fuel: "",
        electricity: "",
        water: "",
        equipment: "",
        waste: "",
        safety: "",
      });
      setLoggedMaterials([]);
    } catch (error) {
      console.error("Failed to submit daily report", error);
      const message =
        error instanceof Error ? error.message : "Unable to submit report.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const metricCards = [
    {
      id: "fuel",
      icon: <Fuel className="h-4 w-4 text-muted-foreground" />,
      title: "Fuel Consumption",
      unit: "liters",
      relatedTarget: preConstructionData.targets.emissions,
      dailyGoal: 500,
    },
    {
      id: "electricity",
      icon: <Zap className="h-4 w-4 text-muted-foreground" />,
      title: "Electricity Usage",
      unit: "kWh",
      relatedTarget: preConstructionData.targets.emissions,
      dailyGoal: 2000,
    },
    {
      id: "water",
      icon: <Droplets className="h-4 w-4 text-muted-foreground" />,
      title: "Water Consumption",
      unit: "m³",
      relatedTarget: preConstructionData.targets.water,
      dailyGoal: 10,
    },
    {
      id: "equipment",
      icon: <Construction className="h-4 w-4 text-muted-foreground" />,
      title: "Equipment Usage",
      unit: "hours",
      relatedTarget: preConstructionData.targets.emissions,
      dailyGoal: 100,
    },
    {
      id: "waste",
      icon: <Trash2 className="h-4 w-4 text-muted-foreground" />,
      title: "Waste Generated",
      unit: "kg",
      relatedTarget: preConstructionData.targets.waste,
      dailyGoal: 250,
    },
    {
      id: "safety",
      icon: <ShieldAlert className="h-4 w-4 text-muted-foreground" />,
      title: "Safety Incidents",
      unit: "incidents",
      relatedTarget: preConstructionData.targets.safety,
      dailyGoal: 0,
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
        <CardHeader>
          <CardTitle className="text-emerald-700 dark:text-emerald-300">
            Construction Phase: Daily ESG Monitoring
          </CardTitle>
          <CardDescription>
            Log daily metrics and material deliveries to track performance
            against pre-construction targets.
          </CardDescription>
        </CardHeader>
      </Card>

      {errorMessage ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}
      {statusMessage ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {statusMessage}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricCards.map((metric) => (
          <MetricCard
            key={metric.id}
            {...metric}
            value={dailyMetrics[metric.id]}
            onChange={(value) => handleInputChange(metric.id, value)}
          />
        ))}
      </div>

      {/* --- NEW MATERIAL SOURCING LOG --- */}
      <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
              <PackageCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            Material Sourcing Log
          </CardTitle>
          <CardDescription>
            Log all material deliveries as they arrive on-site. This data will
            be compared against the pre-construction plan for post-project
            analysis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 border rounded-lg space-y-4">
            <h4 className="font-semibold">Add New Material Delivery</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Material (from plan)</Label>
                <Select
                  value={newMaterialEntry.materialName || ""}
                  onValueChange={(value) =>
                    handleMaterialEntryChange("materialName", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Material" />
                  </SelectTrigger>
                  <SelectContent>
                    {preConstructionData.materials.map((mat) => (
                      <SelectItem key={mat.name} value={mat.name}>
                        {mat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Actual Supplier</Label>
                <Input
                  placeholder="e.g., 'Local Timber Yard'"
                  value={newMaterialEntry.supplier || ""}
                  onChange={(e) =>
                    handleMaterialEntryChange("supplier", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Quantity & Unit</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="e.g., 50"
                    value={newMaterialEntry.quantity || ""}
                    onChange={(e) =>
                      handleMaterialEntryChange("quantity", e.target.value)
                    }
                  />
                  <Input
                    placeholder="m³"
                    value={newMaterialEntry.unit || ""}
                    onChange={(e) =>
                      handleMaterialEntryChange("unit", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Total Cost ($)</Label>
                <Input
                  type="number"
                  placeholder="e.g., 15000"
                  value={newMaterialEntry.cost || ""}
                  onChange={(e) =>
                    handleMaterialEntryChange("cost", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Delivery Fuel Used (Liters)</Label>
                <Input
                  type="number"
                  placeholder="e.g., 25"
                  value={newMaterialEntry.fuel || ""}
                  onChange={(e) =>
                    handleMaterialEntryChange("fuel", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Upload Receipt</Label>
                <Input type="file" onChange={handleReceiptChange} />
              </div>
            </div>
            <Button onClick={addMaterialToLog} className="w-full md:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Add to Daily Log
            </Button>
          </div>

          <div className="mt-6">
            <h4 className="font-semibold mb-2">Today&apos;s Material Log</h4>
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loggedMaterials.length > 0 ? (
                    loggedMaterials.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">
                          {entry.materialName}
                        </TableCell>
                        <TableCell>{entry.supplier}</TableCell>
                        <TableCell>
                          {entry.quantity} {entry.unit}
                        </TableCell>
                        <TableCell className="text-right">
                          ${parseFloat(entry.cost || "0").toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        No materials logged for today.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Button onClick={handleSubmit} className="w-full" disabled={isSubmitting}>
            <Send className="mr-2 h-4 w-4" />
            {isSubmitting ? "Submitting..." : "Submit Full Daily Report"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
