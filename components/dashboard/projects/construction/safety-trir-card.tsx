import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldAlert, Target } from "lucide-react";

interface SafetyTrirCardProps {
  incidentsValue: string;
  hoursWorkedValue: string;
  onIncidentsChange: (value: string) => void;
  onHoursWorkedChange: (value: string) => void;
  computedTrir: number | null;
  target: { goal: string; metric: string };
}

export function SafetyTrirCard({
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
            Track recordable incidents and exposure hours to compute
            today&apos;s total recordable incident rate.
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
          TRIR is computed as (Incidents × 200,000) ÷ Total Hours Worked. A
          lower value reflects stronger site safety.
        </p>
      </CardContent>
    </Card>
  );
}
