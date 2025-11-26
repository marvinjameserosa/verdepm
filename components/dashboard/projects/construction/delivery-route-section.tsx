"use client";

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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Fuel, Loader2, Truck, MapPin, Save } from "lucide-react";
import type { DeliveryRouteMapProps } from "@/components/dashboard/projects/delivery-route-map";
import { SourcedMaterial } from "@/types/construction";
import { useScopeOneCalculator } from "@/hooks/useScopeOneCalculator";
import { updateMaterialDelivery } from "@/actions/material-actions";
import { useState } from "react";

const DeliveryRouteMap = dynamic<DeliveryRouteMapProps>(
  () =>
    import("@/components/dashboard/projects/delivery-route-map").then(
      (module) => {
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
              return (
                <div className="text-red-600 text-xs">
                  Map failed to load. Please refresh or check route data.
                </div>
              );
            }
            throw e;
          }
        }
        return SafeDeliveryRouteMap;
      }
    ),
  { ssr: false }
);

type LatLngTuple = [number, number];

interface DeliveryRouteSectionProps {
  routeStartQuery: string;
  setRouteStartQuery: (value: string) => void;
  routeEndQuery: string;
  setRouteEndQuery: (value: string) => void;
  routeFuelLiters: string;
  setRouteFuelLiters: (value: string) => void;
  routeDistanceKm: number | null;
  routeDurationMinutes: number | null;
  startLabel: string | null;
  endLabel: string | null;
  mapDisplayCenter: LatLngTuple;
  startCoordinate: LatLngTuple | null;
  endCoordinate: LatLngTuple | null;
  truckPosition: LatLngTuple | null;
  routePoints: LatLngTuple[];
  isFetchingRoute: boolean;
  isAnimatingRoute: boolean;
  handleAnimateRoute: () => void;
  handleApplyRouteFuel: () => void;
  metricsPeriod: "daily" | "monthly";
  sourcingMaterials: SourcedMaterial[];
  projectLocation?: string | null;
  distanceValue: string;
  efficiencyValue: string;
  onDistanceChange: (value: string) => void;
  onEfficiencyChange: (value: string) => void;
  computedFuelLiters: number | null;
  selectedMaterialId?: string;
  onMaterialSelect: (material: SourcedMaterial) => void;
  isSavingFuel?: boolean;
  emissionFactorValue: string;
  onEmissionFactorChange: (value: string) => void;
  onMaterialUpdate?: () => void;
  onError?: (message: string) => void;
  onSuccess?: (message: string) => void;
}

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

export function DeliveryRouteSection({
  routeStartQuery,
  setRouteStartQuery,
  routeEndQuery,
  setRouteEndQuery,
  routeFuelLiters,
  setRouteFuelLiters,
  routeDistanceKm,
  routeDurationMinutes,
  startLabel,
  endLabel,
  mapDisplayCenter,
  startCoordinate,
  endCoordinate,
  truckPosition,
  routePoints,
  isFetchingRoute,
  isAnimatingRoute,
  handleAnimateRoute,
  handleApplyRouteFuel,
  metricsPeriod,
  sourcingMaterials,
  projectLocation,
  distanceValue,
  efficiencyValue,
  onDistanceChange,
  onEfficiencyChange,
  computedFuelLiters,
  selectedMaterialId,
  onMaterialSelect,
  isSavingFuel,
  emissionFactorValue,
  onEmissionFactorChange,
  onMaterialUpdate,
  onError,
  onSuccess,
}: DeliveryRouteSectionProps) {
  const [deliveryDate, setDeliveryDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [deliveryStatus, setDeliveryStatus] = useState<string>("Pending");
  const [isUpdatingMaterial, setIsUpdatingMaterial] = useState(false);
  const [showUpdateSuccess, setShowUpdateSuccess] = useState(false);

  const { logisticsCo2 } = useScopeOneCalculator({
    distance: parseFloat(distanceValue) || 0,
    efficiency: parseFloat(efficiencyValue) || 0,
    logisticsFactor: parseFloat(emissionFactorValue) || 0,
  });

  const handleUpdateMaterial = async () => {
    if (!selectedMaterialId) return;
    setIsUpdatingMaterial(true);
    try {
      const result = await updateMaterialDelivery(selectedMaterialId, {
        delivery_distance: parseFloat(distanceValue) || 0,
        vehicle_fuel_efficiency: parseFloat(efficiencyValue) || 0,
        combustion_emission_factor: parseFloat(emissionFactorValue) || 0,
        delivery_date: new Date(deliveryDate),
        delivery_status: deliveryStatus,
      });
      
      if (result.success) {
        if (onMaterialUpdate) onMaterialUpdate();
        if (onSuccess) onSuccess("Material delivery details updated successfully.");
        setShowUpdateSuccess(true);
      } else {
        if (onError) onError(result.error || "Failed to update material.");
      }
    } catch (e) {
      console.error(e);
      if (onError) onError("An unexpected error occurred.");
    } finally {
      setIsUpdatingMaterial(false);
    }
  };

  const handleStatusChange = (value: string) => {
    setDeliveryStatus(value);
    if (value === "Delivered" || value === "Completed") {
      setDeliveryDate(new Date().toISOString().split("T")[0]);
    }
  };

  const handleSelectChange = (materialId: string) => {
    const material = sourcingMaterials.find((m) => m.id === materialId);
    if (material) {
      onMaterialSelect(material);
      if (material.deliveryStatus) {
        setDeliveryStatus(material.deliveryStatus);
      }
      if (material.deliveryDate) {
        setDeliveryDate(new Date(material.deliveryDate).toISOString().split("T")[0]);
      }
    }
  };

  return (
    <>
      <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <Truck className="h-4 w-4" />
          Logistics & Route Fuel Planning
        </CardTitle>
        <CardDescription>
          Plan material deliveries, visualize routes, and calculate fuel
          consumption for your daily log.
        </CardDescription>
      </CardHeader>
        <CardContent className="space-y-6">
        {/* Material Selection Section */}
        <div className="space-y-2">
          <Label>Quick Fill from Sourcing Plan</Label>
          <Select
            value={selectedMaterialId || ""}
            onValueChange={handleSelectChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a material to load warehouse address..." />
            </SelectTrigger>
            <SelectContent>
              {sourcingMaterials.length > 0 ? (
                sourcingMaterials.map((material) => (
                  <SelectItem key={material.id} value={material.id}>
                    {material.name} ({material.warehouse || "No Warehouse"})
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>
                  No sourcing materials found
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Route Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="route-start">Origin (Warehouse)</Label>
            <div className="relative">
              <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="route-start"
                value={routeStartQuery}
                onChange={(event) => setRouteStartQuery(event.target.value)}
                placeholder="e.g. 123 Port Rd, Manila"
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="route-end">Destination (Site)</Label>
            <div className="relative">
              <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="route-end"
                value={routeEndQuery}
                onChange={(event) => setRouteEndQuery(event.target.value)}
                placeholder="e.g. Project Site Address"
                className="pl-9"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={handleAnimateRoute}
            disabled={isFetchingRoute}
            className="w-full md:w-auto"
          >
            {isFetchingRoute ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Calculating Route...
              </>
            ) : (
              <>
                <Truck className="mr-2 h-4 w-4" />
                {isAnimatingRoute ? "Re-Animate Route" : "Calculate Route"}
              </>
            )}
          </Button>
        </div>

        {/* Map Display */}
        <div className="rounded-xl overflow-hidden border border-white/30 dark:border-gray-700/30 h-[300px] w-full relative">
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
          ) : (
            <div className="flex items-center justify-center h-full bg-muted/20">
              <p className="text-sm text-muted-foreground">Map Loading...</p>
            </div>
          )}
        </div>

        {/* Route Stats & Fuel Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
          {/* Route Stats */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Route Distance
            </p>
            <p className="text-2xl font-bold text-emerald-600">
              {routeDistanceKm !== null
                ? `${routeDistanceKm.toFixed(2)} km`
                : "--"}
            </p>
            <p className="text-xs text-muted-foreground">
              Est. Time: {formatDuration(routeDurationMinutes)}
            </p>
          </div>

          {/* Fuel Efficiency Input */}
          {/* Fuel Efficiency Input */}
          <div className="space-y-2">
            <Label htmlFor="fuel-efficiency">Fuel Efficiency (L/km)</Label>
            <Input
              id="fuel-efficiency"
              type="number"
              placeholder="0.35"
              value={efficiencyValue}
              onChange={(e) => onEfficiencyChange(e.target.value)}
            />
          </div>

          {/* Emission Factor Input */}
          <div className="space-y-2">
            <Label htmlFor="emission-factor">Emission Factor (kg CO₂e/L)</Label>
            <Input
              id="emission-factor"
              type="number"
              placeholder="2.68"
              value={emissionFactorValue}
              onChange={(e) => onEmissionFactorChange(e.target.value)}
            />
          </div>

          {/* Delivery Status Input */}
          <div className="space-y-2">
            <Label htmlFor="delivery-status">Delivery Status</Label>
            <Select
              value={deliveryStatus}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger id="delivery-status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Transit">In Transit</SelectItem>
                <SelectItem value="Delivered">Delivered</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Delivery Date Input */}
          <div className="space-y-2">
            <Label htmlFor="delivery-date">Delivery Date</Label>
            <Input
              id="delivery-date"
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
            />
          </div>

          {/* Logistics Emissions Display */}
          <div className="space-y-2">
             <Label>Projected Logistics Emissions</Label>
             <div className="p-2 bg-muted rounded-md font-mono text-sm">
                {logisticsCo2.toFixed(2)} kg CO₂e
             </div>
          </div>

          {/* Update Material Button */}
          <div className="space-y-2 flex items-end">
            <Button 
                type="button" 
                onClick={handleUpdateMaterial} 
                disabled={!selectedMaterialId || isUpdatingMaterial}
                className="w-full"
            >
                {isUpdatingMaterial ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Update Material
            </Button>
          </div>

          {/* Calculated Fuel */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Total Fuel (Liters)</Label>
              <Badge
                variant="outline"
                className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/50 dark:bg-emerald-500/10 dark:text-emerald-200"
              >
                Scope 1
              </Badge>
            </div>
            <div className="flex gap-2">
              <Input
                value={
                  computedFuelLiters !== null
                    ? computedFuelLiters.toFixed(2)
                    : routeFuelLiters || ""
                }
                onChange={(e) => setRouteFuelLiters(e.target.value)}
                placeholder="Calculated..."
                readOnly={computedFuelLiters !== null}
                className={computedFuelLiters !== null ? "bg-muted" : ""}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleApplyRouteFuel}
                disabled={
                  (!routeFuelLiters && computedFuelLiters === null) ||
                  isSavingFuel
                }
                title="Save Fuel to Log"
                className="gap-2"
              >
                {isSavingFuel ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Fuel
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Auto-calculated if distance & efficiency are set.
            </p>
          </div>
        </div>
        </CardContent>
      </Card>

      <Dialog open={showUpdateSuccess} onOpenChange={setShowUpdateSuccess}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-md backdrop-blur-xl bg-white/90 dark:bg-gray-900/80 border border-white/40 shadow-2xl"
        >
          <DialogHeader className="space-y-3 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
              <Save className="h-6 w-6" />
            </div>
            <DialogTitle>Material Updated</DialogTitle>
            <DialogDescription className="text-sm">
              Material delivery details were saved successfully.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-2 flex justify-center">
            <Button onClick={() => setShowUpdateSuccess(false)} className="px-6">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
