"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import dynamic from "next/dynamic";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Truck,
  Loader2,
} from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import type { Project } from "@/types/project";
import type { DeliveryRouteMapProps } from "@/components/dashboard/projects/delivery-route-map";

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

type LatLngTuple = [number, number];

type WasteTreatmentMethod = keyof typeof WASTE_EMISSION_FACTORS_KG_PER_KG;

interface WasteEntry {
  id: string;
  mass: string;
  unit: "kg" | "ton";
  wasteType: string;
  treatmentMethod: WasteTreatmentMethod;
  treatmentPercentage: string;
}

type WasteFormEntry = {
  mass: string;
  unit: "kg" | "ton";
  wasteType: string;
  treatmentMethod: WasteTreatmentMethod | "";
  treatmentPercentage: string;
};

type WasteEntrySummary = WasteEntry & {
  massKg: number;
  allocatedMassKg: number;
  emissionKg: number;
  percentageValue: number;
};

const DeliveryRouteMap = dynamic<DeliveryRouteMapProps>(
  () =>
    import("@/components/dashboard/projects/delivery-route-map").then((module) => {
      // Patch the default export to add null checks for _leaflet_pos errors
      const Original = module.default;
      function SafeDeliveryRouteMap(props: any) {
        try {
          return <Original {...props} />;
        } catch (e) {
          if (
            typeof window !== "undefined" &&
            e &&
            typeof e === "object" &&
            "message" in e &&
            String(e.message).includes("_leaflet_pos")
          ) {
            // Render fallback UI or nothing if _leaflet_pos error occurs
            return <div className="text-red-600 text-xs">Map failed to load. Please refresh or check route data.</div>;
          }
          throw e;
        }
      }
      return SafeDeliveryRouteMap;
    }),
  { ssr: false }
);

const DEFAULT_MAP_CENTER: LatLngTuple = [14.5995, 120.9842];
const DEFAULT_ANIMATION_SAMPLE_SIZE = 160;
const EQUIPMENT_EMISSION_FACTOR_KG_PER_LITER = 2.68; // kg CO2e emitted per liter of fuel burned
const TRIR_STANDARD_HOURS = 200_000; // OSHA baseline exposure hours for TRIR
const PH_GRID_EMISSION_FACTOR_KG_PER_KWH = 0.507; // kg CO2e emitted per kWh for Luzon-Visayas grid
const WATER_SUPPLY_EMISSION_FACTOR_KG_PER_CUBIC_M = 0.264; // kg CO2e emitted per cubic meter of supplied water
const WASTE_EMISSION_FACTORS_KG_PER_KG = {
  landfill: 1.80,
  incineration: 2.80,
  recycling: 0.12,
  compost: 0.10,
} as const;

const sampleRoutePoints = (points: LatLngTuple[], maxPoints = DEFAULT_ANIMATION_SAMPLE_SIZE) => {
  if (points.length <= maxPoints) {
    return points;
  }

  const sampled: LatLngTuple[] = [];
  const step = Math.ceil(points.length / maxPoints);

  for (let index = 0; index < points.length; index += step) {
    sampled.push(points[index]);
  }

  const lastPoint = points[points.length - 1];
  const lastSampled = sampled[sampled.length - 1];
  if (!lastSampled || lastSampled[0] !== lastPoint[0] || lastSampled[1] !== lastPoint[1]) {
    sampled.push(lastPoint);
  }

  return sampled;
};

const formatDuration = (minutes: number | null) => {
  if (!minutes || !Number.isFinite(minutes) || minutes <= 0) {
    return "--";
  }

  const totalMinutes = Math.round(minutes);
  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  if (hours > 0 && remainingMinutes > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }

  if (hours > 0) {
    return `${hours}h`;
  }

  return `${remainingMinutes}m`;
};

const convertWasteMassToKg = (mass: number, unit: "kg" | "ton") =>
  unit === "ton" ? mass * 1_000 : mass;

const createDefaultWasteFormEntry = (): WasteFormEntry => ({
  mass: "",
  unit: "kg",
  wasteType: "",
  treatmentMethod: "",
  treatmentPercentage: "",
});

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

const WASTE_TYPE_OPTIONS = ["Plastic", "Food", "Paper", "Metal", "Glass", "Other"] as const;
const WASTE_TREATMENT_OPTIONS: { value: WasteTreatmentMethod; label: string }[] = [
  { value: "landfill", label: "Landfill" },
  { value: "incineration", label: "Incineration" },
  { value: "recycling", label: "Recycling" },
  { value: "compost", label: "Compost" },
];

// --- Reusable Metric Card Component (No changes here) ---
interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  unit: string;
  relatedTarget: { goal: string; metric: string };
  value: string;
  onChange: (value: string) => void;
  labelPrefix?: string;
  secondaryLabel?: string;
  secondaryValue?: string | null;
}

function MetricCard({
  icon,
  title,
  unit,
  relatedTarget,
  value,
  onChange,
  labelPrefix = "Today's",
  secondaryLabel,
  secondaryValue,
}: MetricCardProps) {
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
          <Label htmlFor={title}>{`${labelPrefix} ${title} (${unit})`}</Label>
          <Input
            id={title}
            type="number"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={`Enter value in ${unit}`}
          />
        </div>
        {secondaryLabel ? (
          <div className="rounded-md bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-900 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-200">
            {secondaryLabel}
            <span className="ml-1 font-semibold">
              {secondaryValue ?? "--"}
            </span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

interface DistanceFuelCardProps {
  distanceValue: string;
  efficiencyValue: string;
  onDistanceChange: (value: string) => void;
  onEfficiencyChange: (value: string) => void;
  computedFuelLiters: number | null;
}

function DistanceFuelCard({
  distanceValue,
  efficiencyValue,
  onDistanceChange,
  onEfficiencyChange,
  computedFuelLiters,
}: DistanceFuelCardProps) {
  // Calculate tCO2e for today's fuel
  const todayTco2e = computedFuelLiters !== null ? computedFuelLiters * 2.68 : null;
  return (
    <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            Route Fuel Summary (For Deliveries)
          </CardTitle>
          <CardDescription className="mt-1">Capture today&apos;s travel distance and efficiency to auto-calculate fuel usage.</CardDescription>
        </div>
        <div className="flex space-x-1">
          <div className="p-1 rounded bg-emerald-100 dark:bg-emerald-900/40">
            <Truck className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-1 rounded bg-emerald-100 dark:bg-emerald-900/40">
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="daily-total-distance">Today&apos;s Total Distance (km)</Label>
            <Input
              id="daily-total-distance"
              type="number"
              value={distanceValue}
              onChange={(event) => onDistanceChange(event.target.value)}
              placeholder="Enter distance travelled"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="daily-fuel-efficiency">Fuel Efficiency (L/km)</Label>
            <Input
              id="daily-fuel-efficiency"
              type="number"
              value={efficiencyValue}
              onChange={(event) => onEfficiencyChange(event.target.value)}
              placeholder="Enter average efficiency"
            />
          </div>
        </div>
        <div className="rounded-md bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-900 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-200">
          Total fuel for today:
          <span className="ml-1 font-semibold">
            {computedFuelLiters !== null ? `${computedFuelLiters.toFixed(2)} L` : "--"}
          </span>
        </div>
        <div className="rounded-md bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-900 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-200">
          Total tCO₂e for today:
          <span className="ml-1 font-semibold">
            {todayTco2e !== null ? `${(todayTco2e).toFixed(2)} tCO₂e` : "--"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

interface EquipmentEmissionsCardProps {
  hoursValue: string;
  fuelRateValue: string;
  onHoursChange: (value: string) => void;
  onFuelRateChange: (value: string) => void;
  computedFuelLiters: number | null;
  computedCo2Kg: number | null;
}

function EquipmentEmissionsCard({
  hoursValue,
  fuelRateValue,
  onHoursChange,
  onFuelRateChange,
  computedFuelLiters,
  computedCo2Kg,
}: EquipmentEmissionsCardProps) {
  return (
    <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            Equipment Emissions Summary
          </CardTitle>
          <CardDescription className="mt-1">
            Log today&apos;s operating hours and average fuel rate to estimate combustion emissions.
          </CardDescription>
        </div>
        <div className="p-1 rounded bg-emerald-100 dark:bg-emerald-900/40">
          <Construction className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="equipment-total-hours">Total Equipment Hours</Label>
            <Input
              id="equipment-total-hours"
              type="number"
              value={hoursValue}
              onChange={(event) => onHoursChange(event.target.value)}
              placeholder="Enter total runtime"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="equipment-fuel-rate">Fuel Rate (L/hour)</Label>
            <Input
              id="equipment-fuel-rate"
              type="number"
              value={fuelRateValue}
              onChange={(event) => onFuelRateChange(event.target.value)}
              placeholder="Enter average consumption"
            />
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="rounded-md bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-900 px-3 py-2 text-emerald-700 dark:text-emerald-200">
            Total fuel consumed:
            <span className="ml-1 font-semibold">
              {computedFuelLiters !== null ? `${computedFuelLiters.toFixed(2)} L` : "--"}
            </span>
          </div>
          <div className="rounded-md bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-900 px-3 py-2 text-emerald-700 dark:text-emerald-200">
            Total CO₂e emitted:
            <span className="ml-1 font-semibold">
              {computedCo2Kg !== null ? `${computedCo2Kg.toFixed(2)} kg` : "--"}
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Calculations assume an emission factor of {EQUIPMENT_EMISSION_FACTOR_KG_PER_LITER} kg CO₂e per liter of fuel burned.
        </p>
      </CardContent>
    </Card>
  );
}

interface SafetyTrirCardProps {
  incidentsValue: string;
  hoursWorkedValue: string;
  onIncidentsChange: (value: string) => void;
  onHoursWorkedChange: (value: string) => void;
  computedTrir: number | null;
  target: { goal: string; metric: string };
}

function SafetyTrirCard({
  incidentsValue,
  hoursWorkedValue,
  onIncidentsChange,
  onHoursWorkedChange,
  computedTrir,
  target,
}: SafetyTrirCardProps) {
  return (
    <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            Safety Performance (TRIR)
          </CardTitle>
          <CardDescription className="mt-1">
            Track recordable incidents and exposure hours to compute today&apos;s total recordable incident rate.
          </CardDescription>
        </div>
        <div className="p-1 rounded bg-emerald-100 dark:bg-emerald-900/40">
          <ShieldAlert className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center text-xs text-muted-foreground mb-4 p-2 bg-secondary rounded-md">
          <Target className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>
            Safety goal: <strong>{target.goal}</strong> ({target.metric})
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="safety-incidents">Number of Incidents</Label>
            <Input
              id="safety-incidents"
              type="number"
              value={incidentsValue}
              onChange={(event) => onIncidentsChange(event.target.value)}
              placeholder="Enter recordable incidents"
              min={0}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="safety-hours">Total Hours Worked</Label>
            <Input
              id="safety-hours"
              type="number"
              value={hoursWorkedValue}
              onChange={(event) => onHoursWorkedChange(event.target.value)}
              placeholder="Enter total crew hours"
              min={0}
            />
          </div>
        </div>
        <div className="rounded-md bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-900 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-200">
          Total Recordable Incident Rate:
          <span className="ml-1 font-semibold">
            {computedTrir !== null ? computedTrir.toFixed(2) : "--"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          TRIR is computed as (Incidents × 200,000) ÷ Total Hours Worked. A lower value reflects stronger site safety.
        </p>
      </CardContent>
    </Card>
  );
}

interface WasteEmissionsCardProps {
  newEntry: WasteFormEntry;
  onEntryChange: (field: keyof WasteFormEntry, value: string) => void;
  onAddEntry: () => void;
  entries: WasteEntrySummary[];
  onRemoveEntry: (id: string) => void;
  totalAllocatedMassKg: number;
  totalInputMassKg: number;
  totalEmissionsKg: number;
}

function WasteEmissionsCard({
  newEntry,
  onEntryChange,
  onAddEntry,
  entries,
  onRemoveEntry,
  totalAllocatedMassKg,
  totalInputMassKg,
  totalEmissionsKg,
}: WasteEmissionsCardProps) {
  const percentageTotalsByWasteType = entries.reduce<Record<string, number>>((accumulator, entry) => {
    accumulator[entry.wasteType] = (accumulator[entry.wasteType] ?? 0) + entry.percentageValue;
    return accumulator;
  }, {});

  return (
    <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            Waste Management Summary
          </CardTitle>
          <CardDescription className="mt-1">
            Break down monthly waste streams and treatment methods to compute emissions.
          </CardDescription>
        </div>
        <div className="p-1 rounded bg-emerald-100 dark:bg-emerald-900/40">
          <Trash2 className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2 space-y-2">
            <Label htmlFor="waste-mass">Total Mass of Waste</Label>
            <div className="flex gap-2">
              <Input
                id="waste-mass"
                type="number"
                min="0"
                value={newEntry.mass}
                onChange={(event) => onEntryChange("mass", event.target.value)}
                placeholder="Enter quantity"
              />
              <Select
                value={newEntry.unit}
                onValueChange={(value) => onEntryChange("unit", value)}
              >
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="ton">ton</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Waste Type</Label>
            <Select
              value={newEntry.wasteType}
              onValueChange={(value) => onEntryChange("wasteType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {WASTE_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Treatment Method</Label>
            <Select
              value={newEntry.treatmentMethod}
              onValueChange={(value) => onEntryChange("treatmentMethod", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {WASTE_TREATMENT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="waste-percentage">Treatment Percentage (%)</Label>
            <Input
              id="waste-percentage"
              type="number"
              min="0"
              max="100"
              value={newEntry.treatmentPercentage}
              onChange={(event) => onEntryChange("treatmentPercentage", event.target.value)}
              placeholder="e.g. 25"
            />
          </div>
        </div>
        <Button type="button" onClick={onAddEntry} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Waste Entry
        </Button>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div className="rounded-md bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-900 px-3 py-2 text-emerald-700 dark:text-emerald-200">
            Total input mass:
            <span className="ml-1 font-semibold">{totalInputMassKg > 0 ? `${totalInputMassKg.toFixed(2)} kg` : "--"}</span>
          </div>
          <div className="rounded-md bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-900 px-3 py-2 text-emerald-700 dark:text-emerald-200">
            Allocated mass (kg):
            <span className="ml-1 font-semibold">{totalAllocatedMassKg > 0 ? `${totalAllocatedMassKg.toFixed(2)} kg` : "--"}</span>
          </div>
          <div className="rounded-md bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-900 px-3 py-2 text-emerald-700 dark:text-emerald-200">
            Total CO₂e emitted:
            <span className="ml-1 font-semibold">{totalEmissionsKg > 0 ? `${totalEmissionsKg.toFixed(2)} kg` : "--"}</span>
          </div>
        </div>
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waste Type</TableHead>
                <TableHead>Treatment</TableHead>
                <TableHead className="text-right">Mass</TableHead>
                <TableHead className="text-right">Treatment %</TableHead>
                <TableHead className="text-right">Allocated Mass (kg)</TableHead>
                <TableHead className="text-right">CO₂e (kg)</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.length > 0 ? (
                entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.wasteType}</TableCell>
                    <TableCell className="capitalize">{entry.treatmentMethod}</TableCell>
                    <TableCell className="text-right">
                      {Number(entry.mass).toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      })} {entry.unit}
                    </TableCell>
                    <TableCell className="text-right">{entry.percentageValue.toFixed(2)}%</TableCell>
                    <TableCell className="text-right">{entry.allocatedMassKg.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{entry.emissionKg.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveEntry(entry.id)}
                        aria-label="Remove waste entry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                    No waste entries recorded this month.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {entries.length > 0 ? (
          <div className="text-xs text-muted-foreground">
            <p className="mb-1">Ensure treatment allocations for each waste type total 100%:</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {Object.entries(percentageTotalsByWasteType).map(([wasteType, total]) => (
                <span
                  key={wasteType}
                  className={Math.abs(total - 100) > 0.001 ? "text-red-600 dark:text-red-400" : undefined}
                >
                  {wasteType}: <strong>{total.toFixed(2)}%</strong>
                </span>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Allocate each waste type across treatment methods. Percentages per type must add up to 100% before submission.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// --- Main Construction Phase Component ---
type ConstructionPhaseProps = {
  project: Project;
};

type DailyMetricKey =
  | "distanceKm"
  | "fuelEfficiency"
  | "equipmentHours"
  | "equipmentFuelRate"
  | "incidentCount"
  | "hoursWorked";
type MonthlyMetricKey = "electricity" | "water";

type DailyMetricState = Record<DailyMetricKey, string>;
type MonthlyMetricState = Record<MonthlyMetricKey, string>;

export default function ConstructionPhase({ project }: ConstructionPhaseProps) {
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetricState>({
    distanceKm: "",
    fuelEfficiency: "",
    equipmentHours: "",
    equipmentFuelRate: "",
    incidentCount: "",
    hoursWorked: "",
  });
  const [monthlyMetrics, setMonthlyMetrics] = useState<MonthlyMetricState>({
    electricity: "",
    water: "",
  });
  const [loggedMaterials, setLoggedMaterials] = useState<MaterialLogEntry[]>(
    []
  );
  const [newMaterialEntry, setNewMaterialEntry] = useState<
    Partial<MaterialLogEntry>
  >({});
  const [wasteEntries, setWasteEntries] = useState<WasteEntry[]>([]);
  const [newWasteEntry, setNewWasteEntry] = useState<WasteFormEntry>(createDefaultWasteFormEntry());
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [routeStartQuery, setRouteStartQuery] = useState("");
  const [routeEndQuery, setRouteEndQuery] = useState("");
  const [routeFuelLiters, setRouteFuelLiters] = useState("");
  const [routeDistanceKm, setRouteDistanceKm] = useState<number | null>(null);
  const [routeDurationMinutes, setRouteDurationMinutes] = useState<number | null>(null);
  const [startLabel, setStartLabel] = useState<string | null>(null);
  const [endLabel, setEndLabel] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<LatLngTuple>(DEFAULT_MAP_CENTER);
  const [startCoordinate, setStartCoordinate] = useState<LatLngTuple | null>(null);
  const [endCoordinate, setEndCoordinate] = useState<LatLngTuple | null>(null);
  const [truckPosition, setTruckPosition] = useState<LatLngTuple | null>(null);
  const [routePoints, setRoutePoints] = useState<LatLngTuple[]>([]);
  const [animationPoints, setAnimationPoints] = useState<LatLngTuple[]>([]);
  const [isAnimatingRoute, setIsAnimatingRoute] = useState(false);
  const [isFetchingRoute, setIsFetchingRoute] = useState(false);
  const [metricsPeriod, setMetricsPeriod] = useState<"daily" | "monthly">("daily");

  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const clearAnimationTimer = () => {
    if (animationTimerRef.current) {
      clearInterval(animationTimerRef.current);
      animationTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (startCoordinate) {
      setMapCenter(startCoordinate);
    }
  }, [startCoordinate]);

  useEffect(() => {
    if (!isAnimatingRoute || animationPoints.length === 0) {
      return;
    }

    clearAnimationTimer();
    let stepIndex = 0;
    setTruckPosition(animationPoints[0]);

    animationTimerRef.current = setInterval(() => {
      stepIndex += 1;
      const nextIndex = Math.min(stepIndex, animationPoints.length - 1);
      setTruckPosition(animationPoints[nextIndex]);

      if (nextIndex >= animationPoints.length - 1) {
        clearAnimationTimer();
        setIsAnimatingRoute(false);
      }
    }, 350);

    return () => {
      clearAnimationTimer();
    };
  }, [isAnimatingRoute, animationPoints]);

  useEffect(() => () => clearAnimationTimer(), []);

  const mapDisplayCenter = truckPosition ?? startCoordinate ?? endCoordinate ?? mapCenter;

  const resetMessages = () => {
    setStatusMessage(null);
    setErrorMessage(null);
  };

  const computedFuelLiters = useMemo(() => {
    if (dailyMetrics.distanceKm.trim() === "" || dailyMetrics.fuelEfficiency.trim() === "") {
      return null;
    }

    const distance = Number(dailyMetrics.distanceKm);
    const efficiency = Number(dailyMetrics.fuelEfficiency);

    if (!Number.isFinite(distance) || !Number.isFinite(efficiency)) {
      return null;
    }

    return distance * efficiency;
  }, [dailyMetrics.distanceKm, dailyMetrics.fuelEfficiency]);

  const computedEquipmentTotals = useMemo(() => {
    if (
      dailyMetrics.equipmentHours.trim() === "" ||
      dailyMetrics.equipmentFuelRate.trim() === ""
    ) {
      return { fuelLiters: null, co2Kg: null } as const;
    }

    const hours = Number(dailyMetrics.equipmentHours);
    const fuelRate = Number(dailyMetrics.equipmentFuelRate);

    if (!Number.isFinite(hours) || !Number.isFinite(fuelRate)) {
      return { fuelLiters: null, co2Kg: null } as const;
    }

    const fuelLiters = hours * fuelRate;
    const co2Kg = fuelLiters * EQUIPMENT_EMISSION_FACTOR_KG_PER_LITER;

    return { fuelLiters, co2Kg } as const;
  }, [dailyMetrics.equipmentFuelRate, dailyMetrics.equipmentHours]);

  const computedSafetyTrir = useMemo(() => {
    if (
      dailyMetrics.incidentCount.trim() === "" ||
      dailyMetrics.hoursWorked.trim() === ""
    ) {
      return null;
    }

    const incidents = Number(dailyMetrics.incidentCount);
    const hours = Number(dailyMetrics.hoursWorked);

    if (!Number.isFinite(incidents) || !Number.isFinite(hours) || hours <= 0) {
      return null;
    }

    return (incidents * TRIR_STANDARD_HOURS) / hours;
  }, [dailyMetrics.hoursWorked, dailyMetrics.incidentCount]);

  const computedMonthlyElectricityEmissions = useMemo(() => {
    if (monthlyMetrics.electricity.trim() === "") {
      return null;
    }

    const kwhValue = Number(monthlyMetrics.electricity);

    if (!Number.isFinite(kwhValue)) {
      return null;
    }

    return kwhValue * PH_GRID_EMISSION_FACTOR_KG_PER_KWH;
  }, [monthlyMetrics.electricity]);

  const computedMonthlyWaterEmissions = useMemo(() => {
    if (monthlyMetrics.water.trim() === "") {
      return null;
    }

    const waterValue = Number(monthlyMetrics.water);

    if (!Number.isFinite(waterValue)) {
      return null;
    }

    return waterValue * WATER_SUPPLY_EMISSION_FACTOR_KG_PER_CUBIC_M;
  }, [monthlyMetrics.water]);

  const wasteEntrySummaries = useMemo(
    () =>
      wasteEntries.map((entry) => {
        const parsedMass = Number(entry.mass);
        const massKg = Number.isFinite(parsedMass)
          ? convertWasteMassToKg(parsedMass, entry.unit)
          : 0;
        const percentageValue = Number(entry.treatmentPercentage);
        const normalizedPercentage = Number.isFinite(percentageValue)
          ? Math.max(0, percentageValue) / 100
          : 0;
        const emissionFactor = WASTE_EMISSION_FACTORS_KG_PER_KG[entry.treatmentMethod] ?? 0;
        const allocatedMassKg = massKg * normalizedPercentage;
        const emissionKg = allocatedMassKg * emissionFactor;

        return {
          ...entry,
          massKg,
          allocatedMassKg,
          emissionKg,
          percentageValue: Number.isFinite(percentageValue) ? percentageValue : 0,
        } satisfies WasteEntrySummary;
      }),
    [wasteEntries]
  );

  const totalWasteInputMassKg = useMemo(() => {
    const highestMassByType = new Map<string, number>();

    for (const entry of wasteEntrySummaries) {
      const previous = highestMassByType.get(entry.wasteType) ?? 0;
      if (entry.massKg > previous) {
        highestMassByType.set(entry.wasteType, entry.massKg);
      }
    }

    let sum = 0;
    highestMassByType.forEach((value) => {
      sum += value;
    });

    return sum;
  }, [wasteEntrySummaries]);

  const totalAllocatedWasteMassKg = useMemo(
    () => wasteEntrySummaries.reduce((total, entry) => total + entry.allocatedMassKg, 0),
    [wasteEntrySummaries]
  );

  const computedMonthlyWasteEmissions = useMemo(
    () => wasteEntrySummaries.reduce((total, entry) => total + entry.emissionKg, 0),
    [wasteEntrySummaries]
  );

  const handleAnimateRoute = async () => {
    resetMessages();

    if (!routeStartQuery.trim() || !routeEndQuery.trim()) {
      setErrorMessage("Enter both origin and destination before calculating the route.");
      return;
    }

    clearAnimationTimer();
    setIsAnimatingRoute(false);
    setTruckPosition(null);
    setRoutePoints([]);
    setAnimationPoints([]);
    setRouteDistanceKm(null);
    setRouteDurationMinutes(null);
    setStartCoordinate(null);
    setEndCoordinate(null);
    setStartLabel(null);
    setEndLabel(null);
    setMapCenter(DEFAULT_MAP_CENTER);

    setIsFetchingRoute(true);

    try {
      const response = await fetch("/api/logistics/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startQuery: routeStartQuery.trim(),
          endQuery: routeEndQuery.trim(),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        const message = payload?.message ?? "Unable to compute route for the provided locations.";
        throw new Error(message);
      }

      const payload = (await response.json()) as {
        start: { lat: number; lng: number; label: string };
        end: { lat: number; lng: number; label: string };
        distanceKm: number;
        durationMinutes: number;
        polyline: LatLngTuple[];
      };

      if (!payload.polyline || payload.polyline.length === 0) {
        throw new Error("The routing service did not return a valid path.");
      }

      const sampledPoints = sampleRoutePoints(payload.polyline);

      if (sampledPoints.length === 0) {
        throw new Error("The computed route did not contain enough points to animate.");
      }

      setStartCoordinate([payload.start.lat, payload.start.lng]);
      setEndCoordinate([payload.end.lat, payload.end.lng]);
      setStartLabel(payload.start.label);
      setEndLabel(payload.end.label);
      setRoutePoints(payload.polyline);
      setAnimationPoints(sampledPoints);
      setTruckPosition(sampledPoints[0] ?? null);
      setRouteDistanceKm(payload.distanceKm);
      setRouteDurationMinutes(payload.durationMinutes);
      setMapCenter([payload.start.lat, payload.start.lng]);
      setIsAnimatingRoute(true);

      if (!routeFuelLiters) {
        const suggestedFuel = payload.distanceKm * 0.35; // approximate diesel usage per km
        setRouteFuelLiters(suggestedFuel.toFixed(1));
      }
    } catch (error) {
      console.error("Failed to animate route", error);
      const message = error instanceof Error ? error.message : "Unable to animate route.";
      setErrorMessage(message);
    } finally {
      setIsFetchingRoute(false);
    }
  };

  const handleApplyRouteFuel = () => {
    resetMessages();
    if (routeDistanceKm === null || routeDistanceKm <= 0) {
      setErrorMessage("Calculate a valid route before applying fuel data.");
      return;
    }
    if (!routeFuelLiters) {
      setErrorMessage("Enter the truck's fuel consumption before applying it to the log.");
      return;
    }
    const parsedFuel = Number(routeFuelLiters);
    if (Number.isNaN(parsedFuel) || parsedFuel < 0) {
      setErrorMessage("Fuel consumption must be a valid non-negative number.");
      return;
    }

    setDailyMetrics((prev) => {
      const safeNumeric = (value: string) => {
        if (!value) {
          return 0;
        }
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
      };

      const existingDistance = safeNumeric(prev.distanceKm);
      const existingEfficiency = safeNumeric(prev.fuelEfficiency);
      const existingFuelLiters = existingDistance > 0 ? existingDistance * existingEfficiency : 0;

      const updatedDistance = existingDistance + routeDistanceKm;
      const updatedFuelLiters = existingFuelLiters + parsedFuel;
      const updatedEfficiency = updatedDistance > 0 ? updatedFuelLiters / updatedDistance : 0;

      return {
        ...prev,
        distanceKm: updatedDistance > 0 ? updatedDistance.toFixed(2) : "",
        fuelEfficiency:
          updatedDistance > 0 && updatedFuelLiters > 0
            ? updatedEfficiency.toFixed(3)
            : updatedDistance > 0
              ? "0"
              : "",
      };
    });
    setStatusMessage("Route fuel has been factored into today's distance and efficiency totals.");
  };

  const handleDailyInputChange = (metric: DailyMetricKey, value: string) => {
    setDailyMetrics((prev) => ({ ...prev, [metric]: value }));
  };

  const handleMonthlyInputChange = (metric: MonthlyMetricKey, value: string) => {
    setMonthlyMetrics((prev) => ({ ...prev, [metric]: value }));
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

  const handleWasteEntryChange = (field: keyof WasteFormEntry, value: string) => {
    setNewWasteEntry((prev) => {
      if (field === "unit") {
        return { ...prev, unit: value as WasteFormEntry["unit"] };
      }

      if (field === "treatmentMethod") {
        return { ...prev, treatmentMethod: value as WasteFormEntry["treatmentMethod"] };
      }

      return { ...prev, [field]: value };
    });
  };

  const addWasteEntry = () => {
    resetMessages();

    if (!newWasteEntry.mass.trim()) {
      setErrorMessage("Enter the total mass before adding a waste record.");
      return;
    }

    const parsedMass = Number(newWasteEntry.mass);

    if (!Number.isFinite(parsedMass) || parsedMass <= 0) {
      setErrorMessage("Waste mass must be a valid positive number.");
      return;
    }

    if (!newWasteEntry.wasteType) {
      setErrorMessage("Select a waste type before adding.");
      return;
    }

    if (!newWasteEntry.treatmentMethod) {
      setErrorMessage("Select a treatment method before adding.");
      return;
    }

    if (!newWasteEntry.treatmentPercentage.trim()) {
      setErrorMessage("Enter the treatment percentage before adding.");
      return;
    }

    const parsedPercentage = Number(newWasteEntry.treatmentPercentage);

    if (!Number.isFinite(parsedPercentage) || parsedPercentage <= 0) {
      setErrorMessage("Treatment percentage must be a valid positive number.");
      return;
    }

    if (parsedPercentage > 100) {
      setErrorMessage("Treatment percentage cannot exceed 100%.");
      return;
    }

    const existingPercentageTotal = wasteEntries
      .filter((entry) => entry.wasteType === newWasteEntry.wasteType)
      .reduce((total, entry) => total + Number(entry.treatmentPercentage || "0"), 0);

    if (existingPercentageTotal + parsedPercentage > 100.0001) {
      setErrorMessage("Treatment percentages for this waste type would exceed 100%. Adjust the allocation before adding another entry.");
      return;
    }

    const updatedAllocation = existingPercentageTotal + parsedPercentage;

    const entry: WasteEntry = {
      id: crypto.randomUUID(),
      mass: newWasteEntry.mass,
      unit: newWasteEntry.unit,
      wasteType: newWasteEntry.wasteType,
      treatmentMethod: newWasteEntry.treatmentMethod as WasteTreatmentMethod,
      treatmentPercentage: parsedPercentage.toString(),
    };

    setWasteEntries((prev) => [...prev, entry]);
    setNewWasteEntry(createDefaultWasteFormEntry());
    setStatusMessage(
      `Waste entry recorded. ${entry.wasteType} allocation now ${updatedAllocation.toFixed(2)}% of 100%.`
    );
  };

  const removeWasteEntry = (id: string) => {
    resetMessages();
    setWasteEntries((prev) => prev.filter((entry) => entry.id !== id));
    setStatusMessage("Waste entry removed. Re-check percentage totals before submitting.");
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

    const hasDailyMetrics = Object.values(dailyMetrics).some((value) => value.trim() !== "");
    const hasMonthlyMetrics = Object.values(monthlyMetrics).some((value) => value.trim() !== "");
    const hasMaterialEntries = loggedMaterials.length > 0;
    const hasWasteEntries = wasteEntries.length > 0;
    const shouldSubmitDaily =
      metricsPeriod === "daily" && (hasDailyMetrics || hasMaterialEntries);
    const shouldSubmitMonthly =
      metricsPeriod === "monthly" && (hasMonthlyMetrics || hasWasteEntries);

    if (!shouldSubmitDaily && !shouldSubmitMonthly) {
      const message =
        metricsPeriod === "monthly"
          ? "Enter at least one monthly metric or waste record before submitting."
          : "Enter at least one daily metric or material record before submitting.";
      setErrorMessage(message);
      return;
    }

    setIsSubmitting(true);

    try {
      const warnings: string[] = [];
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

      const distanceValue = parseNumber(dailyMetrics.distanceKm);
      const efficiencyValue = parseNumber(dailyMetrics.fuelEfficiency);
      const equipmentHoursValue = parseNumber(dailyMetrics.equipmentHours);
      const equipmentFuelRateValue = parseNumber(dailyMetrics.equipmentFuelRate);
      const incidentCountValue = parseNumber(dailyMetrics.incidentCount);
      const hoursWorkedValue = parseNumber(dailyMetrics.hoursWorked);

      if (
        (distanceValue !== null && efficiencyValue === null) ||
        (distanceValue === null && efficiencyValue !== null)
      ) {
        throw new Error("Provide both total distance and fuel efficiency to compute fuel usage.");
      }

      if (
        (equipmentHoursValue !== null && equipmentFuelRateValue === null) ||
        (equipmentHoursValue === null && equipmentFuelRateValue !== null)
      ) {
        throw new Error("Provide both equipment hours and fuel rate to compute equipment emissions.");
      }

      if (
        (incidentCountValue !== null && hoursWorkedValue === null) ||
        (incidentCountValue === null && hoursWorkedValue !== null)
      ) {
        throw new Error("Provide both number of incidents and total hours worked to compute TRIR.");
      }

      if (incidentCountValue !== null && incidentCountValue < 0) {
        throw new Error("Number of incidents cannot be negative.");
      }

      if (hoursWorkedValue !== null && hoursWorkedValue <= 0) {
        throw new Error("Total hours worked must be greater than zero.");
      }


      // Calculate fuel tCO2e (route fuel summary)
      const fuelConsumptionLiters =
        distanceValue !== null && efficiencyValue !== null
          ? Number((distanceValue * efficiencyValue).toFixed(4))
          : null;
      const fuelTco2e =
        fuelConsumptionLiters !== null
          ? Number((fuelConsumptionLiters * 2.68).toFixed(4))
          : null;

      // Equipment emissions
      const equipmentFuelConsumptionLiters =
        equipmentHoursValue !== null && equipmentFuelRateValue !== null
          ? equipmentHoursValue * equipmentFuelRateValue
          : null;
      const equipmentEmissionsKg =
        equipmentFuelConsumptionLiters !== null
          ? Number((equipmentFuelConsumptionLiters * EQUIPMENT_EMISSION_FACTOR_KG_PER_LITER).toFixed(4))
          : null;

      // Scope 1 = fuel tCO2e + equipment tCO2e
      const scope1 =
        (fuelTco2e !== null ? fuelTco2e : 0) + (equipmentEmissionsKg !== null ? equipmentEmissionsKg : 0);

      const safetyTrirRaw =
        incidentCountValue !== null && hoursWorkedValue !== null
          ? (incidentCountValue * TRIR_STANDARD_HOURS) / hoursWorkedValue
          : null;

      const safetyTrirRounded =
        safetyTrirRaw !== null && Number.isFinite(safetyTrirRaw)
          ? Math.round(safetyTrirRaw)
          : null;

      let dailyLogId: string | undefined;


      if (shouldSubmitDaily) {
        const { data: dailyLog, error: dailyError } = await supabase
          .from("construction_daily_log")
          .insert([
            {
              project_id: project.id,
              log_date: today,
              fuel_consumption_liters: fuelConsumptionLiters,
              equipment_usage_tco2e: equipmentEmissionsKg,
              safety_incidents: safetyTrirRounded,
              scope1: scope1,
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

        dailyLogId = dailyLog?.id as string | undefined;

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

        if (
          dailyLogId &&
          safetyTrirRounded !== null &&
          incidentCountValue !== null &&
          hoursWorkedValue !== null
        ) {
          const { error: safetyInsertError } = await supabase
            .from("safety_incidents")
            .insert([
              {
                project_id: project.id,
                daily_log_id: dailyLogId,
                log_date: today,
                incident_count: incidentCountValue,
                total_hours_worked: hoursWorkedValue,
                trir: safetyTrirRounded,
              },
            ]);

          if (safetyInsertError) {
            console.error("Failed to save safety details", safetyInsertError);
            const message =
              typeof safetyInsertError === "object" && safetyInsertError !== null && "message" in safetyInsertError
                ? String((safetyInsertError as { message?: string }).message ?? "")
                : "";
            const warningMessage = message
              ? `Safety details were not saved (${message}).`
              : "Safety details were not saved. Please try again later.";
            warnings.push(warningMessage);
          }
        }
      }

      let electricitySummary = "";
      let waterSummary = "";
      let wasteSummary = "";

      if (shouldSubmitMonthly) {

        const monthStart = new Date(today);
        monthStart.setDate(1);
        const logMonth = monthStart.toISOString().slice(0, 10);

        const rawElectricityKwh = parseNumber(monthlyMetrics.electricity);
        const electricityEmissionsKg =
          rawElectricityKwh !== null
            ? Number((rawElectricityKwh * PH_GRID_EMISSION_FACTOR_KG_PER_KWH).toFixed(4))
            : null;
        // Scope 2 = electricity emissions in tCO2e
        const scope2 = electricityEmissionsKg !== null ? Number((electricityEmissionsKg).toFixed(4)) : null;

        const rawWaterCubicM = parseNumber(monthlyMetrics.water);
        const waterEmissionsKg =
          rawWaterCubicM !== null
            ? Number((rawWaterCubicM * WATER_SUPPLY_EMISSION_FACTOR_KG_PER_CUBIC_M).toFixed(4))
            : null;

        if (hasWasteEntries) {
          const percentageTotals = new Map<string, number>();

          wasteEntries.forEach((entry) => {
            const value = Number(entry.treatmentPercentage);

            if (!Number.isFinite(value)) {
              throw new Error(`Treatment percentage for ${entry.wasteType} is invalid.`);
            }

            percentageTotals.set(
              entry.wasteType,
              (percentageTotals.get(entry.wasteType) ?? 0) + value
            );
          });

          const incompleteAllocations = Array.from(percentageTotals.entries()).filter(
            ([, total]) => Math.abs(total - 100) > 0.001
          );

          if (incompleteAllocations.length > 0) {
            const formatted = incompleteAllocations
              .map(([wasteType, total]) => `${wasteType} (${total.toFixed(2)}%)`)
              .join(", ");
            throw new Error(
              `Treatment method percentages must total 100% for: ${formatted}. Adjust the allocations before submitting.`
            );
          }
        }

        const wasteEmissionsKg =
          hasWasteEntries && wasteEntries.length > 0
            ? Number(computedMonthlyWasteEmissions.toFixed(4))
            : null;

        // Scope 3 = waste emissions + water emissions (both in kg CO2e)
        const scope3 =
          (wasteEmissionsKg !== null ? wasteEmissionsKg : 0) +
          (waterEmissionsKg !== null ? waterEmissionsKg : 0);

        if (electricityEmissionsKg !== null && rawElectricityKwh !== null) {
          electricitySummary = ` Electricity emissions: ${electricityEmissionsKg.toFixed(2)} kg CO₂e (from ${rawElectricityKwh.toFixed(2)} kWh).`;
        }

        if (waterEmissionsKg !== null && rawWaterCubicM !== null) {
          waterSummary = ` Water emissions: ${waterEmissionsKg.toFixed(2)} kg CO₂e (from ${rawWaterCubicM.toFixed(2)} m³).`;
        }

        if (wasteEmissionsKg !== null && wasteEntries.length > 0) {
          wasteSummary = ` Waste emissions: ${computedMonthlyWasteEmissions.toFixed(2)} kg CO₂e (allocated mass ${totalAllocatedWasteMassKg.toFixed(2)} kg; input mass ${totalWasteInputMassKg.toFixed(2)} kg).`;
        }

        // Add placeholder columns for raw values
        const { error: monthlyError } = await supabase
          .from("construction_monthly_log")
          .upsert(
            [
              {
                project_id: project.id,
                log_month: logMonth,
                electricity_usage_kwh: electricityEmissionsKg,
                water_consumption_cubic_m: waterEmissionsKg,
                waste_generated_kg: wasteEmissionsKg,
                elec_placeholder: rawElectricityKwh,
                water_placeholder: rawWaterCubicM,
                waste_placeholder: hasWasteEntries && wasteEntries.length > 0 ? wasteEntries.reduce((sum, entry) => sum + Number(entry.mass) * (entry.unit === "ton" ? 1000 : 1), 0) : null,
                scope2: scope2,
                scope3: scope3,
                submitted_on: today,
                updated_at: new Date().toISOString(),
              },
            ],
            { onConflict: "project_id,log_month" }
          );

        if (monthlyError) {
          throw monthlyError;
        }
      }

      if (hasMaterialEntries) {
        if (!dailyLogId) {
          throw new Error("Material entries require a daily log reference.");
        }

        const bucket = supabase.storage.from("construction-docs");

        const materialPayload = await Promise.all(
          loggedMaterials.map(async (entry) => {
            let receiptPath: string | null = null;

            if (entry.receiptFile) {
              const extension = entry.receiptFile.name.split(".").pop() || "pdf";
              const storagePath = `project/${project.id}/daily/${dailyLogId}/receipts/${crypto.randomUUID()}.${extension}`;
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

      const fuelSummary =
        fuelConsumptionLiters !== null
          ? ` Calculated fuel usage: ${fuelConsumptionLiters.toFixed(2)} L.`
          : "";

      const equipmentSummary =
        equipmentEmissionsKg !== null
          ? ` Equipment emissions: ${equipmentEmissionsKg.toFixed(2)} kg CO₂e.`
          : "";

      const safetySummary =
        safetyTrirRaw !== null
          ? ` Safety TRIR recorded: ${safetyTrirRaw.toFixed(2)} (stored as ${safetyTrirRounded} • Incidents: ${incidentCountValue ?? 0}, Hours: ${hoursWorkedValue ?? 0}).`
          : "";

      const combinedSummary = `${fuelSummary}${equipmentSummary}${safetySummary}${electricitySummary}${waterSummary}${wasteSummary}`;
      const warningSummary = warnings.length > 0 ? ` ${warnings.join(" ")}` : "";

      if (shouldSubmitDaily) {
        if (shouldSubmitMonthly) {
          setStatusMessage(`Daily report and monthly metrics saved successfully.${combinedSummary}${warningSummary}`.trim());
        } else {
          setStatusMessage(`Daily report saved successfully.${combinedSummary}${warningSummary}`.trim());
        }
      } else if (shouldSubmitMonthly) {
        setStatusMessage(`Monthly metrics saved successfully.${warningSummary}`.trim());
      } else {
        setStatusMessage(`Submission completed.${warningSummary}`.trim());
      }

      if (shouldSubmitDaily) {
        setDailyMetrics({
          distanceKm: "",
          fuelEfficiency: "",
          equipmentHours: "",
          equipmentFuelRate: "",
          incidentCount: "",
          hoursWorked: "",
        });
        setLoggedMaterials([]);
      }

      if (shouldSubmitMonthly) {
        setMonthlyMetrics({
          electricity: "",
          water: "",
        });
        setWasteEntries([]);
        setNewWasteEntry(createDefaultWasteFormEntry());
      }
    } catch (error) {
      console.error("Failed to submit daily report", error);
      const message =
        error instanceof Error
          ? error.message
          : typeof error === "object" && error !== null && "message" in error && typeof (error as { message?: unknown }).message === "string"
            ? (error as { message: string }).message
            : "Unable to submit report.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const monthlyMetricConfigs = [
    {
      id: "electricity",
      icon: <Zap className="h-4 w-4 text-muted-foreground" />,
      title: "Electricity Usage",
      unit: "kWh",
      relatedTarget: preConstructionData.targets.emissions,
    },
    {
      id: "water",
      icon: <Droplets className="h-4 w-4 text-muted-foreground" />,
      title: "Water Consumption",
      unit: "m³",
      relatedTarget: preConstructionData.targets.water,
    },
  ] as const;

  const monitoringTitle =
    metricsPeriod === "daily"
      ? "Construction Phase: Daily ESG Monitoring"
      : "Construction Phase: Monthly ESG Monitoring";

  const monitoringDescription =
    metricsPeriod === "daily"
      ? "Log daily metrics and material deliveries to track performance against pre-construction targets."
      : "Review monthly resource usage and material deliveries to stay aligned with pre-construction targets.";

  const routeMetricsGridClass =
    metricsPeriod === "monthly"
      ? "grid grid-cols-1 md:grid-cols-2 gap-4"
      : "grid grid-cols-1 gap-4";

  const submitButtonLabel =
    metricsPeriod === "monthly"
      ? "Submit Full Monthly Report"
      : "Submit Full Daily Report";

  const submitButtonBusyLabel =
    metricsPeriod === "monthly" ? "Submitting Monthly..." : "Submitting Daily...";

  return (
    <div className="space-y-6">
      <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
        <CardHeader>
          <CardTitle className="text-emerald-700 dark:text-emerald-300">
            {monitoringTitle}
          </CardTitle>
          <CardDescription>{monitoringDescription}</CardDescription>
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

      <Tabs
        value={metricsPeriod}
        onValueChange={(value) => setMetricsPeriod(value as "daily" | "monthly")}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="daily">Daily Inputs</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Inputs</TabsTrigger>
        </TabsList>
        <TabsContent value="daily">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DistanceFuelCard
              distanceValue={dailyMetrics.distanceKm}
              efficiencyValue={dailyMetrics.fuelEfficiency}
              onDistanceChange={(value) => handleDailyInputChange("distanceKm", value)}
              onEfficiencyChange={(value) => handleDailyInputChange("fuelEfficiency", value)}
              computedFuelLiters={computedFuelLiters}
            />
            <EquipmentEmissionsCard
              hoursValue={dailyMetrics.equipmentHours}
              fuelRateValue={dailyMetrics.equipmentFuelRate}
              onHoursChange={(value) => handleDailyInputChange("equipmentHours", value)}
              onFuelRateChange={(value) => handleDailyInputChange("equipmentFuelRate", value)}
              computedFuelLiters={computedEquipmentTotals.fuelLiters}
              computedCo2Kg={computedEquipmentTotals.co2Kg}
            />
            <SafetyTrirCard
              incidentsValue={dailyMetrics.incidentCount}
              hoursWorkedValue={dailyMetrics.hoursWorked}
              onIncidentsChange={(value) => handleDailyInputChange("incidentCount", value)}
              onHoursWorkedChange={(value) => handleDailyInputChange("hoursWorked", value)}
              computedTrir={computedSafetyTrir}
              target={preConstructionData.targets.safety}
            />
          </div>
        </TabsContent>
        <TabsContent value="monthly">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {monthlyMetricConfigs.map((metric) => {
                const isElectricity = metric.id === "electricity";
                const isWater = metric.id === "water";
                let secondaryValue: string | null | undefined;

                if (isElectricity) {
                  secondaryValue =
                    computedMonthlyElectricityEmissions !== null
                      ? computedMonthlyElectricityEmissions.toFixed(2)
                      : null;
                } else if (isWater) {
                  secondaryValue =
                    computedMonthlyWaterEmissions !== null
                      ? computedMonthlyWaterEmissions.toFixed(2)
                      : null;
                }

                return (
                  <MetricCard
                    key={metric.id}
                    {...metric}
                    value={monthlyMetrics[metric.id as MonthlyMetricKey]}
                    onChange={(value) => handleMonthlyInputChange(metric.id as MonthlyMetricKey, value)}
                    labelPrefix="This Month's"
                    secondaryLabel={isElectricity || isWater ? "Total CO₂e (kg):" : undefined}
                    secondaryValue={secondaryValue}
                  />
                );
              })}
            </div>
            <WasteEmissionsCard
              newEntry={newWasteEntry}
              onEntryChange={handleWasteEntryChange}
              onAddEntry={addWasteEntry}
              entries={wasteEntrySummaries}
              onRemoveEntry={removeWasteEntry}
              totalAllocatedMassKg={totalAllocatedWasteMassKg}
              totalInputMassKg={totalWasteInputMassKg}
              totalEmissionsKg={computedMonthlyWasteEmissions}
            />
          </div>
        </TabsContent>
      </Tabs>

      <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            Delivery Route
          </CardTitle>
          <CardDescription>
            Visualize a material delivery, capture distance travelled, and feed the truck&apos;s fuel usage into today&apos;s log.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="route-start">From</Label>
              <Input
                id="route-start"
                value={routeStartQuery}
                onChange={(event) => setRouteStartQuery(event.target.value)}
                placeholder="e.g. 123 Port Rd, Manila or 14.5995, 120.9842"
                autoComplete="street-address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="route-end">To</Label>
              <Input
                id="route-end"
                value={routeEndQuery}
                onChange={(event) => setRouteEndQuery(event.target.value)}
                placeholder="e.g. 456 Logistics Hub, Taguig or 14.6760, 121.0437"
                autoComplete="street-address"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {startLabel && endLabel
              ? `Resolved route: ${startLabel} -> ${endLabel}`
              : "Type full street addresses or decimal coordinates (lat,lng) for both locations."}
          </p>

          <div className={routeMetricsGridClass}>
            {metricsPeriod === "monthly" ? (
              <div className="space-y-2">
                <Label htmlFor="route-fuel">Fuel Consumption (liters)</Label>
                <Input
                  id="route-fuel"
                  value={routeFuelLiters}
                  placeholder="Enter or accept suggestion"
                  inputMode="decimal"
                  disabled
                />
                <p className="text-xs text-muted-foreground">
                  A suggested value is provided after calculating the route using an average 0.35 L/km factor.
                </p>
              </div>
            ) : null}
            <div className="flex flex-col justify-between gap-2">
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Distance Travelled</p>
                  <p className="text-2xl font-semibold text-emerald-600">
                    {routeDistanceKm !== null ? `${routeDistanceKm.toFixed(2)} km` : "--"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Drive Time</p>
                  <p className="text-lg font-medium text-muted-foreground">
                    {formatDuration(routeDurationMinutes)}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={handleAnimateRoute} disabled={isFetchingRoute}>
                  {isFetchingRoute ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Finding Route...
                    </>
                  ) : (
                    <>
                      <Truck className="mr-2 h-4 w-4" />
                      {isAnimatingRoute ? "Animating..." : "Plan & Animate"}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleApplyRouteFuel}
                  disabled={!routeFuelLiters}
                >
                  <Fuel className="mr-2 h-4 w-4" />
                  Apply Fuel to Daily Log
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden border border-white/30 dark:border-gray-700/30">
            {typeof window !== "undefined" ? (
              <DeliveryRouteMap
                center={mapDisplayCenter}
                start={startCoordinate}
                end={endCoordinate}
                startLabel={startLabel}
                endLabel={endLabel}
                truckPosition={truckPosition}
                polyline={routePoints}
              />
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">
            Enter street addresses or decimal coordinates to snap the truck along real driving roads. Use the animation to capture
            the delivery distance and associated fuel usage for today&apos;s report.
          </p>
        </CardContent>
      </Card>

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
            {isSubmitting ? submitButtonBusyLabel : submitButtonLabel}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
