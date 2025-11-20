"use client";

import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase/client";
import { mapProjectFromSupabase } from "@/components/dashboard/projects/project-helpers";
import type { Project } from "@/types/project";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  TreePine,
  Zap,
  Droplets,
  Trash2,
  Building2,
  TrendingUp,
  TrendingDown,
  Leaf,
  ChevronDown,
} from "lucide-react";
import { Background } from "@/components/ui/background";

function getDummyEsgScores(project: Project) {
  const hash = project.name
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return {
    environmental: 75 + (hash % 20),
    social: 70 + (hash % 25),
    governance: 80 + (hash % 15),
    overall:
      Math.round(
        ((75 + (hash % 20) + 70 + (hash % 25) + 80 + (hash % 15)) / 3) * 10
      ) / 10,
    status:
      project.status === "completed"
        ? "Completed"
        : project.status === "in-progress"
          ? "On Track"
          : "Delayed",
  };
}
type EmissionsScopeDatum = {
  name: string;
  value: number;
  percentage: number;
};

type ConstructionDailyLogRecord = {
  fuel_consumption_liters: number | null;
  equipment_usage_tco2e: number | null;
  scope1: number | null;
};

type ConstructionMonthlyLogRecord = {
  electricity_usage_kwh: number | null;
  water_consumption_cubic_m: number | null;
  waste_generated_kg: number | null;
  scope2?: number | null;
  scope3?: number | null;
};

const FUEL_EMISSION_FACTOR_KG_PER_LITER = 2.68;
const WATER_EMISSION_FACTOR = 0.264; // kg CO2e per m3

const DEFAULT_SCOPE_DATA: EmissionsScopeDatum[] = [
  { name: "Scope 1", value: 0, percentage: 0 },
  { name: "Scope 2", value: 0, percentage: 0 },
  { name: "Scope 3", value: 0, percentage: 0 },
];

const monthlyEmissionsData = [
  { month: "Jan", scope1: 1200, scope2: 980, scope3: 1450, total: 3630 },
  { month: "Feb", scope1: 1150, scope2: 1020, scope3: 1380, total: 3550 },
  { month: "Mar", scope1: 1300, scope2: 1100, scope3: 1520, total: 3920 },
  { month: "Apr", scope1: 1250, scope2: 1050, scope3: 1480, total: 3780 },
  { month: "May", scope1: 1180, scope2: 990, scope3: 1420, total: 3590 },
  { month: "Jun", scope1: 1220, scope2: 1080, scope3: 1460, total: 3760 },
  { month: "Jul", scope1: 1280, scope2: 1120, scope3: 1500, total: 3900 },
  { month: "Aug", scope1: 1190, scope2: 970, scope3: 1400, total: 3560 },
  { month: "Sep", scope1: 1240, scope2: 1050, scope3: 1470, total: 3760 },
  { month: "Oct", scope1: 1290, scope2: 1090, scope3: 1530, total: 3910 },
  { month: "Nov", scope1: 1210, scope2: 1000, scope3: 1430, total: 3640 },
  { month: "Dec", scope1: 1260, scope2: 1070, scope3: 1490, total: 3820 },
];

const projectBreakdownData = [
  {
    project: "Verde Tower",
    scope1: 2840,
    scope2: 2150,
    scope3: 3200,
    total: 8190,
    phase: "Construction",
    progress: 78,
    status: "On Track",
  },
  {
    project: "Azure Shopping Mall",
    scope1: 1950,
    scope2: 1680,
    scope3: 2450,
    total: 6080,
    phase: "Pre-Construction",
    progress: 45,
    status: "Delayed",
  },
  {
    project: "Crimson Bridge",
    scope1: 3200,
    scope2: 2890,
    scope3: 4100,
    total: 10190,
    phase: "Post-Construction",
    progress: 100,
    status: "Completed",
  },
  {
    project: "Solaris Industrial Park",
    scope1: 1580,
    scope2: 1320,
    scope3: 1980,
    total: 4880,
    phase: "Construction",
    progress: 62,
    status: "On Track",
  },
  {
    project: "Aqua-front Residences",
    scope1: 2850,
    scope2: 2240,
    scope3: 3180,
    total: 8270,
    phase: "Construction",
    progress: 89,
    status: "On Track",
  },
  {
    project: "Ember Hotel",
    scope1: 2820,
    scope2: 1900,
    scope3: 3159,
    total: 7879,
    phase: "Pre-Construction",
    progress: 23,
    status: "Delayed",
  },
];

// Dynamically generate ESG breakdown for fetched projects
const getProjectEsgBreakdown = (projects: Project[]) =>
  projects.map((project) => ({
    project: project.name,
    ...getDummyEsgScores(project),
  }));

// Dynamically generate ESG detailed breakdown for fetched projects
const getEsgDetailedBreakdown = (projects: Project[]) => {
  const projectEsgBreakdown = getProjectEsgBreakdown(projects);
  return {
    environmental: {
      totalScore: 87,
      metrics: [
        {
          name: "Carbon Footprint Reduction",
          score: 89,
          target: 95,
          trend: "up",
        },
        { name: "Energy Efficiency", score: 85, target: 90, trend: "up" },
        { name: "Waste Management", score: 91, target: 85, trend: "up" },
        { name: "Water Conservation", score: 83, target: 88, trend: "stable" },
        { name: "Sustainable Materials", score: 88, target: 90, trend: "up" },
      ],
      projects: projectEsgBreakdown.map((p) => ({
        name: p.project,
        score: p.environmental,
        status: p.status,
      })),
    },
    social: {
      totalScore: 82,
      metrics: [
        { name: "Worker Safety", score: 95, target: 98, trend: "up" },
        { name: "Community Engagement", score: 78, target: 85, trend: "up" },
        { name: "Local Employment", score: 82, target: 80, trend: "up" },
        {
          name: "Training & Development",
          score: 85,
          target: 90,
          trend: "stable",
        },
        { name: "Diversity & Inclusion", score: 74, target: 85, trend: "up" },
      ],
      projects: projectEsgBreakdown.map((p) => ({
        name: p.project,
        score: p.social,
        status: p.status,
      })),
    },
    governance: {
      totalScore: 91,
      metrics: [
        { name: "Ethics & Compliance", score: 96, target: 95, trend: "up" },
        { name: "Risk Management", score: 89, target: 92, trend: "up" },
        {
          name: "Transparency & Reporting",
          score: 93,
          target: 90,
          trend: "up",
        },
        {
          name: "Stakeholder Engagement",
          score: 88,
          target: 90,
          trend: "stable",
        },
        { name: "Board Oversight", score: 91, target: 95, trend: "up" },
      ],
      projects: projectEsgBreakdown.map((p) => ({
        name: p.project,
        score: p.governance,
        status: p.status,
      })),
    },
  };
};

const supplierData = {
  total: 285,
  complete: 247,
  incomplete: 38,
};

export default function Dashboard() {
  const [isProjectEmissionsOpen, setIsProjectEmissionsOpen] = useState(true);
  const [isEmissionsBreakdownOpen, setIsEmissionsBreakdownOpen] =
    useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [emissionsView, setEmissionsView] = useState<
    "daily" | "weekly" | "monthly" | "yearly" | "custom"
  >("monthly");
  const [customDateRange, setCustomDateRange] = useState<{
    start: string;
    end: string;
  } | null>(null);
  const [emissionsScopeData, setEmissionsScopeData] =
    useState<EmissionsScopeDatum[]>(DEFAULT_SCOPE_DATA);
  const totalEmissions = React.useMemo(
    () => emissionsScopeData.reduce((sum, scope) => sum + scope.value, 0),
    [emissionsScopeData]
  );
  const [totalElectricityEmissionsTco2e, setTotalElectricityEmissionsTco2e] =
    useState(0);
  const [totalWaterEmissionsTco2e, setTotalWaterEmissionsTco2e] = useState(0);
  const [totalWasteEmissionsTco2e, setTotalWasteEmissionsTco2e] = useState(0);

  // Fetch projects from Supabase
  useEffect(() => {
    async function fetchProjects() {
      const { data, error } = await supabase
        .from("projects")
        .select(
          "project_id, organization_id, project_name, slug, description, status, priority, category, client_name, location, budget, created_at, updated_at"
        );
      if (!error && data) {
        setProjects(data.map(mapProjectFromSupabase));
      }
    }
    fetchProjects();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchEmissions = async () => {
      const [totalCo2eResult, monthlyResult] = await Promise.all([
        supabase
          .from("total_co2e")
          .select("equipment_usage_tco2e, fuel_consumption_tco2e, electricity_consumption_tco2e, waste_generated_tco2e, water_supply_tco2e"),
        supabase
          .from("construction_monthly_log")
          .select(
            "elec_placeholder, water_placeholder, waste_placeholder, electricity_usage_kwh, water_consumption_cubic_m, waste_generated_kg, scope2, scope3"
          ),
      ]);

      if (!isMounted) {
        return;
      }

      const totalCo2eRecords =
        totalCo2eResult.error || !totalCo2eResult.data
          ? []
          : (totalCo2eResult.data as any[]);
      const monthlyLogs =
        monthlyResult.error || !monthlyResult.data
          ? []
          : (monthlyResult.data as any[]);

      if (
        (totalCo2eResult.error && monthlyResult.error) ||
        (totalCo2eRecords.length === 0 && monthlyLogs.length === 0)
      ) {
        setEmissionsScopeData(DEFAULT_SCOPE_DATA);
        setTotalElectricityEmissionsTco2e(0);
        setTotalWaterEmissionsTco2e(0);
        setTotalWasteEmissionsTco2e(0);
        return;
      }

      const toNumber = (value: number | null) =>
        typeof value === "number" && Number.isFinite(value) ? value : 0;

      let scope1_tco2e = 0;
      let scope2_tco2e = 0;
      let scope3_tco2e = 0;
      let totalElectricityTco2e = 0;
      let totalWaterTco2e = 0;
      let totalWasteTco2e = 0;

      // Aggregate emissions from total_co2e table
      for (const record of totalCo2eRecords) {
        const equipmentTco2e = toNumber(record.equipment_usage_tco2e);
        const fuelTco2e = toNumber(record.fuel_consumption_tco2e);
        const electricityTco2e = toNumber(record.electricity_consumption_tco2e);
        const wasteTco2e = toNumber(record.waste_generated_tco2e);
        const waterTco2e = toNumber(record.water_supply_tco2e);

        // Scope 1: Equipment + Fuel emissions (already in tCO2e)
        scope1_tco2e += equipmentTco2e + fuelTco2e;

        // Scope 2: Electricity emissions (already in tCO2e)
        scope2_tco2e += electricityTco2e;

        // Scope 3: Waste + Water emissions (already in tCO2e)
        scope3_tco2e += wasteTco2e + waterTco2e;

        // Track totals for card display
        totalElectricityTco2e += electricityTco2e;
        totalWaterTco2e += waterTco2e;
        totalWasteTco2e += wasteTco2e;
      }

      // Use the most recent monthly log for dashboard cards
      const latestMonthly =
        monthlyLogs.length > 0 ? monthlyLogs[monthlyLogs.length - 1] : null;
      const waterPlaceholder = latestMonthly?.water_placeholder ?? 0;
      const wastePlaceholder = latestMonthly?.waste_placeholder ?? 0;

      setTotalElectricityEmissionsTco2e(totalElectricityTco2e);
      setTotalWaterEmissionsTco2e(totalWaterTco2e);
      setTotalWasteEmissionsTco2e(totalWasteTco2e);

      // Still aggregate scope3 from monthly logs
      for (const log of monthlyLogs) {
        if (typeof log.scope3 === "number" && Number.isFinite(log.scope3)) {
          scope3_tco2e += log.scope3;
        }
      }

      const total = scope1_tco2e + scope2_tco2e + scope3_tco2e;
      const percentage = (value: number) =>
        total > 0 ? Number(((value / total) * 100).toFixed(1)) : 0;

      setEmissionsScopeData([
        {
          name: "Scope 1",
          value: scope1_tco2e,
          percentage: percentage(scope1_tco2e),
        },
        {
          name: "Scope 2",
          value: scope2_tco2e,
          percentage: percentage(scope2_tco2e),
        },
        {
          name: "Scope 3",
          value: scope3_tco2e,
          percentage: percentage(scope3_tco2e),
        },
      ]);
    };

    fetchEmissions();

    return () => {
      isMounted = false;
    };
  }, []);

  const esgDetailedBreakdown = getEsgDetailedBreakdown(projects);

  const formatEmissionValue = (value: number) => {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(1)}k`;
    }
    return value.toFixed(0);
  };

  const formatWaterVolume = (value: number) => {
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(1)}k`;
    }
    return value.toFixed(0);
  };

  const formatWasteKilograms = (value: number) => {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(1)}k`;
    }
    return value.toFixed(0);
  };

  // --- Project selection state for Project Rankings ---
  const [selectedProjectName, setSelectedProjectName] = useState<string | null>(
    null
  );

  const projectKeyMetrics: Record<
    string,
    {
      metrics: { name: string; score: number; target: number; trend: string }[];
    }
  > = {};
  esgDetailedBreakdown.environmental.projects.forEach((proj, idx) => {
    projectKeyMetrics[proj.name] = {
      metrics: esgDetailedBreakdown.environmental.metrics.map((m, i) => ({
        ...m,
        score: m.score - idx * 2 + i, // simple variation for demo
        trend: i % 2 === 0 ? "up" : "stable",
      })),
    };
  });

  // Get metrics for selected project, or default
  const selectedMetrics =
    selectedProjectName && projectKeyMetrics[selectedProjectName]
      ? projectKeyMetrics[selectedProjectName].metrics
      : esgDetailedBreakdown.environmental.metrics;

  return (
    <Background variant="subtle" className="min-h-screen">
      <div className="relative z-10 p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 rounded-2xl border border-white/20 shadow-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                  ESG Dashboard
                </h1>
                <p className="text-muted-foreground mt-1">
                  Comprehensive Environmental, Social & Governance Analytics
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
                <Leaf className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Key Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Emissions */}
            <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    Total Emissions
                  </CardTitle>
                  <TreePine className="h-4 w-4 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-700">
                  {totalEmissions.toFixed(1)}
                  <span className="text-base font-normal text-muted-foreground ml-1">
                    tCO₂e
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Combined Scope 1, 2 & 3
                </p>
                <div className="flex items-center mt-2">
                  {/*<TrendingDown className="h-3 w-3 text-emerald-500 mr-1" />
                  <span className="text-xs text-emerald-600">
                    -12.3% vs last year
                  </span> */}
                </div>
              </CardContent>
            </Card>

            {/* Electricity Emissions */}
            <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Electricity Emissions
                  </CardTitle>
                  <Zap className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700">
                  {totalElectricityEmissionsTco2e.toFixed(3)}
                </div>
                <p className="text-xs text-muted-foreground">
                  tCO₂e from grid electricity
                </p>
                <div className="flex items-center mt-2">
                  {/*<TrendingUp className="h-3 w-3 text-red-500 mr-1" />
                  <span className="text-xs text-red-600">
                    +3.2% vs last month
                  </span>*/}
                </div>
              </CardContent>
            </Card>

            {/* Water Usage */}
            <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
                    Water Emissions
                  </CardTitle>
                  <Droplets className="h-4 w-4 text-cyan-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-cyan-700">
                  {totalWaterEmissionsTco2e.toFixed(3)}
                </div>
                <p className="text-xs text-muted-foreground">tCO₂e from water supply</p>
                <div className="flex items-center mt-2">
                  {/*<TrendingDown className="h-3 w-3 text-emerald-500 mr-1" />
                  <span className="text-xs text-emerald-600">
                    -8.1% efficiency gain
                  </span> */}
                </div>
              </CardContent>
            </Card>

            {/* Waste Generated */}
            <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">
                    Waste Emissions
                  </CardTitle>
                  <Trash2 className="h-4 w-4 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-700">
                  {totalWasteEmissionsTco2e.toFixed(3)}
                </div>
                <p className="text-xs text-muted-foreground">tCO₂e from waste</p>
                <div className="flex items-center mt-2">
                  {/*<TrendingDown className="h-3 w-3 text-emerald-500 mr-1" />
                  <span className="text-xs text-emerald-600">78% recycled</span>*/}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Emissions Breakdown */}
            <div className="col-span-1 lg:col-span-2">
              <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
                <CardHeader
                  className="flex flex-row items-center justify-between cursor-pointer"
                  onClick={() =>
                    setIsEmissionsBreakdownOpen(!isEmissionsBreakdownOpen)
                  }
                >
                  <div>
                    <CardTitle className="text-emerald-700 dark:text-emerald-300">
                      Scope 1, 2 & 3 Emissions
                    </CardTitle>
                    <CardDescription>
                      Total: {(totalEmissions / 1000).toFixed(1)}k tCO₂e
                    </CardDescription>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-emerald-700 dark:text-emerald-300 transform transition-transform ${isEmissionsBreakdownOpen ? "rotate-180" : ""
                      }`}
                  />
                </CardHeader>
                {isEmissionsBreakdownOpen && (
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={emissionsScopeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => [`${value} tCO₂e`, ""]}
                        />
                        <Bar
                          dataKey="value"
                          fill="#10b981"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2">
                      {emissionsScopeData.map((scope, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                        >
                          <span className="font-medium">{scope.name}</span>
                          <div className="text-right">
                            <div className="font-bold">
                              {scope.value.toLocaleString()} tCO₂e
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {scope.percentage}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>

            {/* ESG Score Overview */}
            {/* <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
              <CardHeader
                className="flex flex-row items-center justify-between cursor-pointer"
                onClick={() => setIsEsgPerformanceOpen(!isEsgPerformanceOpen)}
              >
                <div>
                  <CardTitle className="text-emerald-700 dark:text-emerald-300">
                    ESG Performance by Project
                  </CardTitle>
                  <CardDescription>
                    Environmental, Social & Governance scores across all
                    projects
                  </CardDescription>
                </div>
                <ChevronDown
                  className={`h-5 w-5 text-emerald-700 dark:text-emerald-300 transform transition-transform ${
                    isEsgPerformanceOpen ? "rotate-180" : ""
                  }`}
                />
              </CardHeader>
              {isEsgPerformanceOpen && (
                <CardContent>
                  <div className="space-y-4">
                    {projectEsgBreakdown.map((project, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/30 dark:bg-gray-800/30"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">{project.project}</h4>
                            <Badge
                              variant="outline"
                              className={`mt-1 text-xs ${
                                project.status === "Completed"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                                  : project.status === "On Track"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                              }`}
                            >
                              {project.status}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-emerald-600">
                              {project.overall}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Overall Score
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <TreePine className="h-3 w-3 text-emerald-600" />
                              <span className="text-sm">Environmental</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress
                                value={project.environmental}
                                className="h-1.5 w-16"
                              />
                              <span className="text-sm font-medium w-8">
                                {project.environmental}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Users className="h-3 w-3 text-blue-600" />
                              <span className="text-sm">Social</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress
                                value={project.social}
                                className="h-1.5 w-16"
                              />
                              <span className="text-sm font-medium w-8">
                                {project.social}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Globe className="h-3 w-3 text-purple-600" />
                              <span className="text-sm">Governance</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress
                                value={project.governance}
                                className="h-1.5 w-16"
                              />
                              <span className="text-sm font-medium w-8">
                                {project.governance}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card> */}
          </div>

          {/* ESG Summary Cards */}
          {/*<div className="grid grid-cols-1 md:grid-cols-3 gap-6"> */}
          {/* Environmental Card */}
          {/*<Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
                      <TreePine className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-emerald-700 dark:text-emerald-300">
                        Environmental
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Carbon & Resource Impact
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-600">
                      {esgDetailedBreakdown.environmental.totalScore}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-emerald-600">
                      <TrendingUp className="h-3 w-3" />
                      +5.2%
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Progress
                  value={esgDetailedBreakdown.environmental.totalScore}
                  className="h-2 mb-3"
                />
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      Best: Crimson Bridge
                    </span>
                    <span className="font-medium">94</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      Needs Focus: Ember Hotel
                    </span>
                    <span className="font-medium">78</span>
                  </div>
                </div>
              </CardContent>
            </Card> */}

          {/* Social Card */}
          {/*<Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/40">
                      <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-blue-700 dark:text-blue-300">
                        Social
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Community & Workers
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {esgDetailedBreakdown.social.totalScore}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-blue-600">
                      <TrendingUp className="h-3 w-3" />
                      +2.8%
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Progress
                  value={esgDetailedBreakdown.social.totalScore}
                  className="h-2 mb-3"
                />
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      Best: Crimson Bridge
                    </span>
                    <span className="font-medium">89</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      Needs Focus: Ember Hotel
                    </span>
                    <span className="font-medium">74</span>
                  </div>
                </div>
              </CardContent>
            </Card> */}

          {/* Governance Card */}
          {/* <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/40">
                      <Globe className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-purple-700 dark:text-purple-300">
                        Governance
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Ethics & Compliance
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">
                      {esgDetailedBreakdown.governance.totalScore}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-purple-600">
                      <TrendingUp className="h-3 w-3" />
                      +1.4%
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Progress
                  value={esgDetailedBreakdown.governance.totalScore}
                  className="h-2 mb-3"
                />
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      Best: Crimson Bridge
                    </span>
                    <span className="font-medium">96</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      Needs Focus: Ember Hotel
                    </span>
                    <span className="font-medium">85</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div> */}

          {/* ESG Detailed Breakdown Tabs */}
          {/*<Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
            <CardHeader>
              <CardTitle className="text-emerald-700 dark:text-emerald-300">
                ESG Detailed Analysis
              </CardTitle>
              <CardDescription>
                Comprehensive breakdown of ESG metrics and performance
                indicators
              </CardDescription>
            </CardHeader>
            <CardContent> 
              <Tabs defaultValue="environmental" className="w-full"> 
                {/* <TabsList className="grid w-full grid-cols-3 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50">
                  <TabsTrigger
                    value="environmental"
                    className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700"
                  >
                    Environmental
                  </TabsTrigger>
                  <TabsTrigger
                    value="social"
                    className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
                  >
                    Social
                  </TabsTrigger>
                  <TabsTrigger
                    value="governance"
                    className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
                  >
                    Governance
                  </TabsTrigger>
                </TabsList> */}

          {/*<TabsContent value="environmental" className="space-y-4 mt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-emerald-700 dark:text-emerald-300">
                        Key Metrics
                      </h4>
                      <div className="space-y-3">
                        {selectedMetrics.map((metric, index) => (
                          <div
                            key={index}
                            className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-sm">
                                {metric.name}
                              </span>
                              <div className="flex items-center gap-2">
                                {metric.trend === "up" ? (
                                  <TrendingUp className="h-3 w-3 text-emerald-600" />
                                ) : (
                                  <TrendingDown className="h-3 w-3 text-gray-500" />
                                )}
                                <span className="text-sm font-bold">
                                  {metric.score}
                                </span>
                              </div>
                            </div>
                            <Progress
                              value={metric.score}
                              className="h-1.5 mb-1"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Current: {metric.score}</span>
                              <span>Target: {metric.target}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      {selectedProjectName && (
                        <button
                          className="mt-4 px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                          onClick={() => setSelectedProjectName(null)}
                        >
                          Reset to All Projects
                        </button>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 text-emerald-700 dark:text-emerald-300">
                        Project Rankings
                      </h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={[...esgDetailedBreakdown.environmental.projects].sort((a, b) => b.score - a.score)}
                          onClick={(state) => {
                            if (state && state.activeLabel) {
                              setSelectedProjectName(state.activeLabel);
                            }
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            fontSize={10}
                          />
                          <YAxis />
                          <Tooltip />
                          <Bar
                            dataKey="score"
                            fill="#10b981"
                            radius={[4, 4, 0, 0]}
                            cursor="pointer"
                            onClick={(_, idx) => {
                              const sorted = [...esgDetailedBreakdown.environmental.projects].sort((a, b) => b.score - a.score);
                              setSelectedProjectName(sorted[idx].name);
                            }}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                      {selectedProjectName && (
                        <div className="mt-2 text-xs text-emerald-700 dark:text-emerald-300">
                          Showing metrics for: <span className="font-semibold">{selectedProjectName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="social" className="space-y-4 mt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-blue-700 dark:text-blue-300">
                        Key Metrics
                      </h4>
                      <div className="space-y-3">
                        {esgDetailedBreakdown.social.metrics.map(
                          (metric, index) => (
                            <div
                              key={index}
                              className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium text-sm">
                                  {metric.name}
                                </span>
                                <div className="flex items-center gap-2">
                                  {metric.trend === "up" ? (
                                    <TrendingUp className="h-3 w-3 text-blue-600" />
                                  ) : (
                                    <TrendingDown className="h-3 w-3 text-gray-500" />
                                  )}
                                  <span className="text-sm font-bold">
                                    {metric.score}
                                  </span>
                                </div>
                              </div>
                              <Progress
                                value={metric.score}
                                className="h-1.5 mb-1"
                              />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Current: {metric.score}</span>
                                <span>Target: {metric.target}</span>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 text-blue-700 dark:text-blue-300">
                        Project Rankings
                      </h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={esgDetailedBreakdown.social.projects.sort(
                            (a, b) => b.score - a.score
                          )}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            fontSize={10}
                          />
                          <YAxis />
                          <Tooltip />
                          <Bar
                            dataKey="score"
                            fill="#3b82f6"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="governance" className="space-y-4 mt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-purple-700 dark:text-purple-300">
                        Key Metrics
                      </h4>
                      <div className="space-y-3">
                        {esgDetailedBreakdown.governance.metrics.map(
                          (metric, index) => (
                            <div
                              key={index}
                              className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium text-sm">
                                  {metric.name}
                                </span>
                                <div className="flex items-center gap-2">
                                  {metric.trend === "up" ? (
                                    <TrendingUp className="h-3 w-3 text-purple-600" />
                                  ) : (
                                    <TrendingDown className="h-3 w-3 text-gray-500" />
                                  )}
                                  <span className="text-sm font-bold">
                                    {metric.score}
                                  </span>
                                </div>
                              </div>
                              <Progress
                                value={metric.score}
                                className="h-1.5 mb-1"
                              />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Current: {metric.score}</span>
                                <span>Target: {metric.target}</span>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 text-purple-700 dark:text-purple-300">
                        Project Rankings
                      </h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={esgDetailedBreakdown.governance.projects.sort(
                            (a, b) => b.score - a.score
                          )}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            fontSize={10}
                          />
                          <YAxis />
                          <Tooltip />
                          <Bar
                            dataKey="score"
                            fill="#8b5cf6"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card> */}

          {/* Emissions Trends */}
          {/*<Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
            <CardHeader>
              <CardTitle className="text-emerald-700 dark:text-emerald-300">
                Emissions Over Time
              </CardTitle>
              <CardDescription>
                {emissionsView.charAt(0).toUpperCase() + emissionsView.slice(1)} breakdown by emission scopes
              </CardDescription>
              <div className="mt-4 flex gap-2 flex-wrap">
                {['daily', 'weekly', 'monthly', 'yearly', 'custom'].map((view) => (
                  <button
                    key={view}
                    className={`px-3 py-1 rounded-lg text-sm font-medium border transition-colors ${emissionsView === view ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-emerald-700 dark:text-emerald-300'}`}
                    onClick={() => setEmissionsView(view as typeof emissionsView)}
                  >
                    {view.charAt(0).toUpperCase() + view.slice(1)}
                  </button>
                ))}
              </div>
              {emissionsView === 'custom' && (
                <div className="mt-2 flex gap-2 items-center">
                  <label className="text-sm">From:</label>
                  <input
                    type="date"
                    className="rounded border px-2 py-1"
                    value={customDateRange?.start || ''}
                    onChange={e => setCustomDateRange(r => ({ start: e.target.value, end: r?.end || '' }))}
                  />
                  <label className="text-sm">To:</label>
                  <input
                    type="date"
                    className="rounded border px-2 py-1"
                    value={customDateRange?.end || ''}
                    onChange={e => setCustomDateRange(r => ({ start: r?.start || '', end: e.target.value }))}
                  />
                </div>
              )}
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={(() => {
                  switch (emissionsView) {
                    case 'monthly': return monthlyEmissionsData;
                    case 'weekly': return [];
                    case 'daily': return [];
                    case 'yearly': return [];
                    case 'custom': return [];
                    default: return [];
                  }
                })()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={emissionsView === 'monthly' ? 'month' : emissionsView === 'weekly' ? 'week' : emissionsView === 'yearly' ? 'year' : 'date'} />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="scope1"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    name="Scope 1"
                  />
                  <Area
                    type="monotone"
                    dataKey="scope2"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    name="Scope 2"
                  />
                  <Area
                    type="monotone"
                    dataKey="scope3"
                    stackId="1"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    name="Scope 3"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card> */}

          <div className="grid grid-cols-1 gap-6">
            {/* Project Breakdown */}
            <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
              <CardHeader
                className="flex flex-row items-center justify-between cursor-pointer"
                role="button"
                tabIndex={0}
                onClick={() =>
                  setIsProjectEmissionsOpen(!isProjectEmissionsOpen)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setIsProjectEmissionsOpen(!isProjectEmissionsOpen);
                  }
                }}
              >
                <div>
                  <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                    <Building2 className="h-5 w-5" />
                    Project Emissions Breakdown
                  </CardTitle>
                  <CardDescription>
                    Carbon footprint across all active projects
                  </CardDescription>
                </div>
                <ChevronDown
                  className={`h-5 w-5 text-emerald-700 dark:text-emerald-300 transform transition-transform ${isProjectEmissionsOpen ? "rotate-180" : ""
                    }`}
                />
              </CardHeader>
              {isProjectEmissionsOpen && (
                <CardContent>
                  <div className="space-y-4">
                    {projects.map((project, index) => {
                      const esg = getDummyEsgScores(project);
                      // Placeholder: Replace with real emissions data per project if available
                      // For now, use dummy breakdown logic
                      const scope1 = Math.round(1000 + index * 100);
                      const scope2 = Math.round(800 + index * 80);
                      const scope3 = Math.round(1200 + index * 120);
                      const total = scope1 + scope2 + scope3;
                      const progress =
                        esg.status === "Completed"
                          ? 100
                          : esg.status === "On Track"
                            ? 75
                            : 40;
                      return (
                        <div
                          key={project.id}
                          className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/30 dark:bg-gray-800/30"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-semibold">{project.name}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge
                                  variant="outline"
                                  className={
                                    esg.status === "Completed"
                                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                                      : esg.status === "On Track"
                                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                                        : esg.status === "Delayed"
                                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                                          : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800"
                                  }
                                >
                                  {esg.status}
                                </Badge>
                                <span className="text-xs text-muted-foreground"></span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-emerald-600">
                                {total.toLocaleString()} tCO₂e
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {progress}% Complete
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 mb-2">
                            <div className="text-center">
                              <div className="text-sm font-medium text-emerald-600">
                                {scope1}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Scope 1
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-medium text-blue-600">
                                {scope2}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Scope 2
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-medium text-purple-600">
                                {scope3}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Scope 3
                              </div>
                            </div>
                          </div>

                          <Progress value={progress} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          </div>

          {/* Supplier Engagement */}
          <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
            <CardHeader>
              <CardTitle className="text-emerald-700 dark:text-emerald-300">
                Supplier Engagement
              </CardTitle>
              <CardDescription>
                ESG assessment completion across supplier tiers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-medium">Total Number of Suppliers</h4>
                    <span className="text-sm font-bold text-muted-foreground">
                      {supplierData.total} suppliers total
                    </span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-medium">
                      Suppliers with Complete Details
                    </h4>
                    <span className="text-sm font-bold text-emerald-600">
                      {Math.round(
                        (supplierData.complete / supplierData.total) * 100
                      )}
                      % – {supplierData.complete} of {supplierData.total}{" "}
                      suppliers complete
                    </span>
                  </div>
                  <Progress
                    value={(supplierData.complete / supplierData.total) * 100}
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-medium">
                      Suppliers with Missing/Incomplete Details
                    </h4>
                    <span className="text-sm font-bold text-amber-600">
                      {Math.round(
                        (supplierData.incomplete / supplierData.total) * 100
                      )}
                      % – {supplierData.incomplete} of {supplierData.total}{" "}
                      suppliers incomplete
                    </span>
                  </div>
                  <Progress
                    value={(supplierData.incomplete / supplierData.total) * 100}
                    className="h-2"
                    indicatorClassName="bg-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Background>
  );
}
