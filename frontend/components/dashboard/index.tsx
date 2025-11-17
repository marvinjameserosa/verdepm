"use client";

import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/utils/supabase/client";
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

import { Tabs, TabsContent} from "@/components/ui/tabs";
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

  const hash = project.name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return {
    environmental: 75 + (hash % 20),
    social: 70 + (hash % 25),
    governance: 80 + (hash % 15),
    overall: Math.round((75 + (hash % 20) + 70 + (hash % 25) + 80 + (hash % 15)) / 3 * 10) / 10,
    status: project.status === 'completed' ? 'Completed' : (project.status === 'in-progress' ? 'On Track' : 'Delayed'),
  };
}
type EmissionsScopeDatum = {
  name: string;
  value: number;
  percentage: number;
};

type ConstructionDailyLogRecord = {
  project_id: string | null;
  fuel_consumption_liters: number | null;
  equipment_usage_hours: number | null;
  electricity_usage_kwh: number | null;
  water_consumption_cubic_m: number | null;
  todays_waste_generated_kg: number | null;
};

type AggregatedMetricTotals = {
  entries: number;
  fuelConsumptionLiters: number;
  equipmentUsageHours: number;
  electricityUsageKwh: number;
  waterConsumptionCubicM: number;
  wasteGeneratedKg: number;
};

const createMetricTotals = (): AggregatedMetricTotals => ({
  entries: 0,
  fuelConsumptionLiters: 0,
  equipmentUsageHours: 0,
  electricityUsageKwh: 0,
  waterConsumptionCubicM: 0,
  wasteGeneratedKg: 0,
});

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
        { name: "Carbon Footprint Reduction", score: 89, target: 95, trend: "up" },
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
        { name: "Training & Development", score: 85, target: 90, trend: "stable" },
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
        { name: "Transparency & Reporting", score: 93, target: 90, trend: "up" },
        { name: "Stakeholder Engagement", score: 88, target: 90, trend: "stable" },
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
  const [isEmissionsBreakdownOpen, setIsEmissionsBreakdownOpen] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [emissionsView, setEmissionsView] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'>('monthly');
  const [customDateRange, setCustomDateRange] = useState<{ start: string; end: string } | null>(null);
  const [emissionsScopeData, setEmissionsScopeData] = useState<EmissionsScopeDatum[]>(DEFAULT_SCOPE_DATA);
  const totalEmissions = React.useMemo(
    () => emissionsScopeData.reduce((sum, scope) => sum + scope.value, 0),
    [emissionsScopeData]
  );
  const [totalElectricityUsage, setTotalElectricityUsage] = useState(0);
  const [totalWaterConsumption, setTotalWaterConsumption] = useState(0);
  const [totalWasteGeneratedKg, setTotalWasteGeneratedKg] = useState(0);
  const [metricTotalsByProject, setMetricTotalsByProject] = useState<Record<string, AggregatedMetricTotals>>({});
  const [overallMetricTotals, setOverallMetricTotals] = useState<AggregatedMetricTotals>(() => createMetricTotals());


  // Fetch projects from Supabase
  useEffect(() => {
    async function fetchProjects() {
      const { data, error } = await supabase
        .from("projects")
        .select(
          "id, owner_id, name, slug, description, status, priority, category, project_manager, client_name, location, budget, start_date, end_date, created_at, updated_at"
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
      const { data, error } = await supabase
        .from("construction_daily_log")
        .select(
          "project_id, fuel_consumption_liters, equipment_usage_hours, electricity_usage_kwh, water_consumption_cubic_m, todays_waste_generated_kg"
        );

      if (!isMounted) {
        return;
      }

      if (error || !data) {
        setEmissionsScopeData(DEFAULT_SCOPE_DATA);
        setTotalElectricityUsage(0);
        setTotalWaterConsumption(0);
        setTotalWasteGeneratedKg(0);
        setMetricTotalsByProject({});
        setOverallMetricTotals(createMetricTotals());
        return;
      }

      const logs = data as ConstructionDailyLogRecord[];
      const toNumber = (value: number | null) =>
        typeof value === "number" && Number.isFinite(value) ? value : 0;

      let scope1 = 0;
      let scope2 = 0;
      let aggregatedWater = 0;
      let aggregatedWasteKg = 0;
      const totalsByProject: Record<string, AggregatedMetricTotals> = {};
      const overallTotals = createMetricTotals();

      const PH_GRID_EMISSION_FACTOR = 0.76; 
      const WATER_EMISSION_FACTOR = 0.264; // kg CO2e per m3
      // Aggregate per-project metrics to drive the ESG detailed key metrics view.
      for (const log of logs) {
        const fuel = toNumber(log.fuel_consumption_liters);
        const equipment = toNumber(log.equipment_usage_hours);
        const electricity = toNumber(log.electricity_usage_kwh);
        const water = toNumber(log.water_consumption_cubic_m);
        const wasteKg = toNumber(log.todays_waste_generated_kg);

        scope1 += fuel + equipment;
        scope2 += electricity;
        
        aggregatedWater += water;
        aggregatedWasteKg += wasteKg;

        overallTotals.entries += 1;
        overallTotals.fuelConsumptionLiters += fuel;
        overallTotals.equipmentUsageHours += equipment;
        overallTotals.electricityUsageKwh += electricity;
        overallTotals.waterConsumptionCubicM += water;
        overallTotals.wasteGeneratedKg += wasteKg;

        const projectId = typeof log.project_id === "string" ? log.project_id : null;
        if (projectId) {
          const projectTotals = totalsByProject[projectId] ?? createMetricTotals();
          projectTotals.entries += 1;
          projectTotals.fuelConsumptionLiters += fuel;
          projectTotals.equipmentUsageHours += equipment;
          projectTotals.electricityUsageKwh += electricity;
          projectTotals.waterConsumptionCubicM += water;
          projectTotals.wasteGeneratedKg += wasteKg;
          totalsByProject[projectId] = projectTotals;
        }
      }


      const scope2_tco2e = scope2 * PH_GRID_EMISSION_FACTOR / 1000; 
      const scope3_water_tco2e = aggregatedWater * WATER_EMISSION_FACTOR / 1000; 
      const scope3_total_tco2e = scope3_water_tco2e + aggregatedWasteKg / 1000; 
      const total = scope1 + scope2_tco2e + scope3_total_tco2e;
      const percentage = (value: number) =>
        total > 0 ? Number(((value / total) * 100).toFixed(1)) : 0;

      setEmissionsScopeData([
        { name: "Scope 1", value: scope1, percentage: percentage(scope1) },
        { name: "Scope 2", value: scope2_tco2e, percentage: percentage(scope2_tco2e) },
        { name: "Scope 3", value: scope3_total_tco2e, percentage: percentage(scope3_total_tco2e) },
      ]);
      setTotalElectricityUsage(scope2);
      setTotalWaterConsumption(aggregatedWater);
      setTotalWasteGeneratedKg(aggregatedWasteKg);
      setMetricTotalsByProject(totalsByProject);
      setOverallMetricTotals(overallTotals);
    };

    fetchEmissions();

    return () => {
      isMounted = false;
    };
  }, []);


  const esgDetailedBreakdown = getEsgDetailedBreakdown(projects);

  const formatEnergyUsage = (value: number) => {
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
  const [selectedProjectName, setSelectedProjectName] = useState<string | null>(null);
  const projectLookupByName = useMemo(() => {
    const lookup = new Map<string, Project>();
    projects.forEach((project) => {
      lookup.set(project.name, project);
    });
    return lookup;
  }, [projects]);

  const selectedProject = selectedProjectName
    ? projectLookupByName.get(selectedProjectName) ?? null
    : null;

  const emptyTotals = useMemo(() => createMetricTotals(), []);
  const selectedProjectTotals = selectedProject
    ? metricTotalsByProject[selectedProject.id]
    : undefined;

  const metricsTotalsForDisplay = selectedProjectName
    ? selectedProject
      ? selectedProjectTotals ?? emptyTotals
      : emptyTotals
    : overallMetricTotals;

  const hasSelectedProjectMetrics = Boolean(
    selectedProjectTotals && selectedProjectTotals.entries > 0
  );

  const metricsEntryCount = metricsTotalsForDisplay.entries;

  const metricNumberFormatter = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
      }),
    []
  );

  const keyMetrics = useMemo(
    () => [
      {
        key: "fuel-consumption",
        label: "Fuel Consumption",
        value: metricNumberFormatter.format(
          metricsTotalsForDisplay.fuelConsumptionLiters
        ),
        unit: "L",
      },
      {
        key: "equipment-usage",
        label: "Equipment Usage",
        value: metricNumberFormatter.format(
          metricsTotalsForDisplay.equipmentUsageHours
        ),
        unit: "hrs",
      },
      {
        key: "electricity-usage",
        label: "Electricity Usage",
        value: metricNumberFormatter.format(
          metricsTotalsForDisplay.electricityUsageKwh
        ),
        unit: "kWh",
      },
      {
        key: "waste-generated",
        label: "Waste Generated",
        value: metricNumberFormatter.format(
          metricsTotalsForDisplay.wasteGeneratedKg
        ),
        unit: "kg",
      },
      {
        key: "water-supply",
        label: "Water Supply Formula",
        value: metricNumberFormatter.format(
          metricsTotalsForDisplay.waterConsumptionCubicM
        ),
        unit: "m^3",
      },
    ],
    [metricNumberFormatter, metricsTotalsForDisplay]
  );

  const selectionStatusMessage = useMemo(() => {
    if (!selectedProjectName) {
      return metricsEntryCount > 0
        ? `Aggregated across ${metricsEntryCount} daily log${
            metricsEntryCount === 1 ? "" : "s"
          }.`
        : "No daily log data available yet.";
    }

    if (!selectedProject) {
      return `Project "${selectedProjectName}" is not available in Supabase records.`;
    }

    if (!hasSelectedProjectMetrics) {
      return `No daily logs recorded yet for ${selectedProjectName}.`;
    }

    return `Aggregated from ${metricsEntryCount} daily log${
      metricsEntryCount === 1 ? "" : "s"
    } for ${selectedProjectName}.`;
  }, [
    selectedProjectName,
    selectedProject,
    hasSelectedProjectMetrics,
    metricsEntryCount,
  ]);

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
                  {(totalEmissions / 1000).toFixed(1)}k
                </div>
                <p className="text-xs text-muted-foreground">tCO₂e this year</p>
                <div className="flex items-center mt-2">
                  {/*<TrendingDown className="h-3 w-3 text-emerald-500 mr-1" />
                  <span className="text-xs text-emerald-600">
                    -12.3% vs last year
                  </span> */}
                </div>
              </CardContent>
            </Card>

            {/* Energy Consumption */}
            <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Energy Usage
                  </CardTitle>
                  <Zap className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700">
                  {formatEnergyUsage(totalElectricityUsage)}
                </div>
                <p className="text-xs text-muted-foreground">kWh consumed</p>
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
                    Water Consumption
                  </CardTitle>
                  <Droplets className="h-4 w-4 text-cyan-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-cyan-700">
                  {formatWaterVolume(totalWaterConsumption)}
                </div>
                <p className="text-xs text-muted-foreground">m³ this month</p>
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
                    Waste Generated
                  </CardTitle>
                  <Trash2 className="h-4 w-4 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-700">
                  {formatWasteKilograms(totalWasteGeneratedKg)}
                </div>
                <p className="text-xs text-muted-foreground">kg this month</p>
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
                  className={`h-5 w-5 text-emerald-700 dark:text-emerald-300 transform transition-transform ${
                    isEmissionsBreakdownOpen ? "rotate-180" : ""
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
                      <Tooltip formatter={(value) => [`${value} tCO₂e`, ""]} />
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
          <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
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

                <TabsContent value="environmental" className="space-y-4 mt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-emerald-700 dark:text-emerald-300">
                        Key Metrics
                      </h4>
                      <div className="space-y-3">
                        {keyMetrics.map((metric) => (
                          <div
                            key={metric.key}
                            className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-sm">
                                {metric.label}
                              </span>
                              <span className="text-sm font-bold text-emerald-700 dark:text-emerald-200">
                                {metric.value}
                                <span className="ml-1 text-[0.65rem] uppercase tracking-wide text-muted-foreground">
                                  {metric.unit}
                                </span>
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground">
                        {selectionStatusMessage}
                      </p>
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
                          {selectedProject ? (
                            hasSelectedProjectMetrics ? (
                              <span>
                                Showing metrics for: <span className="font-semibold">{selectedProjectName}</span>
                              </span>
                            ) : (
                              <span>
                                No daily logs recorded yet for <span className="font-semibold">{selectedProjectName}</span>.
                              </span>
                            )
                          ) : (
                            <span>
                              Project <span className="font-semibold">{selectedProjectName}</span> is not available in Supabase records.
                            </span>
                          )}
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
          </Card>

          {/* Emissions Trends */}
          <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
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
          </Card>

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
                  className={`h-5 w-5 text-emerald-700 dark:text-emerald-300 transform transition-transform ${
                    isProjectEmissionsOpen ? "rotate-180" : ""
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
                      const scope1 = Math.round(1000 + (index * 100));
                      const scope2 = Math.round(800 + (index * 80));
                      const scope3 = Math.round(1200 + (index * 120));
                      const total = scope1 + scope2 + scope3;
                      const progress = esg.status === 'Completed' ? 100 : esg.status === 'On Track' ? 75 : 40;
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
                                <span className="text-xs text-muted-foreground">
                                </span>
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
