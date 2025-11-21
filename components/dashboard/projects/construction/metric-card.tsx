import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target } from "lucide-react";

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
            <span className="ml-1 font-semibold">{secondaryValue ?? "--"}</span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
