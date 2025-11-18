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

const DeliveryRouteMap = dynamic<DeliveryRouteMapProps>(
  () =>
    import("@/components/dashboard/projects/delivery-route-map").then(
      (module) => module.default
    ),
  { ssr: false }
);

const DEFAULT_MAP_CENTER: LatLngTuple = [14.5995, 120.9842];
const DEFAULT_ANIMATION_SAMPLE_SIZE = 160;

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
interface FuelMetricValue {
  totalDistance: string;
  fuelEfficiency: string;
}

type MetricCardValue = string | FuelMetricValue;

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  unit: string;
  relatedTarget: { goal: string; metric: string };
  value: MetricCardValue;
  onChange: (value: MetricCardValue) => void;
  labelPrefix?: string;
}

function MetricCard({
  icon,
  title,
  unit,
  relatedTarget,
  value,
  onChange,
  labelPrefix = "Today's",
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
        {title === "Fuel Consumption" && typeof value === "object" && value !== null ? (
          <div className="space-y-2">
            <Label htmlFor="total-distance">Total Distance (km)</Label>
            <Input
              id="total-distance"
              type="number"
              value={value.totalDistance}
              onChange={(event) => onChange({
                ...value,
                totalDistance: event.target.value
              })}
              placeholder="Enter total distance in km"
            />
            <Label htmlFor="fuel-efficiency">Fuel Efficiency (km/L)</Label>
            <Input
              id="fuel-efficiency"
              type="number"
              value={value.fuelEfficiency}
              onChange={(event) => onChange({
                ...value,
                fuelEfficiency: event.target.value
              })}
              placeholder="Enter fuel efficiency in km/L"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor={title}>{`${labelPrefix} ${title} (${unit})`}</Label>
            <Input
              id={title}
              type="number"
              value={typeof value === "string" ? value : ""}
              onChange={(event) => onChange(event.target.value)}
              placeholder={`Enter value in ${unit}`}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// --- Main Construction Phase Component ---
type ConstructionPhaseProps = {
  project: Project;
};

export default function ConstructionPhase({ project }: ConstructionPhaseProps) {
  const [dailyMetrics, setDailyMetrics] = useState<{
    fuel: FuelMetricValue;
    electricity: string;
    water: string;
    equipment: string;
    waste: string;
    safety: string;
  }>({
    fuel: { totalDistance: "", fuelEfficiency: "" },
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

  // Remove effect for normalizedFuel, as fuel is now an object

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

  // Remove handleApplyRouteFuel, as fuel is now an object and not a number

  const handleInputChange = (metric: string, value: MetricCardValue) => {
    setDailyMetrics((prev) => ({ ...prev, [metric]: value }));
  }

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

    const hasFuel = dailyMetrics.fuel.totalDistance && dailyMetrics.fuel.fuelEfficiency;
    if (
      !hasFuel &&
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


      // Save to dim_fuel_consumption if fuel values are present
      if (hasFuel) {
        const totalDistance = Number(dailyMetrics.fuel.totalDistance);
        const fuelEfficiency = Number(dailyMetrics.fuel.fuelEfficiency);
        if (!isNaN(totalDistance) && !isNaN(fuelEfficiency) && fuelEfficiency > 0) {
          await supabase.from("dim_fuel_consumption").insert([
            {
              total_distance: totalDistance,
              fuel_efficiency: fuelEfficiency,
              // created_at will be set by default
            },
          ]);
        }
      }

      const bucket = supabase.storage.from("construction-docs");

      if (loggedMaterials.length > 0) {
        const materialPayload = await Promise.all(
          loggedMaterials.map(async (entry) => {
            let receiptPath: string | null = null;

            if (entry.receiptFile) {
              const extension = entry.receiptFile.name.split(".").pop() || "pdf";
              const storagePath = `project/${project.id}/receipts/${crypto.randomUUID()}.${extension}`;
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
        fuel: { totalDistance: "", fuelEfficiency: "" },
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

  const metricGroups = {
    daily: [
      {
        id: "fuel",
        icon: <Fuel className="h-4 w-4 text-muted-foreground" />,
        title: "Fuel Consumption",
        unit: "liters",
        relatedTarget: preConstructionData.targets.emissions,
      },
      {
        id: "equipment",
        icon: <Construction className="h-4 w-4 text-muted-foreground" />,
        title: "Equipment Usage",
        unit: "hours",
        relatedTarget: preConstructionData.targets.emissions,
      },
      {
        id: "safety",
        icon: <ShieldAlert className="h-4 w-4 text-muted-foreground" />,
        title: "Safety Incidents",
        unit: "incidents",
        relatedTarget: preConstructionData.targets.safety,
      },
    ],
    monthly: [
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
      {
        id: "waste",
        icon: <Trash2 className="h-4 w-4 text-muted-foreground" />,
        title: "Waste Generated",
        unit: "kg",
        relatedTarget: preConstructionData.targets.waste,
      },
    ],
  } as const;

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
            {metricGroups.daily.map((metric) => (
              <MetricCard
                key={metric.id}
                {...metric}
                value={dailyMetrics[metric.id]}
                onChange={(value) => handleInputChange(metric.id, value)}
                labelPrefix="Today's"
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="monthly">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metricGroups.monthly.map((metric) => (
              <MetricCard
                key={metric.id}
                {...metric}
                value={dailyMetrics[metric.id]}
                onChange={(value) => handleInputChange(metric.id, value)}
                labelPrefix="This Month's"
              />
            ))}
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
                {/* Removed Apply Fuel to Daily Log button for new fuel input system */}
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
            {isSubmitting ? "Submitting..." : "Submit Full Daily Report"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
