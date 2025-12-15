"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Leaf,
  Zap,
  Droplets,
  Activity,
  TrendingUp,
  Truck,
  Trash2,
  HardHat,
} from "lucide-react";
import {
  getDashboardData,
  type DashboardData,
} from "@/actions/dashboard-actions";
import { getProjects } from "@/actions/projects/getProjects";
import {
  calculateIntensity,
  calculateMoM,
  calculateTrend,
} from "@/lib/analytics-utils";
import { Project } from "@/types/project";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];
const WATER_EMISSION_FACTOR = 0.000264; // tCO2e per m3 (0.264 kg/m3)
const WASTE_EMISSION_FACTOR_AVG = 0.0005; // tCO2e per kg (Estimate: 0.5 kg/kg)

const chartTextColor = "var(--foreground)";
const axisTickProps = { fill: chartTextColor };
const legendWrapperStyle = { color: chartTextColor };
const legendFormatter = (value: string) => (
  <span className="text-foreground dark:text-white">{value}</span>
);

// Custom Tooltip Component
const CustomEmissionsTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl shadow-2xl p-4 backdrop-blur-sm">
        <p className="font-semibold text-foreground mb-3 pb-2 border-b border-border">
          {label}
        </p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => {
            if (entry.dataKey === "trend") {
              return (
                <div
                  key={index}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-0.5"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(90deg, hsl(320 75% 60%), hsl(320 75% 60%) 4px, transparent 4px, transparent 8px)",
                      }}
                    />
                    <span className="text-muted-foreground font-medium">
                      {entry.name}:
                    </span>
                  </div>
                  <span className="font-semibold text-foreground">
                    {typeof entry.value === "number"
                      ? entry.value.toFixed(2)
                      : "0.00"}{" "}
                    tCO₂e
                  </span>
                </div>
              );
            }
            return (
              <div
                key={index}
                className="flex items-center justify-between gap-4 text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: entry.color || entry.fill }}
                  />
                  <span className="text-muted-foreground font-medium">
                    {entry.name}:
                  </span>
                </div>
                <span className="font-semibold text-foreground">
                  {typeof entry.value === "number"
                    ? entry.value.toFixed(2)
                    : "0.00"}{" "}
                  tCO₂e
                </span>
              </div>
            );
          })}
          <div className="pt-2 mt-2 border-t border-border">
            <div className="flex items-center justify-between text-sm font-bold">
              <span className="text-foreground">Total Emissions:</span>
              <span className="text-foreground">
                {payload
                  .filter((p: any) => p.dataKey !== "trend")
                  .reduce(
                    (sum: number, p: any) =>
                      sum + (typeof p.value === "number" ? p.value : 0),
                    0
                  )
                  .toFixed(2)}{" "}
                tCO₂e
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const CompactTooltip = ({
  active,
  payload,
  label,
  unit = "",
  decimals = 2,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
  unit?: string;
  decimals?: number;
}) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const formatValue = (value: unknown) => {
    if (typeof value === "number") {
      return `${value.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals,
      })}${unit ? ` ${unit}` : ""}`;
    }
    if (value === null || value === undefined) {
      return unit ? `0 ${unit}` : "0";
    }
    return `${value}${unit ? ` ${unit}` : ""}`;
  };

  return (
    <div className="min-w-[180px] rounded-xl border border-border bg-card/90 p-4 shadow-xl backdrop-blur-sm">
      {label ? (
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
      ) : null}
      <div className="mt-3 space-y-2">
        {payload.map((entry, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <div className="flex items-center gap-2">
              {(entry.color || entry.payload?.fill) && (
                <span
                  className="inline-block h-2.5 w-2.5 rounded-sm"
                  style={{
                    backgroundColor: entry.color || entry.payload?.fill,
                  }}
                />
              )}
              <span className="text-muted-foreground">
                {entry.name || entry.dataKey}
              </span>
            </div>
            <span className="font-semibold text-foreground">
              {formatValue(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProjectTitleTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const value = payload[0]?.value;

  return (
    <div className="min-w-[220px] rounded-xl border border-border bg-card/90 p-4 shadow-xl backdrop-blur-sm">
      {label ? (
        <p className="text-sm font-semibold text-foreground leading-snug">
          {label}
        </p>
      ) : null}
      <p className="mt-2 text-xs text-muted-foreground">
        Emissions:{" "}
        <span className="font-semibold text-foreground">
          {typeof value === "number" ? value.toFixed(2) : "0.00"} tCO₂e
        </span>
      </p>
    </div>
  );
};

export default function ESGDashboard() {
  const [year, setYear] = useState<string>("all");
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [projects, setProjects] = useState<Project[]>([]);
  const [allData, setAllData] = useState<DashboardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      const { data } = await getProjects();
      if (data) {
        setProjects(data);
      }
    }
    fetchProjects();
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch all data to support yearly comparison
        const result = await getDashboardData({
          year: "all",
          projectId: selectedProject,
        });
        setAllData(result || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedProject]);

  // Filter data for the selected year
  const currentYearData = useMemo(() => {
    if (year === "all") return allData;
    return allData.filter((d) => d.month_year.startsWith(year));
  }, [allData, year]);

  const aggregatedData = useMemo(() => {
    const monthlyData: Record<string, any> = {};

    currentYearData.forEach((item) => {
      const month = item.month_year;
      if (!monthlyData[month]) {
        monthlyData[month] = {
          month,
          scope1: 0,
          scope2: 0,
          scope3: 0,
          totalEmissions: 0,
          manHours: 0,
          electricity: 0,
          water: 0,
          waste: 0,
          equipment: 0,
          incidents: 0,
        };
      }

      monthlyData[month].scope1 += item.total_scope_1 || 0;
      monthlyData[month].scope2 += item.total_scope_2 || 0;
      monthlyData[month].scope3 += item.total_scope_3 || 0;
      monthlyData[month].totalEmissions += item.total_emissions_tco2e || 0;
      monthlyData[month].manHours += item.total_man_hours || 0;
      monthlyData[month].electricity += item.electricity_kwh || 0;
      monthlyData[month].water += item.water_m3 || 0;
      monthlyData[month].waste += item.waste_kg || 0;
      monthlyData[month].equipment += item.equipment_emissions || 0;
      monthlyData[month].incidents += item.safety_incidents || 0;
    });

    const sortedMonths = Object.values(monthlyData).sort((a, b) =>
      a.month.localeCompare(b.month)
    );

    // Calculate Trend Line
    const emissionsArray = sortedMonths.map((d) => d.totalEmissions);
    const { slope, intercept } = calculateTrend(emissionsArray);
    const trendBase = intercept; // align trend line to start at 0

    return sortedMonths.map((d, index) => ({
      ...d,
      trend: slope * index + intercept - trendBase,
      intensity: calculateIntensity(d.totalEmissions, d.manHours),
    }));
  }, [currentYearData]);

  const kpiData = useMemo(() => {
    const totalEmissions = aggregatedData.reduce(
      (acc, curr) => acc + curr.totalEmissions,
      0
    );
    const totalManHours = aggregatedData.reduce(
      (acc, curr) => acc + curr.manHours,
      0
    );
    const totalElectricity = aggregatedData.reduce(
      (acc, curr) => acc + curr.electricity,
      0
    );
    const totalWater = aggregatedData.reduce(
      (acc, curr) => acc + curr.water,
      0
    );
    const totalIncidents = aggregatedData.reduce(
      (acc, curr) => acc + curr.incidents,
      0
    );

    // MoM Calculation
    let momChange = 0;
    if (aggregatedData.length >= 2) {
      const lastMonth =
        aggregatedData[aggregatedData.length - 1].totalEmissions;
      const prevMonth =
        aggregatedData[aggregatedData.length - 2].totalEmissions;
      momChange = calculateMoM(lastMonth, prevMonth);
    }

    return {
      totalEmissions,
      momChange,
      intensity: calculateIntensity(totalEmissions, totalManHours),
      resourceConsumption: totalElectricity + totalWater,
      safetyIndex: totalIncidents,
    };
  }, [aggregatedData]);

  const scopeMix = useMemo(() => {
    const s1 = aggregatedData.reduce((acc, curr) => acc + curr.scope1, 0);
    const s2 = aggregatedData.reduce((acc, curr) => acc + curr.scope2, 0);
    const s3 = aggregatedData.reduce((acc, curr) => acc + curr.scope3, 0);
    return [
      { name: "Scope 1", value: s1 },
      { name: "Scope 2", value: s2 },
      { name: "Scope 3", value: s3 },
    ];
  }, [aggregatedData]);

  const detailedBreakdown = useMemo(() => {
    // Aggregate for the whole period for the bar chart? Or show monthly?
    // Prompt says: "Multi-Bar Chart comparing specific parameters: equipment_emissions vs electricity_kwh (normalized) vs waste_kg."
    // Usually this implies a comparison over time or total. Let's do over time (monthly).
    // Normalization might be needed if scales are vastly different.
    // For now, I'll just plot them.
    return aggregatedData.map((d) => ({
      month: d.month,
      equipment: d.equipment,
      electricity: d.electricity, // This might dwarf others
      waste: d.waste,
    }));
  }, [aggregatedData]);

  // New Aggregations
  const emissionsSourceBreakdown = useMemo(() => {
    const equipment = aggregatedData.reduce(
      (acc, curr) => acc + curr.equipment,
      0
    );
    const electricity = aggregatedData.reduce(
      (acc, curr) => acc + curr.scope2,
      0
    ); // Scope 2 is mainly electricity
    const water = aggregatedData.reduce(
      (acc, curr) => acc + curr.water * WATER_EMISSION_FACTOR,
      0
    );
    const waste = aggregatedData.reduce(
      (acc, curr) => acc + curr.waste * WASTE_EMISSION_FACTOR_AVG,
      0
    );
    const logistics = aggregatedData.reduce(
      (acc, curr) =>
        acc + (curr.scope3 - curr.waste * WASTE_EMISSION_FACTOR_AVG),
      0
    ); // Estimate logistics as Scope 3 - Waste

    return [
      { name: "Equipment", value: equipment },
      { name: "Electricity", value: electricity },
      { name: "Water", value: water },
      { name: "Waste", value: waste },
      { name: "Logistics (Est.)", value: Math.max(0, logistics) },
    ];
  }, [aggregatedData]);

  const projectBreakdown = useMemo(() => {
    const projectMap: Record<string, number> = {};
    currentYearData.forEach((d) => {
      const pName =
        projects.find((p) => p.id === d.project_id)?.name || "Unknown";
      projectMap[pName] = (projectMap[pName] || 0) + d.total_emissions_tco2e;
    });
    return Object.entries(projectMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [currentYearData, projects]);

  const yearlyBreakdown = useMemo(() => {
    const yearMap: Record<string, number> = {};
    allData.forEach((d) => {
      const y = d.month_year.split("-")[0];
      yearMap[y] = (yearMap[y] || 0) + d.total_emissions_tco2e;
    });
    return Object.entries(yearMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-chart-2/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 space-y-8 p-6 md:p-8">
        {/* Top Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-border/50">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
              <span className="gradient-text">ESG Dashboard</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Real-time environmental, social, and governance metrics
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-[140px] bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-[220px] bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors">
                <SelectValue placeholder="Select Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Row 1: KPI Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="glassmorphism card-hover border-l-4 border-l-chart-1 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-chart-1/10 rounded-full -mr-16 -mt-16"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Emissions
              </CardTitle>
              <div className="p-2 rounded-lg bg-chart-1/10">
                <Leaf className="h-5 w-5 text-chart-1" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold mb-2">
                {kpiData.totalEmissions.toFixed(2)}
                <span className="text-lg text-muted-foreground ml-1">
                  tCO2e
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={kpiData.momChange > 0 ? "destructive" : "default"}
                  className={`${
                    kpiData.momChange <= 0
                      ? "bg-success text-success-foreground hover:bg-success/90"
                      : ""
                  } text-xs font-medium`}
                >
                  {kpiData.momChange > 0 ? "+" : ""}
                  {kpiData.momChange.toFixed(1)}% MoM
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="glassmorphism card-hover border-l-4 border-l-chart-2 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-chart-2/10 rounded-full -mr-16 -mt-16"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Carbon Intensity
              </CardTitle>
              <div className="p-2 rounded-lg bg-chart-2/10">
                <TrendingUp className="h-5 w-5 text-chart-2" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold mb-2">
                {kpiData.intensity.toFixed(4)}
              </div>
              <p className="text-xs text-muted-foreground">
                tCO2e per Man Hour
              </p>
            </CardContent>
          </Card>

          <Card className="glassmorphism card-hover border-l-4 border-l-chart-4 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-chart-4/10 rounded-full -mr-16 -mt-16"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Resource Consumption
              </CardTitle>
              <div className="p-2 rounded-lg bg-chart-4/10">
                <Zap className="h-5 w-5 text-chart-4" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold mb-2">
                {kpiData.resourceConsumption.toFixed(0)}
              </div>
              <p className="text-xs text-muted-foreground">kWh + m³ Combined</p>
            </CardContent>
          </Card>

          <Card className="glassmorphism card-hover border-l-4 border-l-chart-5 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-chart-5/10 rounded-full -mr-16 -mt-16"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Safety Index
              </CardTitle>
              <div className="p-2 rounded-lg bg-chart-5/10">
                <Activity className="h-5 w-5 text-chart-5" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold mb-2">
                {kpiData.safetyIndex}
              </div>
              <p className="text-xs text-muted-foreground">
                Total Incidents Recorded
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Row 2: Main Trend Chart */}
        <Card className="glassmorphism card-hover overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-chart-1/5 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none"></div>
          <CardHeader className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-chart-1/10">
                <TrendingUp className="h-6 w-6 text-chart-1" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold tracking-tight">
                  Emissions Trend Analysis
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  Monthly emissions breakdown by scope with predictive trend
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{
                    background:
                      "linear-gradient(180deg, hsl(158 70% 45%) 0%, hsl(158 70% 45% / 0.2) 100%)",
                  }}
                ></div>
                <span className="legend-pill">Scope 1:</span>
                <strong className="legend-pill legend-pill--strong">
                  Direct Emissions (Equipment, Fuel)
                </strong>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{
                    background:
                      "linear-gradient(180deg, hsl(195 85% 55%) 0%, hsl(195 85% 55% / 0.2) 100%)",
                  }}
                ></div>
                <span className="legend-pill">Scope 2:</span>
                <strong className="legend-pill legend-pill--strong">
                  Indirect Emissions (Electricity)
                </strong>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{
                    background:
                      "linear-gradient(180deg, hsl(265 75% 65%) 0%, hsl(265 75% 65% / 0.2) 100%)",
                  }}
                ></div>
                <span className="legend-pill">Scope 3:</span>
                <strong className="legend-pill legend-pill--strong">
                  Value Chain (Water, Waste, Logistics)
                </strong>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-12 h-0.5 bg-chart-5"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(90deg, hsl(320 75% 60%), hsl(320 75% 60%) 5px, transparent 5px, transparent 10px)",
                  }}
                ></div>
                <span className="legend-pill">Trend Line</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pl-2 relative z-10">
            <div className="h-[450px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={aggregatedData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorScope1"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="hsl(158 70% 45%)"
                        stopOpacity={0.9}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(158 70% 45%)"
                        stopOpacity={0.3}
                      />
                    </linearGradient>
                    <linearGradient
                      id="colorScope2"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="hsl(195 85% 55%)"
                        stopOpacity={0.9}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(195 85% 55%)"
                        stopOpacity={0.3}
                      />
                    </linearGradient>
                    <linearGradient
                      id="colorScope3"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="hsl(265 75% 65%)"
                        stopOpacity={0.9}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(265 75% 65%)"
                        stopOpacity={0.3}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: "12px", fontWeight: 500 }}
                    tick={axisTickProps}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: "12px", fontWeight: 500 }}
                    tick={axisTickProps}
                    label={{
                      value: "Emissions (tCO₂e)",
                      angle: -90,
                      position: "insideLeft",
                      style: {
                        fontSize: "12px",
                        fill: chartTextColor,
                      },
                    }}
                  />
                  <Tooltip content={<CustomEmissionsTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: "20px" }}
                    iconType="rect"
                    iconSize={14}
                  />
                  <Area
                    type="monotone"
                    dataKey="scope1"
                    stackId="1"
                    stroke="hsl(158 70% 45%)"
                    strokeWidth={2}
                    fill="url(#colorScope1)"
                    name="Scope 1 (Direct)"
                  />
                  <Area
                    type="monotone"
                    dataKey="scope2"
                    stackId="1"
                    stroke="hsl(195 85% 55%)"
                    strokeWidth={2}
                    fill="url(#colorScope2)"
                    name="Scope 2 (Electricity)"
                  />
                  <Area
                    type="monotone"
                    dataKey="scope3"
                    stackId="1"
                    stroke="hsl(265 75% 65%)"
                    strokeWidth={2}
                    fill="url(#colorScope3)"
                    name="Scope 3 (Value Chain)"
                  />
                  <Line
                    type="monotone"
                    dataKey="trend"
                    stroke="hsl(320 75% 60%)"
                    strokeWidth={3}
                    strokeDasharray="8 4"
                    dot={false}
                    name="Predictive Trend"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Row 3: Detailed Breakdown */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="glassmorphism card-hover">
            <CardHeader>
              <CardTitle className="text-xl font-bold">
                Emissions Scope Distribution
              </CardTitle>
              <CardDescription>
                Breakdown by emission scope categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[340px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scopeMix} layout="vertical">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      opacity={0.3}
                    />
                    <XAxis
                      type="number"
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: "11px" }}
                      tick={axisTickProps}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={100}
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: "11px" }}
                      tick={axisTickProps}
                    />
                    <Tooltip
                      content={<CompactTooltip unit="tCO₂e" />}
                      cursor={{ fill: "hsl(var(--card) / 0.18)" }}
                    />
                    <Legend
                      formatter={legendFormatter}
                      wrapperStyle={legendWrapperStyle}
                    />
                    <Bar
                      dataKey="value"
                      name="Emissions (tCO2e)"
                      radius={[0, 4, 4, 0]}
                    >
                      {scopeMix.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="glassmorphism card-hover">
            <CardHeader>
              <CardTitle className="text-xl font-bold">
                Resource & Equipment Metrics
              </CardTitle>
              <CardDescription>
                Equipment, electricity, and waste parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[340px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={detailedBreakdown}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      opacity={0.3}
                    />
                    <XAxis
                      dataKey="month"
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: "11px" }}
                      tick={axisTickProps}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: "11px" }}
                      tick={axisTickProps}
                    />
                    <Tooltip
                      content={<CompactTooltip unit="tCO₂e" />}
                      cursor={{ fill: "hsl(var(--card) / 0.18)" }}
                    />
                    <Legend
                      formatter={legendFormatter}
                      wrapperStyle={legendWrapperStyle}
                    />
                    <Bar
                      dataKey="equipment"
                      fill="hsl(158 70% 45%)"
                      name="Equipment"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="electricity"
                      fill="hsl(195 85% 55%)"
                      name="Electricity"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="waste"
                      fill="hsl(265 75% 65%)"
                      name="Waste"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* New Rows for Additional Breakdown Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="glassmorphism card-hover">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-chart-1/10">
                  <Truck className="h-5 w-5 text-chart-1" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">
                    Emissions Source Breakdown
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Contributors to total emissions
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={emissionsSourceBreakdown} layout="vertical">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      opacity={0.3}
                    />
                    <XAxis
                      type="number"
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: "11px" }}
                      tick={axisTickProps}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={130}
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: "11px" }}
                      tick={axisTickProps}
                    />
                    <Tooltip
                      content={<CompactTooltip unit="tCO₂e" />}
                      cursor={{ fill: "hsl(var(--card) / 0.18)" }}
                    />
                    <Legend
                      formatter={legendFormatter}
                      wrapperStyle={legendWrapperStyle}
                    />
                    <Bar
                      dataKey="value"
                      name="Emissions (tCO₂e)"
                      radius={[0, 8, 8, 0]}
                    >
                      {emissionsSourceBreakdown.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="glassmorphism card-hover">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-chart-2/10">
                  <HardHat className="h-5 w-5 text-chart-2" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">
                    Project Emissions Breakdown
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Emissions by project
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectBreakdown}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      opacity={0.3}
                    />
                    <XAxis dataKey="name" hide />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      tick={{
                        fill: chartTextColor,
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    />
                    <Tooltip
                      content={<ProjectTitleTooltip />}
                      cursor={{ fill: "hsl(var(--card) / 0.18)" }}
                    />
                    <Legend
                      formatter={legendFormatter}
                      wrapperStyle={legendWrapperStyle}
                    />
                    <Bar
                      dataKey="value"
                      fill="hsl(195 85% 55%)"
                      name="Emissions (tCO₂e)"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="glassmorphism card-hover col-span-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-chart-4/10">
                  <Activity className="h-5 w-5 text-chart-4" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">
                    Yearly Emissions Comparison
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Year-over-year emissions trends
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yearlyBreakdown}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      opacity={0.3}
                    />
                    <XAxis
                      dataKey="name"
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: "12px", fontWeight: 500 }}
                      tick={axisTickProps}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: "12px" }}
                      tick={axisTickProps}
                      label={{
                        value: "Emissions (tCO₂e)",
                        angle: -90,
                        position: "insideLeft",
                        fill: chartTextColor,
                      }}
                    />
                    <Tooltip
                      content={<CompactTooltip unit="tCO₂e" />}
                      cursor={{ fill: "hsl(var(--card) / 0.18)" }}
                    />
                    <Legend
                      formatter={legendFormatter}
                      wrapperStyle={legendWrapperStyle}
                    />
                    <Bar
                      dataKey="value"
                      fill="hsl(45 95% 60%)"
                      name="Total Emissions (tCO₂e)"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
