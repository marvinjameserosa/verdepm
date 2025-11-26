import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Save, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { cn } from "@/lib/utils";

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
  onSave?: () => void;
  isSaving?: boolean;
  history?: any[];
  metricType?: "electricity" | "water";
  categoryTag?: string;
  categoryClassName?: string;
}

export function MetricCard({
  icon,
  title,
  unit,
  relatedTarget,
  value,
  onChange,
  labelPrefix = "Today's",
  secondaryLabel,
  secondaryValue,
  onSave,
  isSaving = false,
  history,
  metricType,
  categoryTag,
  categoryClassName,
}: MetricCardProps) {
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  return (
    <Card className="glassmorphism card-hover border-l-4 border-l-chart-2">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-bold text-chart-2">
              {title}
            </CardTitle>
            {categoryTag ? (
              <Badge
                variant="outline"
                className={cn(
                  "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-500/50 dark:bg-slate-500/10 dark:text-slate-200",
                  categoryClassName
                )}
              >
                {categoryTag}
              </Badge>
            ) : null}
          </div>
        </div>
        <div className="p-2 rounded-lg bg-chart-2/10">
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
          <div className="mt-4 rounded-md bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-900 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-200">
            {secondaryLabel}
            <span className="ml-1 font-semibold">{secondaryValue ?? "--"}</span>
          </div>
        ) : null}
        {onSave && (
          <div className="flex justify-end pt-4">
            <Button onClick={onSave} disabled={isSaving} size="sm">
              <Save className="mr-2 h-3 w-3" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        )}

        {history && history.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
            <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
              Monthly History
            </h4>
            <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-3 py-2 font-medium text-gray-500 dark:text-gray-400">
                      Month
                    </th>
                    <th className="px-3 py-2 font-medium text-gray-500 dark:text-gray-400">
                      Value ({unit})
                    </th>
                    <th className="px-3 py-2 font-medium text-gray-500 dark:text-gray-400">
                      Last Updated
                    </th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {history.map((log, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-3 py-2 font-medium">{log.log_month}</td>
                      <td className="px-3 py-2">
                        {metricType === "electricity"
                          ? log.elec_placeholder
                          : metricType === "water"
                          ? log.water_placeholder
                          : "-"}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {log.submitted_on}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <Dialog
          open={!!selectedLog}
          onOpenChange={(open) => !open && setSelectedLog(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Metric Details</DialogTitle>
              <DialogDescription>
                Detailed view of the selected monthly entry.
              </DialogDescription>
            </DialogHeader>
            {selectedLog && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-muted-foreground">
                      Month:
                    </span>
                    <p>{selectedLog.log_month}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground">
                      Submitted On:
                    </span>
                    <p>{selectedLog.submitted_on}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground">
                      Value ({unit}):
                    </span>
                    <p>
                      {metricType === "electricity"
                        ? selectedLog.elec_placeholder
                        : metricType === "water"
                        ? selectedLog.water_placeholder
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground">
                      Emissions (kgCO₂e):
                    </span>
                    <p>
                      {metricType === "electricity"
                        ? selectedLog.electricity_usage_kwh
                        : metricType === "water"
                        ? selectedLog.water_consumption_cubic_m
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
