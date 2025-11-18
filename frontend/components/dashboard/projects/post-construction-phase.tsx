"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  CheckCircle,
  AlertTriangle,
  Award,
  TreePine,
  Droplets,
  Trash2,
  Zap,
  Target,
  TrendingUp,
} from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import type { Project } from "@/types/project";

type ConstructionDailyLog = {
  id: string;
  log_date: string;
  fuel_consumption_liters: number | null;
  equipment_usage_tco2e: number | null;
  safety_incidents: number | null;
};

type ConstructionMonthlyLog = {
  id: string;
  log_month: string;
  electricity_usage_kwh: number | null;
  water_consumption_cubic_m: number | null;
  waste_generated_kg: number | null;
  submitted_on: string | null;
};

type ConstructionMaterialLog = {
  id: string;
  material_plan: string;
  actual_supplier: string | null;
  quantity_and_unit: string | null;
  total_cost: number | null;
  delivery_fuel_used_liters: number | null;
  receipt_path: string | null;
  created_at: string;
};

const DAILY_TARGETS = {
  fuel: 500,
};

const MONTHLY_TARGETS = {
  electricity: 2000 * 0.507, // kg CO2e equivalent of planned electricity usage
  water: 10,
  waste: 250,
};

const FUEL_CO2_FACTOR = 2.68;
const ELECTRICITY_CO2_FACTOR = 0.4;
const PIE_COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#6366f1",
  "#22d3ee",
];

type PostConstructionPhaseProps = {
  project: Project;
};

export default function PostConstructionPhase({
  project,
}: PostConstructionPhaseProps) {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dailyLogs, setDailyLogs] = useState<ConstructionDailyLog[]>([]);
  const [monthlyLogs, setMonthlyLogs] = useState<ConstructionMonthlyLog[]>([]);
  const [materialLogs, setMaterialLogs] = useState<ConstructionMaterialLog[]>(
    []
  );

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      const dailyPromise = supabase
        .from("construction_daily_log")
        .select(
          "id, log_date, fuel_consumption_liters, equipment_usage_hours, safety_incidents"
        )
        .eq("project_id", project.id)
        .order("log_date", { ascending: true });

      const monthlyPromise = supabase
        .from("construction_monthly_log")
        .select(
          "id, log_month, electricity_usage_kwh, water_consumption_cubic_m, waste_generated_kg, submitted_on"
        )
        .eq("project_id", project.id)
        .order("log_month", { ascending: true });

      const materialPromise = supabase
        .from("construction_material_log")
        .select(
          "id, material_plan, actual_supplier, quantity_and_unit, total_cost, delivery_fuel_used_liters, receipt_path, created_at"
        )
        .eq("project_id", project.id)
        .order("created_at", { ascending: true });

      const [dailyResult, monthlyResult, materialResult] = await Promise.all([
        dailyPromise,
        monthlyPromise,
        materialPromise,
      ]);

      if (!isMounted) {
        return;
      }

      if (dailyResult.error) {
        console.error(
          "Failed to load construction daily logs",
          dailyResult.error
        );
        setErrorMessage(
          dailyResult.error.message || "Unable to load daily performance data."
        );
        setDailyLogs([]);
      } else {
        setDailyLogs(dailyResult.data ?? []);
      }

      if (monthlyResult.error) {
        console.error(
          "Failed to load construction monthly logs",
          monthlyResult.error
        );
        setErrorMessage(
          (prev) =>
            prev ??
            monthlyResult.error.message ??
            "Unable to load monthly performance data."
        );
        setMonthlyLogs([]);
      } else {
        setMonthlyLogs(monthlyResult.data ?? []);
      }

      if (materialResult.error) {
        console.error(
          "Failed to load construction material logs",
          materialResult.error
        );
        setErrorMessage(
          (prev) =>
            prev ??
            materialResult.error.message ??
            "Unable to load material data."
        );
        setMaterialLogs([]);
      } else {
        setMaterialLogs(materialResult.data ?? []);
      }

      setIsLoading(false);
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [project.id]);

  const totals = useMemo(() => {
    const accumulator = {
      fuel: 0,
      electricity: 0,
      water: 0,
      equipment: 0,
      waste: 0,
      incidents: 0,
    };

    for (const log of dailyLogs) {
      fuel += log.fuel_consumption_liters ?? 0;
      equipment += log.equipment_usage_tco2e ?? 0;
      if (typeof log.safety_incidents === "number" && Number.isFinite(log.safety_incidents)) {
        safetyTrirSum += log.safety_incidents;
        safetyEntries += 1;
      }
    }

    for (const log of monthlyLogs) {
      electricity += log.electricity_usage_kwh ?? 0;
      water += log.water_consumption_cubic_m ?? 0;
      waste += log.waste_generated_kg ?? 0;
    }

    const incidents = safetyEntries > 0 ? safetyTrirSum / safetyEntries : 0;

    return { fuel, electricity, water, equipment, waste, incidents };
  }, [dailyLogs, monthlyLogs]);

  const totalDays = dailyLogs.length;
  const totalMonths = monthlyLogs.length;

  const targetTotals = useMemo(
    () => ({
      fuel: totalDays * DAILY_TARGETS.fuel,
      electricity: totalMonths * MONTHLY_TARGETS.electricity,
      water: totalMonths * MONTHLY_TARGETS.water,
      waste: totalMonths * MONTHLY_TARGETS.waste,
    }),
    [totalDays, totalMonths]
  );

  const carbonActualTons = useMemo(() => {
    const fuelCarbonKg = totals.fuel * FUEL_CO2_FACTOR;
    const electricityCarbonKg = totals.electricity;
    return (fuelCarbonKg + electricityCarbonKg) / 1000;
  }, [totals.electricity, totals.fuel]);

  const carbonTargetTons = useMemo(() => {
    const fuelTargetKg = targetTotals.fuel * FUEL_CO2_FACTOR;
    const electricityTargetKg =
      targetTotals.electricity * ELECTRICITY_CO2_FACTOR;
    return (fuelTargetKg + electricityTargetKg) / 1000;
  }, [targetTotals.electricity, targetTotals.fuel]);

  const getPerformanceStatus = (
    actual: number,
    target: number,
    lowerIsBetter = true
  ) => {
    if (target <= 0) {
      return actual <= 0 ? "exceeded" : "over";
    }
    const ratio = actual / target;
    if (lowerIsBetter) {
      if (ratio <= 0.9) return "exceeded";
      if (ratio <= 1.05) return "near";
      return "over";
    }
    if (ratio >= 1.1) return "exceeded";
    if (ratio >= 0.95) return "near";
    return "behind";
  };

  const esgGoalsData = useMemo(() => {
    if (totalDays === 0 && totalMonths === 0) {
      return [];
    }
    return [
      {
        category: "Fuel Consumption",
        actual: totals.fuel,
        target: targetTotals.fuel,
        unit: "liters",
        status: getPerformanceStatus(totals.fuel, targetTotals.fuel, true),
      },
      {
        category: "Electricity Emissions",
        actual: totals.electricity,
        target: targetTotals.electricity,
        unit: "kWh",
        status: getPerformanceStatus(
          totals.electricity,
          targetTotals.electricity,
          true
        ),
      },
      {
        category: "Water Consumption",
        actual: totals.water,
        target: targetTotals.water,
        unit: "m³",
        status: getPerformanceStatus(totals.water, targetTotals.water, true),
      },
      {
        category: "Waste Generated",
        actual: totals.waste,
        target: targetTotals.waste,
        unit: "kg",
        status: getPerformanceStatus(totals.waste, targetTotals.waste, true),
      },
      {
        category: "Safety TRIR",
        actual: totals.incidents,
        target: 0,
        unit: "TRIR",
        status: getPerformanceStatus(totals.incidents, 0, true),
      },
    ];
  }, [
    targetTotals.electricity,
    targetTotals.fuel,
    targetTotals.waste,
    targetTotals.water,
    totalDays,
    totalMonths,
    totals.electricity,
    totals.fuel,
    totals.incidents,
    totals.waste,
    totals.water,
  ]);

  const carbonFootprintData = useMemo(() => {
    if (totalDays === 0 && totalMonths === 0) {
      return [];
    }
    return [
      {
        phase: "Fuel Combustion",
        planned: Number(
          ((targetTotals.fuel * FUEL_CO2_FACTOR) / 1000).toFixed(2)
        ),
        actual: Number(((totals.fuel * FUEL_CO2_FACTOR) / 1000).toFixed(2)),
      },
      {
        phase: "Electricity",
        planned: Number(
          ((targetTotals.electricity * ELECTRICITY_CO2_FACTOR) / 1000).toFixed(
            2
          )
        ),
        actual: Number(
          ((totals.electricity * ELECTRICITY_CO2_FACTOR) / 1000).toFixed(2)
        ),
      },
      {
        phase: "Waste Handling",
        planned: Number((targetTotals.waste / 1000).toFixed(2)),
        actual: Number((totals.waste / 1000).toFixed(2)),
      },
    ];
  }, [
    targetTotals.electricity,
    targetTotals.fuel,
    targetTotals.waste,
    totalDays,
    totalMonths,
    totals.electricity,
    totals.fuel,
    totals.waste,
  ]);

  const supplierMixData = useMemo(() => {
    if (materialLogs.length === 0) {
      return [];
    }
    const counts = materialLogs.reduce<
      Record<string, { count: number; cost: number }>
    >((acc, log) => {
      const key =
        log.actual_supplier && log.actual_supplier.trim().length > 0
          ? log.actual_supplier
          : "Unspecified Supplier";
      if (!acc[key]) {
        acc[key] = { count: 0, cost: 0 };
      }
      acc[key].count += 1;
      acc[key].cost += log.total_cost ?? 0;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({
      type: name,
      deliveries: value.count,
      cost: value.cost,
    }));
  }, [materialLogs]);

  const monthlyProgress = useMemo(() => {
    if (dailyLogs.length === 0 && monthlyLogs.length === 0) {
      return [];
    }

    const formatter = new Intl.DateTimeFormat(undefined, {
      month: "short",
      year: "2-digit",
    });

    const map = new Map<
      string,
      { carbon: number; waste: number; energy: number; date: Date }
    >();

    const ensureEntry = (date: Date) => {
      const normalized = new Date(
        Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)
      );
      const label = formatter.format(normalized);
      if (!map.has(label)) {
        map.set(label, { carbon: 0, waste: 0, energy: 0, date: normalized });
      }
      return map.get(label)!;
    };

    for (const log of dailyLogs) {
      const date = new Date(log.log_date);
      if (Number.isNaN(date.getTime())) {
        continue;
      }
      const entry = ensureEntry(date);
      const fuelCarbon = (log.fuel_consumption_liters ?? 0) * FUEL_CO2_FACTOR;
      entry.carbon += fuelCarbon / 1000;
    }

    for (const log of monthlyLogs) {
      const date = new Date(log.log_month);
      if (Number.isNaN(date.getTime())) {
        continue;
      }
      const entry = ensureEntry(date);
      const electricityCarbon =
        (log.electricity_usage_kwh ?? 0) * ELECTRICITY_CO2_FACTOR;
      entry.carbon += electricityCarbon / 1000;
      entry.waste += log.waste_generated_kg ?? 0;
      entry.energy += electricityEmissionsKg;
    }

    return Array.from(map.entries())
      .sort((a, b) => a[1].date.getTime() - b[1].date.getTime())
      .map(([month, data]) => ({
        month,
        carbon: Number(data.carbon.toFixed(2)),
        waste: Number(data.waste.toFixed(2)),
        energy: Number(data.energy.toFixed(2)),
      }));
  }, [dailyLogs, monthlyLogs]);

  const complianceScores = useMemo(() => {
    if (totalDays === 0 && totalMonths === 0) {
      return [];
    }
    const scoreFor = (actual: number, target: number) => {
      if (target <= 0) {
        return actual <= 0 ? 100 : 0;
      }
      const ratio = actual / target;
      if (ratio <= 1) {
        return 100;
      }
      return Math.max(0, Math.round((target / Math.max(actual, 1)) * 100));
    };

    return [
      {
        metric: "Fuel Efficiency",
        score: scoreFor(totals.fuel, targetTotals.fuel),
        benchmark: 85,
      },
      {
        metric: "Electricity Emissions",
        score: scoreFor(totals.electricity, targetTotals.electricity),
        benchmark: 85,
      },
      {
        metric: "Water Management",
        score: scoreFor(totals.water, targetTotals.water),
        benchmark: 80,
      },
      {
        metric: "Waste Diversion",
        score: scoreFor(totals.waste, targetTotals.waste),
        benchmark: 90,
      },
      {
        metric: "Site Safety (TRIR)",
        score: totals.incidents > 0 ? 60 : 100,
        benchmark: 95,
      },
    ];
  }, [
    targetTotals.electricity,
    targetTotals.fuel,
    targetTotals.waste,
    targetTotals.water,
    totalDays,
    totalMonths,
    totals.electricity,
    totals.fuel,
    totals.incidents,
    totals.waste,
    totals.water,
  ]);

  const totalMaterialsCost = useMemo(() => {
    return materialLogs.reduce((acc, log) => acc + (log.total_cost ?? 0), 0);
  }, [materialLogs]);

  const totalDeliveryFuel = useMemo(() => {
    return materialLogs.reduce(
      (acc, log) => acc + (log.delivery_fuel_used_liters ?? 0),
      0
    );
  }, [materialLogs]);

  const formatNumber = (value: number, digits = 0) =>
    new Intl.NumberFormat(undefined, { maximumFractionDigits: digits }).format(
      value
    );

  const waterEfficiency =
    targetTotals.water > 0
      ? Math.max(
          0,
          Math.min(
            100,
            ((targetTotals.water - totals.water) / targetTotals.water) * 100
          )
        )
      : 0;

  const wasteDiversion =
    targetTotals.waste > 0
      ? Math.max(
          0,
          Math.min(
            100,
            ((targetTotals.waste - totals.waste) / targetTotals.waste) * 100
          )
        )
      : 0;

  const energyReduction =
    targetTotals.electricity > 0
      ? Math.max(
          0,
          Math.min(
            100,
            ((targetTotals.electricity - totals.electricity) /
              targetTotals.electricity) *
              100
          )
        )
      : 0;

  const supplierHighlights = supplierMixData
    .sort((a, b) => b.deliveries - a.deliveries)
    .slice(0, 4)
    .map((supplier) => ({
      name: supplier.type,
      status: "Supplier",
      date: `${supplier.deliveries} deliveries • $${formatNumber(
        supplier.cost,
        0
      )}`,
    }));

  const overallCompliance = complianceScores.length
    ? Math.round(
        complianceScores.reduce((acc, curr) => acc + curr.score, 0) /
          complianceScores.length
      )
    : 0;

  const strengths: string[] = [];
  if (totals.fuel <= targetTotals.fuel) {
    strengths.push("Fuel consumption stayed within planned limits.");
  }
  if (totals.electricity <= targetTotals.electricity) {
    strengths.push("Electricity emissions met the project efficiency target.");
  }
  if (totals.waste <= targetTotals.waste) {
    strengths.push("Waste generation remained under the diversion goal.");
  }
  if (totals.incidents === 0) {
    strengths.push("TRIR held at zero recordable incidents across logged days.");
  }
  if (strengths.length === 0) {
    strengths.push("Project team maintained consistent reporting cadence.");
  }

  const improvements: string[] = [];
  if (totals.fuel > targetTotals.fuel) {
    improvements.push(
      "Review heavy equipment usage to reduce daily fuel burn."
    );
  }
  if (totals.electricity > targetTotals.electricity) {
    improvements.push(
      "Tune temporary power loads to cut excess electricity demand."
    );
  }
  if (totals.water > targetTotals.water) {
    improvements.push(
      "Expand on-site water reuse to stay within conservation goals."
    );
  }
  if (totals.waste > targetTotals.waste) {
    improvements.push(
      "Increase sorting efficiency to boost landfill diversion."
    );
  }
  if (totals.incidents > 0) {
    improvements.push(
      "Refresh safety toolbox talks to avoid repeat incidents."
    );
  }
  if (improvements.length === 0) {
    improvements.push(
      "Continue monitoring trends to preserve strong performance."
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "exceeded":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "near":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "over":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "behind":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      Supplier:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400",
      Default:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    };
    return colors[status as keyof typeof colors] || colors.Default;
  };

  if (isLoading) {
    return (
      <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
        <CardHeader>
          <CardTitle>Loading post-construction insights…</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Gathering construction logs and material deliveries for{" "}
            {project.name}.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!isLoading && dailyLogs.length === 0 && materialLogs.length === 0) {
    return (
      <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
        <CardHeader>
          <CardTitle>No post-construction data yet</CardTitle>
          <CardDescription>
            Submit at least one construction daily report to unlock the
            analytics view.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
              <Award className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-emerald-700 dark:text-emerald-300">
                Post-Construction Assessment
              </CardTitle>
              <CardDescription>
                Aggregated ESG performance derived from construction daily
                reports
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        {errorMessage ? (
          <CardContent>
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
              {errorMessage}
            </div>
          </CardContent>
        ) : null}
      </Card>

      <div className="flex flex-wrap gap-2">
        {[
          { id: "overview", label: "Overview", icon: Target },
          { id: "metrics", label: "ESG Metrics", icon: TrendingUp },
          { id: "compliance", label: "Compliance", icon: CheckCircle },
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={selectedTab === tab.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTab(tab.id)}
            className={`rounded-xl ${
              selectedTab === tab.id
                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                : "bg-white/50 dark:bg-gray-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
            }`}
          >
            <tab.icon className="h-4 w-4 mr-2" />
            {tab.label}
          </Button>
        ))}
      </div>

      {selectedTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                <Target className="h-5 w-5" />
                ESG Goal Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {esgGoalsData.map((goal) => {
                  const percentOfTarget =
                    goal.target > 0
                      ? Math.min((goal.actual / goal.target) * 100, 200)
                      : goal.actual === 0
                      ? 0
                      : 200;
                  return (
                    <div key={goal.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{goal.category}</span>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(goal.status)}
                          <span className="text-sm font-medium">
                            {formatNumber(goal.actual, 1)} {goal.unit} /{" "}
                            {formatNumber(goal.target, 1)} {goal.unit}
                          </span>
                        </div>
                      </div>
                      <Progress
                        value={Math.min(100, percentOfTarget)}
                        className={
                          percentOfTarget <= 100 ? "h-2" : "h-2 bg-red-200"
                        }
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Target</span>
                        <span>{percentOfTarget.toFixed(1)}% of target</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                <TrendingUp className="h-5 w-5" />
                Key Performance Summary
              </CardTitle>
              <CardDescription>
                Totals based on {totalDays} logged construction day
                {totalDays === 1 ? "" : "s"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                  <TreePine className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-emerald-700">
                    {formatNumber(
                      Math.max(carbonTargetTons - carbonActualTons, 0),
                      1
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    tCO₂e below plan
                  </div>
                </div>
                <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <Droplets className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-700">
                    {formatNumber(waterEfficiency, 0)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Water efficiency
                  </div>
                </div>
                <div className="text-center p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                  <Trash2 className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-amber-700">
                    {formatNumber(wasteDiversion, 0)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Waste diversion
                  </div>
                </div>
                <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-700">
                    {formatNumber(energyReduction, 0)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Energy reduction
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <span className="font-semibold text-foreground block">
                    Fuel Used
                  </span>
                  {formatNumber(totals.fuel, 1)} liters
                </div>
                <div>
                  <span className="font-semibold text-foreground block">
                    Electricity Used
                  </span>
                  {formatNumber(totals.electricity, 1)} kWh
                </div>
                <div>
                  <span className="font-semibold text-foreground block">
                    Material Deliveries
                  </span>
                  {materialLogs.length} records
                </div>
                <div>
                  <span className="font-semibold text-foreground block">
                    Material Spend
                  </span>
                  ${formatNumber(totalMaterialsCost, 2)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedTab === "metrics" && (
        <div className="space-y-6">
          <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
            <CardHeader>
              <CardTitle className="text-emerald-700 dark:text-emerald-300">
                Carbon Footprint Comparison
              </CardTitle>
              <CardDescription>
                Planned versus actual emissions by source
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={carbonFootprintData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="phase" />
                  <YAxis
                    label={{
                      value: "tCO₂e",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="planned"
                    fill="#94a3b8"
                    name="Planned (tCO₂e)"
                  />
                  <Bar dataKey="actual" fill="#10b981" name="Actual (tCO₂e)" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold">
                    Net carbon delta:{" "}
                    {formatNumber(carbonTargetTons - carbonActualTons, 2)} tCO₂e
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
            <CardHeader>
              <CardTitle className="text-emerald-700 dark:text-emerald-300">
                Material Delivery Mix
              </CardTitle>
              <CardDescription>
                Distribution of deliveries by supplier
              </CardDescription>
            </CardHeader>
            <CardContent>
              {supplierMixData.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Log material deliveries in the construction tab to see
                  supplier statistics.
                </p>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={supplierMixData}
                        dataKey="deliveries"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ type, deliveries }) =>
                          `${type}: ${deliveries}`
                        }
                      >
                        {supplierMixData.map((entry, index) => (
                          <Cell
                            key={entry.type}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-3">
                    <h4 className="font-semibold">Supplier Highlights</h4>
                    {supplierMixData.map((item, index) => (
                      <div
                        key={item.type}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{
                              backgroundColor:
                                PIE_COLORS[index % PIE_COLORS.length],
                            }}
                          />
                          <span className="font-medium">{item.type}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {item.deliveries} loads • $
                          {formatNumber(item.cost, 0)}
                        </span>
                      </div>
                    ))}
                    <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-sm">
                      <strong>Total delivery fuel used:</strong>{" "}
                      {formatNumber(totalDeliveryFuel, 1)} liters
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
            <CardHeader>
              <CardTitle className="text-emerald-700 dark:text-emerald-300">
                Monthly Performance Trends
              </CardTitle>
              <CardDescription>
                Carbon, waste, and electricity progression
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="carbon"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Carbon (tCO₂e)"
                  />
                  <Line
                    type="monotone"
                    dataKey="waste"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Waste (kg)"
                  />
                  <Line
                    type="monotone"
                    dataKey="energy"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="Electricity (kWh)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedTab === "compliance" && (
        <div className="space-y-6">
          <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
            <CardHeader>
              <CardTitle className="text-emerald-700 dark:text-emerald-300">
                Environmental Compliance Score
              </CardTitle>
              <CardDescription>
                Derived from actual performance vs project targets
              </CardDescription>
            </CardHeader>
            <CardContent>
              {complianceScores.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Add daily logs to generate compliance insights.
                </p>
              ) : (
                <>
                  <div className="space-y-4">
                    {complianceScores.map((item) => (
                      <div key={item.metric} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{item.metric}</span>
                          <div className="flex items-center gap-2">
                            {item.score >= item.benchmark ? (
                              <CheckCircle className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                            )}
                            <span className="font-bold text-lg">
                              {item.score}%
                            </span>
                          </div>
                        </div>
                        <Progress value={item.score} className="h-3" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Benchmark: {item.benchmark}%</span>
                          <span
                            className={
                              item.score >= item.benchmark
                                ? "text-emerald-600"
                                : "text-amber-600"
                            }
                          >
                            {item.score >= item.benchmark ? "Exceeds" : "Below"}{" "}
                            requirement
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-center">
                    <div className="text-3xl font-bold text-emerald-700 mb-1">
                      {overallCompliance}%
                    </div>
                    <div className="text-sm text-emerald-600">
                      Overall compliance score
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
            <CardHeader>
              <CardTitle className="text-emerald-700 dark:text-emerald-300">
                Top Delivery Partners
              </CardTitle>
              <CardDescription>
                Suppliers contributing most to the project footprint
              </CardDescription>
            </CardHeader>
            <CardContent>
              {supplierHighlights.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No deliveries logged yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {supplierHighlights.map((entry) => (
                    <div
                      key={entry.name}
                      className="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Award className="h-6 w-6 text-emerald-600" />
                          <div>
                            <div className="font-semibold">{entry.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {entry.date}
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className={getStatusBadge(entry.status)}
                        >
                          {entry.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
            <CardHeader>
              <CardTitle className="text-emerald-700 dark:text-emerald-300">
                Post-Audit Remarks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border-l-4 border-emerald-500">
                <h4 className="font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
                  Strengths
                </h4>
                <ul className="text-sm space-y-1">
                  {strengths.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border-l-4 border-amber-500">
                <h4 className="font-semibold text-amber-700 dark:text-amber-300 mb-2">
                  Areas for Improvement
                </h4>
                <ul className="text-sm space-y-1">
                  {improvements.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
