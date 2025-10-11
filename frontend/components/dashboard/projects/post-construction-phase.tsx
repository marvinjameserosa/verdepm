"use client";

import { useState } from "react";
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
  Users,
} from "lucide-react";

// Sample data for charts
const esgGoalsData = [
  { category: "Environmental", target: 85, achieved: 92, status: "exceeded" },
  { category: "Social", target: 80, achieved: 78, status: "near" },
  { category: "Governance", target: 90, achieved: 95, status: "exceeded" },
];

const carbonFootprintData = [
  { phase: "Pre-Construction", planned: 150, actual: 145 },
  { phase: "Construction", planned: 2800, actual: 2650 },
  { phase: "Materials", planned: 1200, actual: 1100 },
  { phase: "Transportation", planned: 400, actual: 380 },
];

const wasteDisposalData = [
  { type: "Recycled", value: 65, color: "#10b981" },
  { type: "Reused", value: 20, color: "#3b82f6" },
  { type: "Landfill", value: 10, color: "#f59e0b" },
  { type: "Incinerated", value: 5, color: "#ef4444" },
];

const complianceScores = [
  { metric: "Air Quality", score: 95, benchmark: 85 },
  { metric: "Water Management", score: 88, benchmark: 80 },
  { metric: "Noise Control", score: 92, benchmark: 85 },
  { metric: "Waste Management", score: 94, benchmark: 90 },
  { metric: "Energy Efficiency", score: 89, benchmark: 85 },
];

const monthlyProgress = [
  { month: "Jan", carbon: 280, waste: 45, energy: 180 },
  { month: "Feb", carbon: 275, waste: 42, energy: 175 },
  { month: "Mar", carbon: 265, waste: 38, energy: 170 },
  { month: "Apr", carbon: 260, waste: 35, energy: 165 },
  { month: "May", carbon: 250, waste: 32, energy: 160 },
  { month: "Jun", carbon: 245, waste: 30, energy: 155 },
];

const certifications = [
  { name: "LEED Platinum", status: "Achieved", date: "2024-10-01" },
  { name: "BREEAM Excellent", status: "Achieved", date: "2024-09-28" },
  { name: "ISO 14001", status: "In Progress", date: "2024-11-15" },
  { name: "WELL Building Standard", status: "Achieved", date: "2024-10-10" },
];

const documentationItems = [
  {
    name: "GRI Sustainability Report 2024",
    type: "PDF Report",
    size: "2.4 MB",
    status: "Complete",
    description: "Comprehensive ESG performance report following GRI standards",
  },
  {
    name: "LEED Certification Package",
    type: "Documentation",
    size: "8.7 MB",
    status: "Complete",
    description:
      "Complete LEED Platinum certification documents and scorecards",
  },
  {
    name: "Lessons Learned Summary",
    type: "Analysis Report",
    size: "1.2 MB",
    status: "Complete",
    description: "Key insights and recommendations for future projects",
  },
  {
    name: "Stakeholder Presentation",
    type: "Presentation",
    size: "15.3 MB",
    status: "Complete",
    description:
      "Executive summary presentation for stakeholders and investors",
  },
];

export default function PostConstructionPhase() {
  const [selectedTab, setSelectedTab] = useState("overview");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "exceeded":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "near":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      Achieved:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400",
      "In Progress":
        "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      Complete:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400",
    };
    return colors[status as keyof typeof colors] || colors["Complete"];
  };

  return (
    <div className="space-y-6">
      {/* Header Overview */}
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
                Final evaluation of ESG performance and project outcomes
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tab Navigation */}
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

      {/* Overview Tab */}
      {selectedTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ESG Goals Achievement */}
          <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                <Target className="h-5 w-5" />
                ESG Goals Achievement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {esgGoalsData.map((goal, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{goal.category}</span>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(goal.status)}
                        <span className="text-sm font-medium">
                          {goal.achieved}% / {goal.target}%
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Progress
                        value={goal.target}
                        className="flex-1 h-2 bg-gray-200"
                      />
                      <Progress
                        value={goal.achieved}
                        className="flex-1 h-2"
                        style={{
                          backgroundColor:
                            goal.achieved >= goal.target
                              ? "#10b981"
                              : "#f59e0b",
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Target: {goal.target}%</span>
                      <span>Achieved: {goal.achieved}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Key Performance Indicators */}
          <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                <TrendingUp className="h-5 w-5" />
                Key Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                  <TreePine className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-emerald-700">
                    2,650
                  </div>
                  <div className="text-sm text-muted-foreground">
                    tCO₂e Saved
                  </div>
                </div>
                <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <Droplets className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-700">85%</div>
                  <div className="text-sm text-muted-foreground">
                    Water Efficiency
                  </div>
                </div>
                <div className="text-center p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                  <Trash2 className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-amber-700">85%</div>
                  <div className="text-sm text-muted-foreground">
                    Waste Diverted
                  </div>
                </div>
                <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-700">30%</div>
                  <div className="text-sm text-muted-foreground">
                    Energy Reduction
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ESG Metrics Tab */}
      {selectedTab === "metrics" && (
        <div className="space-y-6">
          {/* Carbon Footprint Analysis */}
          <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
            <CardHeader>
              <CardTitle className="text-emerald-700 dark:text-emerald-300">
                Final Carbon Footprint Analysis
              </CardTitle>
              <CardDescription>
                Comparison between planned vs. actual carbon emissions across
                project phases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={carbonFootprintData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="phase" />
                  <YAxis />
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
                    Carbon Reduction Achieved: 275 tCO₂e (9.4% below target)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Waste Management Summary */}
          <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
            <CardHeader>
              <CardTitle className="text-emerald-700 dark:text-emerald-300">
                Waste Disposal Summary
              </CardTitle>
              <CardDescription>
                Final waste management performance and disposal methods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={wasteDisposalData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ type, value }) => `${type}: ${value}%`}
                    >
                      {wasteDisposalData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  <h4 className="font-semibold">Waste Stream Analysis</h4>
                  {wasteDisposalData.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium">{item.type}</span>
                      </div>
                      <span className="text-lg font-bold">{item.value}%</span>
                    </div>
                  ))}
                  <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <div className="text-sm text-emerald-700 dark:text-emerald-300">
                      <strong>Total Waste Diverted from Landfill:</strong> 85%
                      (645 tons)
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Progress Trends */}
          <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
            <CardHeader>
              <CardTitle className="text-emerald-700 dark:text-emerald-300">
                Monthly Performance Trends
              </CardTitle>
              <CardDescription>
                Environmental performance improvements over the construction
                period
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
                    name="Carbon (tCO₂e/month)"
                  />
                  <Line
                    type="monotone"
                    dataKey="waste"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Waste (tons/month)"
                  />
                  <Line
                    type="monotone"
                    dataKey="energy"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="Energy (MWh/month)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Compliance Tab */}
      {selectedTab === "compliance" && (
        <div className="space-y-6">
          {/* Environmental Compliance Scores */}
          <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
            <CardHeader>
              <CardTitle className="text-emerald-700 dark:text-emerald-300">
                Environmental Compliance Score
              </CardTitle>
              <CardDescription>
                Final compliance assessment across all environmental regulations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceScores.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.metric}</span>
                      <div className="flex items-center gap-2">
                        {item.score >= item.benchmark ? (
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        )}
                        <span className="font-bold text-lg">{item.score}%</span>
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
                        Requirement
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-700 mb-1">
                    91.6%
                  </div>
                  <div className="text-sm text-emerald-600">
                    Overall Compliance Score
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
            <CardHeader>
              <CardTitle className="text-emerald-700 dark:text-emerald-300">
                Certifications Achieved
              </CardTitle>
              <CardDescription>
                Third-party certifications and recognition received
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certifications.map((cert, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Award className="h-6 w-6 text-emerald-600" />
                        <div>
                          <div className="font-semibold">{cert.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {cert.date}
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={getStatusBadge(cert.status)}
                      >
                        {cert.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Post-Audit Remarks */}
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
                  <li>• Exceeded carbon reduction targets by 9.4%</li>
                  <li>• Achieved LEED Platinum certification</li>
                  <li>• Innovative waste management reduced landfill by 85%</li>
                  <li>• Strong stakeholder engagement throughout project</li>
                </ul>
              </div>
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border-l-4 border-amber-500">
                <h4 className="font-semibold text-amber-700 dark:text-amber-300 mb-2">
                  Areas for Improvement
                </h4>
                <ul className="text-sm space-y-1">
                  <li>
                    • Social impact metrics slightly below target (78% vs 80%)
                  </li>
                  <li>
                    • Water efficiency could be improved in future projects
                  </li>
                  <li>
                    • Earlier supplier engagement recommended for better
                    outcomes
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
