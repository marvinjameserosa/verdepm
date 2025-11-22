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
import { Construction, ShieldAlert, Target, Save } from "lucide-react";
import { EQUIPMENT_EMISSION_FACTOR_KG_PER_LITER } from "@/types/construction";

interface DistanceFuelCardProps {
  // Equipment Props
  equipmentHours: string;
  equipmentFuelRate: string;
  onEquipmentHoursChange: (value: string) => void;
  onEquipmentFuelRateChange: (value: string) => void;
  computedEquipmentFuelLiters: number | null;
  computedEquipmentCo2Kg: number | null;

  // Safety Props
  incidentCount: string;
  hoursWorked: string;
  onIncidentCountChange: (value: string) => void;
  onHoursWorkedChange: (value: string) => void;
  computedTrir: number | null;
  safetyTarget: { goal: string; metric: string };

  onSave: () => void;
  isSaving?: boolean;
}

export function DistanceFuelCard({
  equipmentHours,
  equipmentFuelRate,
  onEquipmentHoursChange,
  onEquipmentFuelRateChange,
  computedEquipmentFuelLiters,
  computedEquipmentCo2Kg,
  incidentCount,
  hoursWorked,
  onIncidentCountChange,
  onHoursWorkedChange,
  computedTrir,
  safetyTarget,
  onSave,
  isSaving = false,
}: DistanceFuelCardProps) {
  return (
    <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl col-span-1 md:col-span-2 lg:col-span-2">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            Equipment Emissions Summary and Safety Performance (TRIR)
          </CardTitle>
          <CardDescription className="mt-1">
            Track equipment usage and safety incidents.
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <div className="p-1 rounded bg-emerald-100 dark:bg-emerald-900/40">
            <Construction className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-1 rounded bg-emerald-100 dark:bg-emerald-900/40">
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Equipment Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-200 border-b pb-2">
            Equipment Emissions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="equipment-total-hours">
                Total Equipment Hours
              </Label>
              <Input
                id="equipment-total-hours"
                type="number"
                value={equipmentHours}
                onChange={(event) => onEquipmentHoursChange(event.target.value)}
                placeholder="Enter total runtime"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="equipment-fuel-rate">Fuel Rate (L/hour)</Label>
              <Input
                id="equipment-fuel-rate"
                type="number"
                value={equipmentFuelRate}
                onChange={(event) =>
                  onEquipmentFuelRateChange(event.target.value)
                }
                placeholder="Enter average consumption"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="rounded-md bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-900 px-3 py-2 text-emerald-700 dark:text-emerald-200">
              Total fuel consumed:
              <span className="ml-1 font-semibold">
                {computedEquipmentFuelLiters !== null
                  ? `${computedEquipmentFuelLiters.toFixed(2)} L`
                  : "--"}
              </span>
            </div>
            <div className="rounded-md bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-900 px-3 py-2 text-emerald-700 dark:text-emerald-200">
              Total CO₂e emitted:
              <span className="ml-1 font-semibold">
                {computedEquipmentCo2Kg !== null
                  ? `${computedEquipmentCo2Kg.toFixed(2)} kg`
                  : "--"}
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Calculations assume an emission factor of{" "}
            {EQUIPMENT_EMISSION_FACTOR_KG_PER_LITER} kg CO₂e per liter of fuel
            burned.
          </p>
        </div>

        {/* Safety Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-200 border-b pb-2 flex items-center justify-between">
            <span>Safety Performance (TRIR)</span>
            <div className="flex items-center text-xs text-muted-foreground font-normal">
              <Target className="h-3 w-3 mr-1" />
              <span>
                Goal: {safetyTarget.goal} ({safetyTarget.metric})
              </span>
            </div>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="safety-incidents">Number of Incidents</Label>
              <Input
                id="safety-incidents"
                type="number"
                value={incidentCount}
                onChange={(event) => onIncidentCountChange(event.target.value)}
                placeholder="Enter recordable incidents"
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="safety-hours">Total Hours Worked</Label>
              <Input
                id="safety-hours"
                type="number"
                value={hoursWorked}
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
            TRIR is computed as (Incidents × 200,000) ÷ Total Hours Worked. A
            lower value reflects stronger site safety.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isSaving ? (
              "Saving..."
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Daily Report
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
