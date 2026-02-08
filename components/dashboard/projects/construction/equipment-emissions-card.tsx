import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Construction } from "lucide-react";
import { EQUIPMENT_EMISSION_FACTOR_KG_PER_LITER } from "@/types/construction";

interface EquipmentEmissionsCardProps {
  hoursValue: string;
  fuelRateValue: string;
  onHoursChange: (value: string) => void;
  onFuelRateChange: (value: string) => void;
  computedFuelLiters: number | null;
  computedCo2Kg: number | null;
}

export function EquipmentEmissionsCard({
  hoursValue,
  fuelRateValue,
  onHoursChange,
  onFuelRateChange,
  computedFuelLiters,
  computedCo2Kg,
}: EquipmentEmissionsCardProps) {
  return (
    <Card className="glassmorphism card-hover border-l-4 border-l-chart-1">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg font-bold text-chart-1">
            Equipment Emissions Summary
          </CardTitle>
          <CardDescription className="mt-1">
            Log today&apos;s operating hours and average fuel rate to estimate
            combustion emissions.
          </CardDescription>
        </div>
        <div className="p-2 rounded-lg bg-chart-1/10">
          <Construction className="h-5 w-5 text-chart-1" />
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
              {computedFuelLiters !== null
                ? `${computedFuelLiters.toFixed(2)} L`
                : "--"}
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
          Calculations assume an emission factor of{" "}
          {EQUIPMENT_EMISSION_FACTOR_KG_PER_LITER} kg CO₂e per liter of fuel
          burned.
        </p>
      </CardContent>
    </Card>
  );
}
