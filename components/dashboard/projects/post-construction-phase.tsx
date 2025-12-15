"use client";

import { usePostConstructionData } from "@/hooks/use-post-construction-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, TrendingUp, Activity, Zap, Truck, Leaf } from "lucide-react";
import type { Project } from "@/types/project";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type PostConstructionPhaseProps = {
  project: Project;
};

export default function PostConstructionPhase({
  project,
}: PostConstructionPhaseProps) {
  const { data, isLoading, error } = usePostConstructionData(project.id);

  if (isLoading) {
    return (
      <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
        <CardHeader>
          <CardTitle>Loading post-construction insights…</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Gathering construction logs and generating ESG report for{" "}
            {project.name}.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
        <CardHeader>
          <CardTitle className="text-red-700 dark:text-red-400">
            Error Loading Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const { targets, actuals, trends } = data;

  const formatNumber = (value: number, digits = 2) =>
    new Intl.NumberFormat(undefined, { maximumFractionDigits: digits }).format(
      value
    );

  const ComparisonCard = ({
    title,
    description,
    target,
    actual,
    unit,
    icon: Icon,
    inverse = false,
  }: {
    title: string;
    description: string;
    target: number | null;
    actual: number;
    unit: string;
    icon: any;
    inverse?: boolean;
  }) => {
    const hasTarget = target !== null && target !== undefined && target > 0;
    const percentage = hasTarget ? (actual / target!) * 100 : 0;
    const isGood = inverse ? actual >= target! : actual <= target!;

    let statusColor = "text-gray-500";
    let progressColor = "bg-gray-200";

    if (hasTarget) {
      if (isGood) {
        statusColor = "text-emerald-600 dark:text-emerald-400";
        progressColor = "bg-emerald-500";
      } else {
        const ratio = actual / target!;
        if (ratio > 1.1) {
          statusColor = "text-red-600 dark:text-red-400";
          progressColor = "bg-red-500";
        } else {
          statusColor = "text-amber-600 dark:text-amber-400";
          progressColor = "bg-amber-500";
        }
      }
    }

    return (
      <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950/40 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              {description}
            </CardDescription>
          </div>
          <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-800`}>
            <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Actual
                </p>
                <p className="text-2xl font-bold">
                  {formatNumber(actual)}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    {unit}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-muted-foreground">
                  Target
                </p>
                <p className="text-lg font-semibold">
                  {hasTarget ? formatNumber(target!) : "—"}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    {unit}
                  </span>
                </p>
              </div>
            </div>

            {hasTarget && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className={statusColor}>
                    {percentage.toFixed(1)}% of target
                  </span>
                </div>
                <Progress
                  value={Math.min(percentage, 100)}
                  className={`h-2 ${progressColor}`}
                />
              </div>
            )}

            {!hasTarget && (
              <div className="text-xs text-muted-foreground italic">
                No target set
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
          <div className="rounded-lg bg-emerald-100 p-1.5 dark:bg-emerald-900/40">
            <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-lg font-semibold sm:text-xl">
            Comprehensive ESG Performance Report
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Detailed analysis of environmental impact and safety metrics against
          project baselines.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <ComparisonCard
          title="Scope 1 Emissions"
          description="Direct emissions from owned/controlled sources."
          target={targets?.scope_one || null}
          actual={actuals.scope_one}
          unit="tCO2e"
          icon={Truck}
        />
        <ComparisonCard
          title="Scope 2 Emissions"
          description="Indirect emissions from purchased electricity."
          target={targets?.scope_two || null}
          actual={actuals.scope_two}
          unit="tCO2e"
          icon={Zap}
        />
        <ComparisonCard
          title="Scope 3 Emissions"
          description="All other indirect emissions (waste, water, etc.)."
          target={targets?.scope_three || null}
          actual={actuals.scope_three}
          unit="tCO2e"
          icon={Leaf}
        />
        <ComparisonCard
          title="Safety TRIR"
          description="Total Recordable Incident Rate."
          target={targets?.trir || null}
          actual={actuals.trir}
          unit=""
          icon={Activity}
        />
      </div>

      <div>
        <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950/40 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Emissions Trends
            </CardTitle>
            <CardDescription>
              Monthly breakdown of Scope 1, 2, and 3 emissions over the project
              lifecycle.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trends}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}t`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="scope_one"
                    name="Scope 1"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="target_scope_one"
                    name="Target Scope 1"
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    activeDot={false}
                    strokeOpacity={0.6}
                  />
                  <Line
                    type="monotone"
                    dataKey="scope_two"
                    name="Scope 2"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="target_scope_two"
                    name="Target Scope 2"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    activeDot={false}
                    strokeOpacity={0.6}
                  />
                  <Line
                    type="monotone"
                    dataKey="scope_three"
                    name="Scope 3"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="target_scope_three"
                    name="Target Scope 3"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    activeDot={false}
                    strokeOpacity={0.6}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

