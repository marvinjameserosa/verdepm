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
import { Fuel, Loader2, Truck } from "lucide-react";
import type { DeliveryRouteMapProps } from "@/components/dashboard/projects/delivery-route-map";

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
}: DeliveryRouteSectionProps) {
  const routeMetricsGridClass =
    metricsPeriod === "monthly"
      ? "grid grid-cols-1 md:grid-cols-2 gap-4"
      : "grid grid-cols-1 gap-4";

  return (
    <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
          Delivery Route
        </CardTitle>
        <CardDescription>
          Visualize a material delivery, capture distance travelled, and feed the
          truck&apos;s fuel usage into today&apos;s log.
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
                A suggested value is provided after calculating the route using an
                average 0.35 L/km factor.
              </p>
            </div>
          ) : null}
          <div className="flex flex-col justify-between gap-2">
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">
                  Distance Travelled
                </p>
                <p className="text-2xl font-semibold text-emerald-600">
                  {routeDistanceKm !== null
                    ? `${routeDistanceKm.toFixed(2)} km`
                    : "--"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Estimated Drive Time
                </p>
                <p className="text-lg font-medium text-muted-foreground">
                  {formatDuration(routeDurationMinutes)}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={handleAnimateRoute}
                disabled={isFetchingRoute}
              >
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
          Enter street addresses or decimal coordinates to snap the truck along
          real driving roads. Use the animation to capture the delivery distance
          and associated fuel usage for today&apos;s report.
        </p>
      </CardContent>
    </Card>
  );
}
