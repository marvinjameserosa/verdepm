import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Fuel, Truck } from "lucide-react";

interface DistanceFuelCardProps {
  distanceValue: string;
  efficiencyValue: string;
  onDistanceChange: (value: string) => void;
  onEfficiencyChange: (value: string) => void;
  computedFuelLiters: number | null;
}

export function DistanceFuelCard({
  distanceValue,
  efficiencyValue,
  onDistanceChange,
  onEfficiencyChange,
  computedFuelLiters,
}: DistanceFuelCardProps) {
  // Calculate tCO2e for today's fuel
  const todayTco2e =
    computedFuelLiters !== null ? computedFuelLiters * 2.68 : null;
  return (
    <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            Route Fuel Summary (For Deliveries)
          </CardTitle>
          <CardDescription className="mt-1">
            Capture today&apos;s travel distance and efficiency to
            auto-calculate fuel usage.
          </CardDescription>
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
            <Label htmlFor="daily-total-distance">
              Today&apos;s Total Distance (km)
            </Label>
            <Input
              id="daily-total-distance"
              type="number"
              value={distanceValue}
              onChange={(event) => onDistanceChange(event.target.value)}
              placeholder="Enter distance travelled"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="daily-fuel-efficiency">
              Fuel Efficiency (L/km)
            </Label>
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
            {computedFuelLiters !== null
              ? `${computedFuelLiters.toFixed(2)} L`
              : "--"}
          </span>
        </div>
        <div className="rounded-md bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-900 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-200">
          Total tCO₂e for today:
          <span className="ml-1 font-semibold">
            {todayTco2e !== null ? `${todayTco2e.toFixed(2)} tCO₂e` : "--"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
