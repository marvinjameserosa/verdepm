"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Download,
  BarChart3,
  Edit3,
  Save,
  Eye,
  Share2,
  Copy,
  TreePine,
  Users,
  Award,
  Loader2,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  Video as VideoIcon,
  Music as MusicIcon,
} from "lucide-react";
import { Background } from "@/components/ui/background";
import { LucideIcon } from "lucide-react";
import { StorageService } from "@/lib/storage";
import type { FileListResponse, StorageBucket } from "@/types/storage";
import type { SupabaseClient } from "@supabase/supabase-js";

// Report data interfaces
interface ESGData {
  environmental: { score: number; target: number; status: string };
  social: { score: number; target: number; status: string };
  governance: { score: number; target: number; status: string };
  carbonFootprint: number;
  wasteRecycled: number;
  energyEfficiency: number;
}

interface CarbonData {
  totalEmissions: number;
  reductionTarget: number;
  reductionAchieved: number;
  scopes: {
    scope1: number;
    scope2: number;
    scope3: number;
  };
}

interface ComplianceData {
  certifications: number;
  totalCertifications: number;
  complianceRate: number;
}

interface StakeholderData {
  communityPrograms: number;
  localJobs: number;
  stakeholderSatisfaction: number;
}

// Report template interface
interface ReportTemplate {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  data: Record<string, unknown>;
}

type ProjectIdValidationState = {
  status: "idle" | "checking" | "valid" | "invalid";
  message?: string;
};

type ProjectMetrics = {
  projectName: string;
  totalFuelUsed: number;
  totalElectricityConsumption: number;
  averageSafetyTrir: number | null;
  materialDeliveries: number;
};

type DailyLogRow = {
  equipment_fuel_consumed?: number | string | null;
  number_of_incidents?: number | string | null;
};

type MonthlyLogRow = {
  electricity_consumption?: number | string | null;
};

type MaterialRow = {
  id: string;
  name?: string | null;
  supplier?: string | null;
  cost?: number | string | null;
};

const normalizeNumericValue = (value: unknown): number => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const formatMetric = (
  value: number,
  options?: Intl.NumberFormatOptions
): string => {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
    ...options,
  }).format(value);
};

// Documentation items from post-construction phase

const certifications = [
  { name: "LEED Platinum", status: "Achieved", date: "2024-10-01" },
  { name: "BREEAM Excellent", status: "Achieved", date: "2024-09-28" },
  { name: "ISO 14001", status: "In Progress", date: "2024-11-15" },
  { name: "WELL Building Standard", status: "Achieved", date: "2024-10-10" },
];

const reportTemplates = [
  {
    id: "esg-summary",
    title: "ESG Performance Summary Report",
    description:
      "Comprehensive overview of Environmental, Social, and Governance metrics",
    icon: TreePine,
    color: "emerald",
    data: {
      environmental: { score: 92, target: 85, status: "exceeded" },
      social: { score: 78, target: 80, status: "near" },
      governance: { score: 95, target: 90, status: "exceeded" },
      carbonFootprint: 2650,
      wasteRecycled: 65,
      energyEfficiency: 87,
    },
  },
  {
    id: "carbon-footprint",
    title: "Carbon Footprint Analysis",
    description: "Detailed breakdown of carbon emissions across project phases",
    icon: BarChart3,
    color: "blue",
    data: {
      totalEmissions: 2650,
      reductionTarget: 2800,
      reductionAchieved: 5.4,
      scopes: {
        scope1: 840,
        scope2: 650,
        scope3: 1160,
      },
    },
  },
  {
    id: "compliance-report",
    title: "Compliance & Certifications",
    description:
      "Status of regulatory compliance and certification achievements",
    icon: Award,
    color: "purple",
    data: {
      certifications: certifications.filter((c) => c.status === "Achieved")
        .length,
      totalCertifications: certifications.length,
      complianceRate: 95,
    },
  },
  {
    id: "stakeholder-summary",
    title: "Stakeholder Impact Report",
    description: "Community engagement and social impact assessment",
    icon: Users,
    color: "amber",
    data: {
      communityPrograms: 8,
      localJobs: 145,
      stakeholderSatisfaction: 88,
    },
  },
];

export default function ReportsTab() {
  const [selectedReport, setSelectedReport] = useState<ReportTemplate | null>(
    null
  );
  const [reportContent, setReportContent] = useState("");
  const [reportTitle, setReportTitle] = useState("");
  const [isGeneratingESG, setIsGeneratingESG] = useState(false);
  const [esgGenerationStatus, setEsgGenerationStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
    fileName?: string;
  }>({ type: null, message: "" });
  const [projectIdValidation, setProjectIdValidation] =
    useState<ProjectIdValidationState>({ status: "idle" });
  const [projectMetrics, setProjectMetrics] =
    useState<ProjectMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [availableProjects, setAvailableProjects] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [generatedReports, setGeneratedReports] = useState<
    Array<{
      name: string;
      type: string;
      size: string;
      status: string;
      description: string;
      fileName?: string;
      generatedAt?: string;
    }>
  >([]);

  // State for actual project files
  const [projectFiles, setProjectFiles] = useState<{
    preconstruction: FileListResponse[];
    construction: FileListResponse[];
    esgReports: FileListResponse[];
  }>({
    preconstruction: [],
    construction: [],
    esgReports: [],
  });
  const [filesLoading, setFilesLoading] = useState(true);
  const [filesError, setFilesError] = useState<string | null>(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [debugInfo, setDebugInfo] = useState<{
    lastFetchTime?: string;
    bucketValidation?: { exists: string[]; missing: string[] };
    authStatus?: string;
  }>({});
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(
    new Set()
  );

  const loadProjects = useCallback(async () => {
    setProjectsLoading(true);
    setProjectsError(null);

    try {
      const { supabase } = await import("@/lib/supabase/client");
      const { data, error } = await supabase
        .from("projects")
        .select("project_id, project_name")
        .order("project_name", { ascending: true });

      if (error) throw error;

      const mappedProjects: Array<{ id: string; name: string }> = ((data ?? []) as Array<{
        project_id: string;
        project_name: string | null;
      }>).map((project) => ({
        id: project.project_id,
        name: project.project_name ?? project.project_id,
      }));

      setAvailableProjects(mappedProjects);
      let resetMetrics = false;

      setSelectedProjectId((current) => {
        if (mappedProjects.length === 0) {
          if (current !== "") {
            resetMetrics = true;
          }
          return "";
        }

        if (
          current &&
          !mappedProjects.some((project) => project.id === current)
        ) {
          resetMetrics = true;
          return "";
        }

        return current;
      });

      if (mappedProjects.length === 0) {
        setProjectMetrics(null);
        setMetricsError("No projects available.");
        setProjectIdValidation({
          status: "invalid",
          message: "No projects found. Add a project to continue.",
        });
      } else if (resetMetrics) {
        setProjectMetrics(null);
        setMetricsError("Select a project to continue.");
        setProjectIdValidation({
          status: "invalid",
          message: "Select a project to continue.",
        });
      } else {
        setProjectIdValidation({ status: "idle" });
        setMetricsError(null);
      }
    } catch (error) {
      console.error("Error loading projects:", error);
      setProjectsError("Unable to load projects. Please try again.");
      setProjectIdValidation({
        status: "invalid",
        message: "Unable to load projects. Please try again.",
      });
    } finally {
      setProjectsLoading(false);
    }
  }, []);

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const { supabase } = await import("@/lib/supabase/client");
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      setDebugInfo((prev) => ({
        ...prev,
        authStatus: user
          ? `Authenticated as ${user.email}`
          : "Not authenticated",
      }));

      console.log("Auth check:", { user: user?.email, error });
    };

    checkAuth();
    void loadProjectFiles();
    void loadProjects();
  }, [loadProjects]);

  const loadProjectFiles = async () => {
    setFilesLoading(true);
    setFilesError(null);

    try {
      console.log("Loading project files...");

      // Update debug info
      setDebugInfo((prev) => ({
        ...prev,
        lastFetchTime: new Date().toISOString(),
      }));

      const files = await StorageService.getProjectFiles();
      console.log("Loaded project files:", {
        preconstruction: files.preconstructionDocs?.length || 0,
        construction: files.constructionDocs?.length || 0,
        esgReports: files.esgReports?.length || 0,
      });

      setProjectFiles({
        preconstruction: files.preconstructionDocs || [],
        construction: files.constructionDocs || [],
        esgReports: files.esgReports || [],
      });

      // Check if all buckets returned empty and suggest authentication
      const totalFiles =
        (files.preconstructionDocs?.length || 0) +
        (files.constructionDocs?.length || 0) +
        (files.esgReports?.length || 0);

      if (totalFiles === 0) {
        console.warn(
          "No files found in any bucket - this might be an authentication or permissions issue"
        );
      }
    } catch (error) {
      console.error("Error loading project files:", error);
      let errorMessage =
        error instanceof Error ? error.message : "Failed to load project files";

      // Provide more helpful error messages
      if (errorMessage.includes("JWT") || errorMessage.includes("auth")) {
        errorMessage =
          "Authentication required to access project files. Please log in.";
      } else if (
        errorMessage.includes("permission") ||
        errorMessage.includes("policy")
      ) {
        errorMessage = "Permission denied. Please check your access rights.";
      }

      setFilesError(errorMessage);
    } finally {
      setFilesLoading(false);
    }
  };

  const handleFileDownload = async (
    bucket: StorageBucket,
    fileName: string
  ) => {
    const fileKey = `${bucket}-${fileName}`;
    setDownloadingFiles((prev) => new Set(prev).add(fileKey));

    try {
      const url = await StorageService.getDownloadUrl(bucket, fileName);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error downloading file:", error);
      alert(
        "Failed to download file. Please check if you have permission to access this file."
      );
    } finally {
      setDownloadingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fileKey);
        return newSet;
      });
    }
  };

  const handleGeneratedReportDownload = async (fileName: string) => {
    const fileKey = `esg-reports-${fileName}`;
    setDownloadingFiles((prev) => new Set(prev).add(fileKey));

    try {
      console.log("Downloading generated report:", fileName);

      // For generated ESG reports, they're stored in the 'esg-reports' bucket
      const url = await StorageService.getDownloadUrl("esg-reports", fileName);

      // Create a temporary link element to trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.target = "_blank"; // Fallback to opening in new tab if download fails
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log("Download initiated successfully");

      // Show a success message briefly (optional - you can remove if too intrusive)
      // setTimeout(() => {
      //   alert('Download started successfully!');
      // }, 500);
    } catch (error) {
      console.error("Error downloading generated report:", error);

      // Provide more specific error messages
      let errorMessage = "Failed to download generated report.";
      if (error instanceof Error) {
        if (
          error.message.includes("not found") ||
          error.message.includes("404")
        ) {
          errorMessage =
            "Report file not found. It may have been moved or deleted.";
        } else if (
          error.message.includes("permission") ||
          error.message.includes("403")
        ) {
          errorMessage = "Permission denied. Please check your access rights.";
        } else if (
          error.message.includes("network") ||
          error.message.includes("fetch")
        ) {
          errorMessage =
            "Network error. Please check your connection and try again.";
        }
      }

      alert(errorMessage);
    } finally {
      setDownloadingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fileKey);
        return newSet;
      });
    }
  };

  const handleExportToPDF = () => {
    // Convert markdown content to PDF (simplified version)
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${reportTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            h1 { color: #059669; border-bottom: 2px solid #059669; }
            h2 { color: #047857; margin-top: 30px; }
            h3 { color: #065f46; }
            pre { background: #f3f4f6; padding: 10px; border-radius: 4px; }
            strong { font-weight: bold; }
          </style>
        </head>
        <body>
          <pre>${reportContent}</pre>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(reportContent);
      alert("Report content copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = reportContent;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      alert("Report content copied to clipboard!");
    }
  };

  const handleShareViaEmail = () => {
    const subject = encodeURIComponent(reportTitle);
    const body = encodeURIComponent(
      `Please find the attached report:\n\n${reportTitle}\n\nGenerated on: ${new Date().toLocaleDateString()}\n\n---\n\n${reportContent}`
    );
    const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
  };

  const gatherProjectMetrics = async (
    supabaseClient: SupabaseClient,
    projectId: string,
    projectName: string | null
  ): Promise<ProjectMetrics> => {
    const [dailyLogsResponse, monthlyLogsResponse, materialResponse] =
      await Promise.all([
        supabaseClient
          .from("daily_logs")
          .select("equipment_fuel_consumed, number_of_incidents")
          .eq("project_id", projectId),
        supabaseClient
          .from("monthly_logs")
          .select("electricity_consumption")
          .eq("project_id", projectId),
        supabaseClient
          .from("material")
          .select("id")
          .eq("project_id", projectId),
      ]);

    if (dailyLogsResponse.error) throw dailyLogsResponse.error;
    if (monthlyLogsResponse.error) throw monthlyLogsResponse.error;
    if (materialResponse.error) throw materialResponse.error;

    const dailyLogs = (dailyLogsResponse.data || []) as DailyLogRow[];
    const monthlyLogs = (monthlyLogsResponse.data || []) as MonthlyLogRow[];
    const materialRecords = (materialResponse.data || []) as MaterialRow[];

    const totalFuelUsed = dailyLogs.reduce((sum, log) => {
      return sum + normalizeNumericValue(log.equipment_fuel_consumed);
    }, 0);

    const incidentValues = dailyLogs
      .map((log) => {
        if (
          log.number_of_incidents === null ||
          log.number_of_incidents === undefined
        ) {
          return null;
        }
        return normalizeNumericValue(log.number_of_incidents);
      })
      .filter((value): value is number => value !== null);

    const averageSafetyTrir =
      incidentValues.length > 0
        ? incidentValues.reduce((acc, value) => acc + value, 0) /
          incidentValues.length
        : null;

    const totalElectricityConsumption = monthlyLogs.reduce((sum, log) => {
      return sum + normalizeNumericValue(log.electricity_consumption);
    }, 0);

    const materialDeliveries = materialRecords.length;

    return {
      projectName: projectName || projectId,
      totalFuelUsed,
      totalElectricityConsumption,
      averageSafetyTrir,
      materialDeliveries,
    };
  };

  const loadProjectMetrics = async (
    projectId: string
  ): Promise<ProjectMetrics | null> => {
    const trimmedId = projectId.trim();

    if (!trimmedId) {
      setProjectMetrics(null);
      setMetricsError("Select a project to continue.");
      setProjectIdValidation({
        status: "invalid",
        message: "Select a project to continue.",
      });
      return null;
    }

    setProjectIdValidation({
      status: "checking",
      message: "Loading project metrics...",
    });
    setMetricsLoading(true);
    setMetricsError(null);

    try {
      const { supabase } = await import("@/lib/supabase/client");
      const { data: projectRecord, error: projectError } = await supabase
        .from("projects")
        .select("project_name, project_id")
        .eq("project_id", trimmedId)
        .maybeSingle();

      if (projectError) throw projectError;

      if (!projectRecord) {
        setProjectMetrics(null);
        setMetricsError("Project not found.");
        setProjectIdValidation({
          status: "invalid",
          message: "Project not found. Try another selection.",
        });
        return null;
      }

      const metrics = await gatherProjectMetrics(
        supabase,
        trimmedId,
        projectRecord.project_name ?? null
      );

      setProjectMetrics(metrics);
      setMetricsError(null);
      setProjectIdValidation({
        status: "valid",
        message: `Project ${metrics.projectName} ready for ESG reporting.`,
      });
      return metrics;
    } catch (err) {
      console.error("Project metrics load failed:", err);
      setProjectMetrics(null);
      setMetricsError("Unable to load project metrics at this time.");
      setProjectIdValidation({
        status: "invalid",
        message: "Could not load project metrics. Please try again.",
      });
      return null;
    } finally {
      setMetricsLoading(false);
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "webp":
        return <ImageIcon className="h-5 w-5 text-blue-500" />;
      case "mp4":
      case "avi":
      case "mov":
      case "wmv":
        return <VideoIcon className="h-5 w-5 text-purple-500" />;
      case "mp3":
      case "wav":
      case "flac":
        return <MusicIcon className="h-5 w-5 text-green-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Function to generate report content based on template and dashboard data
  function generateReportContent(
    template: ReportTemplate,
    metrics?: ProjectMetrics | null
  ) {
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    switch (template.id) {
      case "esg-summary": {
        const data = template.data as unknown as ESGData;
        const projectName =
          metrics?.projectName ?? "Verde Tower Construction Project";

        const environmentalLines = [
          `- **Score:** ${data.environmental.score}/100 (Target: ${
            data.environmental.target
          })`,
          `- **Status:** ${data.environmental.status.toUpperCase()}`,
          metrics
            ? `- **Fuel Used:** ${formatMetric(metrics.totalFuelUsed)} liters`
            : undefined,
          metrics
            ? `- **Electricity Consumption:** ${formatMetric(
                metrics.totalElectricityConsumption
              )} kWh`
            : undefined,
          `- **Waste Recycling Rate:** ${data.wasteRecycled}%`,
          `- **Energy Efficiency:** ${data.energyEfficiency}%`,
        ]
          .filter(Boolean)
          .join("\n");

        const socialLines = [
          `- **Score:** ${data.social.score}/100 (Target: ${
            data.social.target
          })`,
          `- **Status:** ${data.social.status.toUpperCase()}`,
          `- **Community Programs:** 8 initiatives launched`,
          `- **Local Employment:** 145 jobs created`,
          metrics
            ? `- **Average Safety TRIR:** ${
                metrics.averageSafetyTrir !== null
                  ? formatMetric(metrics.averageSafetyTrir)
                  : "N/A"
              }`
            : `- **Safety Record:** Zero incidents during construction`,
        ]
          .filter(Boolean)
          .join("\n");

        const governanceLines = [
          `- **Score:** ${data.governance.score}/100 (Target: ${
            data.governance.target
          })`,
          `- **Status:** ${data.governance.status.toUpperCase()}`,
          `- **Certifications Achieved:** 4 out of 4 planned`,
          `- **Compliance Rate:** 100%`,
          `- **Stakeholder Engagement:** 25 sessions conducted`,
          metrics
            ? `- **Material Deliveries:** ${formatMetric(
                metrics.materialDeliveries,
                { maximumFractionDigits: 0 }
              )}`
            : undefined,
        ]
          .filter(Boolean)
          .join("\n");

        return `# ESG Performance Summary Report

**Project:** ${projectName}
**Generated:** ${currentDate}
**Period:** January 2024 - October 2024

## Executive Summary

This comprehensive ESG performance report provides an overview of ${projectName}'s Environmental, Social, and Governance achievements during the post-construction phase.

## Environmental Performance
${environmentalLines}

## Social Impact
${socialLines}

## Governance Excellence
${governanceLines}

## Recommendations
1. Continue monitoring environmental metrics quarterly
2. Expand community engagement programs
3. Maintain governance excellence standards
4. Prepare for annual ESG audit

---
*Report generated from live dashboard data*`;
      }

      case "carbon-footprint": {
        const data = template.data as unknown as CarbonData;
        return `# Carbon Footprint Analysis Report

**Project:** Verde Tower Construction Project
**Generated:** ${currentDate}
**Analysis Period:** Full Project Lifecycle

## Carbon Emissions Overview

**Total Project Emissions:** ${data.totalEmissions} tCO2e
**Original Target:** ${data.reductionTarget} tCO2e
**Reduction Achieved:** ${data.reductionAchieved}%

## Emissions by Scope
- **Scope 1 (Direct):** ${data.scopes.scope1} tCO2e
- **Scope 2 (Electricity):** ${data.scopes.scope2} tCO2e
- **Scope 3 (Indirect):** ${data.scopes.scope3} tCO2e

## Carbon Reduction Strategies Implemented
1. **Energy Efficient Systems:** 15% reduction in electricity consumption
2. **Sustainable Materials:** 30% recycled content in construction
3. **Transportation Optimization:** Local supplier preference (60% local)
4. **Waste Management:** 65% waste recycling rate achieved

## Future Carbon Neutrality Plan
- **Phase 1:** Carbon offset purchases (2025)
- **Phase 2:** Renewable energy installation (2026)
- **Phase 3:** Full carbon neutrality achievement (2027)

---
*Analysis based on verified emissions data and third-party calculations*`;
      }

      case "compliance-report": {
        const data = template.data as unknown as ComplianceData;
        return `# Compliance & Certifications Report

**Project:** Verde Tower Construction Project
**Generated:** ${currentDate}
**Reporting Period:** January 2024 - October 2024

## Certification Status

**Achieved Certifications (${data.certifications}/${data.totalCertifications}):**
- LEED Platinum (October 1, 2024)
- BREEAM Excellent (September 28, 2024)
- WELL Building Standard (October 10, 2024)

**In Progress:**
- ISO 14001 Environmental Management (Expected: November 15, 2024)

## Regulatory Compliance
**Overall Compliance Rate:** ${data.complianceRate}%

### Environmental Regulations
- [PASS] Air Quality Standards: Fully compliant
- [PASS] Water Discharge Permits: All requirements met
- [PASS] Waste Management: Properly documented and disposed

### Building Codes & Safety
- [PASS] Fire Safety Standards: Exceeded requirements
- [PASS] Structural Engineering: Third-party verified
- [PASS] Accessibility Standards: ADA compliant

### Labor & Social Compliance
- [PASS] Fair Labor Standards: All contractors verified
- [PASS] Safety Protocols: Zero incident record
- [PASS] Community Impact: All mitigation measures implemented

## Risk Assessment
- **High Priority:** None identified
- **Medium Priority:** 2 items under monitoring
- **Low Priority:** 3 items scheduled for routine review

---
*All compliance data verified by independent auditors*`;
      }

      case "stakeholder-summary": {
        const data = template.data as unknown as StakeholderData;
        return `# Stakeholder Impact Report

**Project:** Verde Tower Construction Project
**Generated:** ${currentDate}
**Stakeholder Engagement Period:** Project Lifecycle

## Community Engagement Overview

**Programs Implemented:** ${data.communityPrograms}
**Local Jobs Created:** ${data.localJobs}
**Stakeholder Satisfaction:** ${data.stakeholderSatisfaction}%

## Key Stakeholder Groups

### Local Community
- **Engagement Sessions:** 15 public meetings conducted
- **Feedback Incorporation:** 78% of suggestions implemented
- **Community Benefits:** $2.1M invested in local infrastructure

### Regulatory Bodies
- **Permits Obtained:** 12/12 required permits
- **Inspections Passed:** 34/34 inspections
- **Compliance Issues:** 0 violations recorded

### Environmental Organizations
- **Partnerships:** 3 NGO collaborations established
- **Environmental Programs:** Tree planting initiative (500 trees)
- **Biodiversity:** Native species habitat preservation

### Investors & Shareholders
- **Quarterly Updates:** 4 comprehensive reports delivered
- **ESG Performance:** Exceeded all baseline targets
- **Financial Performance:** Project delivered on time and budget

## Social Impact Metrics
- **Local Supplier Preference:** 60% of contracts awarded locally
- **Training Programs:** 45 workers completed certification
- **Diversity & Inclusion:** 35% minority contractor participation

## Future Engagement Plan
1. **Ongoing Monitoring:** Quarterly community meetings
2. **Partnership Expansion:** Additional NGO collaborations
3. **Educational Programs:** Sustainability workshops for residents
4. **Performance Reporting:** Annual impact assessments

---
*Report compiled from stakeholder feedback surveys and engagement records*`;
      }

      default:
        return `# ${template.title}

**Generated:** ${currentDate}

This report template is ready for customization. Please add your content here.

## Key Sections
- Introduction
- Data Analysis  
- Findings
- Recommendations
- Conclusion

---
*Report generated from dashboard data*`;
    }
  }

  // Function to generate ESG report via API
  const generateESGReport = async () => {
    if (!selectedProjectId) {
      setProjectIdValidation({
        status: "invalid",
        message: "Select a project before generating a report.",
      });
      setMetricsError("Select a project to continue.");
      return;
    }

    let metrics = projectMetrics;

    if (!metrics || projectIdValidation.status !== "valid") {
      metrics = await loadProjectMetrics(selectedProjectId);
      if (!metrics) {
        return;
      }
    }

    setEsgGenerationStatus({ type: null, message: "" });
    setIsGeneratingESG(true);

    try {
      const response = await fetch("/api/esg/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: selectedProjectId }),
      });

      const text = await response.text();
      console.log("ESG API response status:", response.status);
      console.log("ESG API response text:", text);

      if (!response.ok) {
        let errorMsg = `Failed to generate ESG report: ${response.statusText}`;
        try {
          const errorResult = JSON.parse(text);
          errorMsg = errorResult.error || errorMsg;
        } catch {
          // If parsing fails, use the raw text
          errorMsg = text || errorMsg;
        }
        throw new Error(errorMsg);
      }

      const result = text ? JSON.parse(text) : {};

      if (result.error) throw new Error(result.error);

      const fuelDisplay = formatMetric(metrics.totalFuelUsed);
      const electricityDisplay = formatMetric(
        metrics.totalElectricityConsumption
      );
      const safetyDisplay =
        metrics.averageSafetyTrir !== null
          ? formatMetric(metrics.averageSafetyTrir)
          : "N/A";
      const materialDisplay = formatMetric(metrics.materialDeliveries, {
        maximumFractionDigits: 0,
      });

      const newReport = {
        name: `${metrics.projectName} ESG Report - ${new Date().toLocaleDateString()}`,
        type: "ESG Report",
        size: "2.1 MB",
        status: "Complete",
        description: `Fuel Used: ${fuelDisplay} L • Electricity: ${electricityDisplay} kWh • Average Safety TRIR: ${safetyDisplay} • Material Deliveries: ${materialDisplay}`,
        fileName: result.pdfFileName,
        generatedAt: new Date().toISOString(),
      };

      setGeneratedReports((prev) => [newReport, ...prev]);
      setEsgGenerationStatus({
        type: "success",
        message: `ESG report generated successfully for ${metrics.projectName}!`,
        fileName: result.pdfFileName,
      });
    } catch (error) {
      console.error("Error generating ESG report:", error);
      setEsgGenerationStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to generate ESG report",
      });
    } finally {
      setIsGeneratingESG(false);
    }
  };

  return (
    <Background variant="subtle" className="min-h-screen">
      <div className="relative z-10 p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 rounded-2xl border border-white/20 shadow-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                  Reports & Documentation
                </h1>
                <p className="text-muted-foreground mt-1">
                  Generate comprehensive reports and manage project
                  documentation
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
                <FileText className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="documentation" className="w-full">
            <TabsList className="grid w-full grid-cols-2 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50">
              <TabsTrigger
                value="documentation"
                className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700"
              >
                <FileText className="h-4 w-4 mr-2" />
                Documentation
              </TabsTrigger>
              <TabsTrigger
                value="generate"
                className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate Reports
              </TabsTrigger>
            </TabsList>

            {/* Documentation Tab */}
            <TabsContent value="documentation" className="space-y-6 mt-6">
              <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
                <CardHeader>
                  <CardTitle className="text-emerald-700 dark:text-emerald-300">
                    Project Documentation
                  </CardTitle>
                  <CardDescription>
                    Comprehensive reports, certifications, and stakeholder
                    materials
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Generated Reports Section */}
                  {generatedReports.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                          Generated Reports
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {generatedReports.map((doc, index) => (
                          <div
                            key={`generated-${index}`}
                            className="p-4 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                                  <TreePine className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                  <div className="font-semibold">
                                    {doc.name}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {doc.description}
                                  </div>
                                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                    <span>{doc.type}</span>
                                    <span>{doc.size}</span>
                                    {doc.generatedAt && (
                                      <span>
                                        Generated:{" "}
                                        {new Date(
                                          doc.generatedAt
                                        ).toLocaleString()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge
                                  variant="secondary"
                                  className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400"
                                >
                                  {doc.status}
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className={`rounded-lg border-emerald-300 hover:bg-emerald-50 ${
                                    !doc.fileName
                                      ? "opacity-50 cursor-not-allowed"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    doc.fileName &&
                                    handleGeneratedReportDownload(doc.fileName)
                                  }
                                  disabled={
                                    !doc.fileName ||
                                    downloadingFiles.has(
                                      `esg-reports-${doc.fileName}`
                                    )
                                  }
                                  title={
                                    !doc.fileName
                                      ? "File not available for download"
                                      : "Download generated report"
                                  }
                                >
                                  {downloadingFiles.has(
                                    `esg-reports-${doc.fileName}`
                                  ) ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <Download className="h-4 w-4 mr-2" />
                                  )}
                                  {downloadingFiles.has(
                                    `esg-reports-${doc.fileName}`
                                  )
                                    ? "Downloading..."
                                    : doc.fileName
                                    ? "Download"
                                    : "Preparing..."}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Project Files from Storage */}
                  {filesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                      <span className="ml-2 text-gray-600">
                        Loading project files...
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Pre-construction Documents */}
                      {projectFiles.preconstruction.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-4">
                            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                              Pre-construction Documents (
                              {projectFiles.preconstruction.length})
                            </h3>
                          </div>
                          {projectFiles.preconstruction.map((file, index) => (
                            <div
                              key={`preconstruction-${index}`}
                              className="p-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40">
                                    {getFileIcon(file.name)}
                                  </div>
                                  <div>
                                    <div className="font-semibold">
                                      {file.name}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      Pre-construction phase document
                                    </div>
                                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                      <span>
                                        {file.name
                                          .split(".")
                                          .pop()
                                          ?.toUpperCase() || "FILE"}
                                      </span>
                                      <span>
                                        {formatFileSize(
                                          file.metadata?.size || 0
                                        )}
                                      </span>
                                      <span>
                                        Modified:{" "}
                                        {new Date(
                                          file.updated_at ||
                                            file.created_at ||
                                            Date.now()
                                        ).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Badge
                                    variant="secondary"
                                    className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                  >
                                    Available
                                  </Badge>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="rounded-lg border-blue-300 hover:bg-blue-50"
                                    onClick={() =>
                                      handleFileDownload(
                                        "preconstruction-docs",
                                        file.name
                                      )
                                    }
                                    disabled={downloadingFiles.has(
                                      `preconstruction-docs-${file.name}`
                                    )}
                                  >
                                    {downloadingFiles.has(
                                      `preconstruction-docs-${file.name}`
                                    ) ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                      <Download className="h-4 w-4 mr-2" />
                                    )}
                                    {downloadingFiles.has(
                                      `preconstruction-docs-${file.name}`
                                    )
                                      ? "Downloading..."
                                      : "Download"}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Construction Documents */}
                      {projectFiles.construction.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-4">
                            <FileText className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                            <h3 className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                              Construction Documents (
                              {projectFiles.construction.length})
                            </h3>
                          </div>
                          {projectFiles.construction.map((file, index) => (
                            <div
                              key={`construction-${index}`}
                              className="p-4 rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/10 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/40">
                                    {getFileIcon(file.name)}
                                  </div>
                                  <div>
                                    <div className="font-semibold">
                                      {file.name}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      Construction phase document
                                    </div>
                                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                      <span>
                                        {file.name
                                          .split(".")
                                          .pop()
                                          ?.toUpperCase() || "FILE"}
                                      </span>
                                      <span>
                                        {formatFileSize(
                                          file.metadata?.size || 0
                                        )}
                                      </span>
                                      <span>
                                        Modified:{" "}
                                        {new Date(
                                          file.updated_at ||
                                            file.created_at ||
                                            Date.now()
                                        ).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Badge
                                    variant="secondary"
                                    className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
                                  >
                                    Available
                                  </Badge>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="rounded-lg border-orange-300 hover:bg-orange-50"
                                    onClick={() =>
                                      handleFileDownload(
                                        "construction-docs",
                                        file.name
                                      )
                                    }
                                    disabled={downloadingFiles.has(
                                      `construction-docs-${file.name}`
                                    )}
                                  >
                                    {downloadingFiles.has(
                                      `construction-docs-${file.name}`
                                    ) ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                      <Download className="h-4 w-4 mr-2" />
                                    )}
                                    {downloadingFiles.has(
                                      `construction-docs-${file.name}`
                                    )
                                      ? "Downloading..."
                                      : "Download"}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* ESG Reports */}
                      {projectFiles.esgReports.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-4">
                            <TreePine className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                              ESG Reports ({projectFiles.esgReports.length})
                            </h3>
                          </div>
                          {projectFiles.esgReports.map((file, index) => (
                            <div
                              key={`esg-${index}`}
                              className="p-4 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                                    {getFileIcon(file.name)}
                                  </div>
                                  <div>
                                    <div className="font-semibold">
                                      {file.name}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      ESG Environmental Report
                                    </div>
                                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                      <span>
                                        {file.name
                                          .split(".")
                                          .pop()
                                          ?.toUpperCase() || "FILE"}
                                      </span>
                                      <span>
                                        {formatFileSize(
                                          file.metadata?.size || 0
                                        )}
                                      </span>
                                      <span>
                                        Generated:{" "}
                                        {new Date(
                                          file.updated_at ||
                                            file.created_at ||
                                            Date.now()
                                        ).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Badge
                                    variant="secondary"
                                    className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400"
                                  >
                                    Available
                                  </Badge>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="rounded-lg border-emerald-300 hover:bg-emerald-50"
                                    onClick={() =>
                                      handleFileDownload(
                                        "esg-reports",
                                        file.name
                                      )
                                    }
                                    disabled={downloadingFiles.has(
                                      `esg-reports-${file.name}`
                                    )}
                                  >
                                    {downloadingFiles.has(
                                      `esg-reports-${file.name}`
                                    ) ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                      <Download className="h-4 w-4 mr-2" />
                                    )}
                                    {downloadingFiles.has(
                                      `esg-reports-${file.name}`
                                    )
                                      ? "Downloading..."
                                      : "Download"}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Error state */}
                      {filesError && (
                        <div className="text-center py-8 text-red-500">
                          <AlertCircle className="h-12 w-12 mx-auto mb-3 text-red-300" />
                          <h3 className="text-lg font-medium mb-2">
                            Error loading files
                          </h3>
                          <p className="text-sm mb-4">{filesError}</p>
                          <div className="flex gap-2 justify-center">
                            <Button
                              onClick={() => loadProjectFiles()}
                              variant="outline"
                              size="sm"
                            >
                              Try Again
                            </Button>
                            {filesError.includes("Authentication") && (
                              <Button
                                onClick={() =>
                                  (window.location.href = "/login")
                                }
                                variant="default"
                                size="sm"
                              >
                                Login
                              </Button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* No files message */}
                      {!filesError &&
                        projectFiles.preconstruction.length === 0 &&
                        projectFiles.construction.length === 0 &&
                        projectFiles.esgReports.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <h3 className="text-lg font-medium mb-2">
                              No project files found
                            </h3>
                            <p className="text-sm mb-4">
                              Upload documents to the Pre-construction,
                              Construction phases, or generate ESG reports to
                              see them here.
                            </p>
                            <Button
                              onClick={() => loadProjectFiles()}
                              variant="outline"
                              size="sm"
                            >
                              <Loader2 className="h-4 w-4 mr-2" />
                              Refresh Files
                            </Button>
                          </div>
                        )}
                    </div>
                  )}

                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-semibold text-blue-700 dark:text-blue-300">
                          Stakeholder Access
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-400">
                          All documentation has been shared with relevant
                          stakeholders and regulatory bodies.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Debug Panel */}
                  <div className="mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDebugInfo(!showDebugInfo)}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      {showDebugInfo ? "Hide Debug Info" : "Show Debug Info"}
                    </Button>

                    {showDebugInfo && (
                      <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded border text-xs font-mono">
                        <div className="space-y-2">
                          <div>
                            <strong>Last Fetch:</strong>{" "}
                            {debugInfo.lastFetchTime || "Never"}
                          </div>
                          <div>
                            <strong>Loading:</strong>{" "}
                            {filesLoading ? "Yes" : "No"}
                          </div>
                          <div>
                            <strong>Error:</strong> {filesError || "None"}
                          </div>
                          <div>
                            <strong>Auth Status:</strong>{" "}
                            {debugInfo.authStatus || "Checking..."}
                          </div>
                          <div>
                            <strong>File Counts:</strong> Pre:{" "}
                            {projectFiles.preconstruction.length}, Construction:{" "}
                            {projectFiles.construction.length}, ESG:{" "}
                            {projectFiles.esgReports.length}
                          </div>
                          <Button
                            onClick={() => loadProjectFiles()}
                            size="sm"
                            className="mt-2"
                          >
                            Force Refresh
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Generate Reports Tab */}
            <TabsContent value="generate" className="space-y-6 mt-6">
              {/* ESG Report Generation Section */}
              <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                    <TreePine className="h-5 w-5" />
                    ESG Report Generator
                  </CardTitle>
                  <CardDescription>
                    Generate comprehensive ESG Environment Report with AI
                    analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
                        AI-Powered ESG Analysis
                      </div>
                      <div className="text-sm text-muted-foreground mb-3">
                        Generate a comprehensive ESG Environment Report
                        including carbon footprint analysis, compliance metrics,
                        and sustainability insights based on your project data.
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>* Real-time data integration</span>
                        <span>* AI-powered insights</span>
                        <span>* PDF export ready</span>
                      </div>
                      <div className="mt-4 w-full max-w-sm">
                        <label className="text-sm font-medium mb-2 block">
                          Select Project
                        </label>
                        <Select
                          value={selectedProjectId}
                          onValueChange={(value) => {
                            setSelectedProjectId(value);
                            setProjectMetrics(null);
                            setMetricsError(null);
                            void loadProjectMetrics(value);
                          }}
                          disabled={
                            projectsLoading ||
                            isGeneratingESG ||
                            availableProjects.length === 0
                          }
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                projectsLoading
                                  ? "Loading projects..."
                                  : availableProjects.length === 0
                                  ? "No projects available"
                                  : "Choose a project"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {availableProjects.map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                {project.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {projectsError && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                            <AlertCircle className="h-4 w-4" />
                            <span>{projectsError}</span>
                          </div>
                        )}
                        {!projectsLoading &&
                          !projectsError &&
                          availableProjects.length === 0 && (
                            <div className="mt-2 text-sm text-muted-foreground">
                              No projects available yet.
                            </div>
                          )}
                        {projectIdValidation.status !== "idle" && (
                          <div
                            className={`mt-2 flex items-center gap-2 text-sm ${
                              projectIdValidation.status === "valid"
                                ? "text-emerald-600"
                                : projectIdValidation.status === "invalid"
                                ? "text-red-600"
                                : "text-muted-foreground"
                            }`}
                          >
                            {projectIdValidation.status === "checking" && (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            {projectIdValidation.status === "valid" && (
                              <CheckCircle className="h-4 w-4" />
                            )}
                            {projectIdValidation.status === "invalid" && (
                              <AlertCircle className="h-4 w-4" />
                            )}
                            <span>{projectIdValidation.message}</span>
                          </div>
                        )}
                        {metricsLoading && (
                          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Loading project metrics...</span>
                          </div>
                        )}
                        {!metricsLoading && metricsError && (
                          <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
                            <AlertCircle className="h-4 w-4" />
                            <span>{metricsError}</span>
                          </div>
                        )}
                        {projectMetrics && !metricsLoading && !metricsError && (
                          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 text-sm dark:border-emerald-900/40 dark:bg-emerald-900/10">
                            <div className="font-semibold text-emerald-700 dark:text-emerald-300">
                              {projectMetrics.projectName}
                            </div>
                            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                              <div>
                                <div className="text-muted-foreground">Fuel Used</div>
                                <div className="font-medium">
                                  {formatMetric(projectMetrics.totalFuelUsed)} L
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">
                                  Electricity Consumption
                                </div>
                                <div className="font-medium">
                                  {formatMetric(
                                    projectMetrics.totalElectricityConsumption
                                  )} kWh
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">
                                  Average Safety TRIR
                                </div>
                                <div className="font-medium">
                                  {projectMetrics.averageSafetyTrir !== null
                                    ? formatMetric(projectMetrics.averageSafetyTrir)
                                    : "N/A"}
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">
                                  Material Deliveries
                                </div>
                                <div className="font-medium">
                                  {formatMetric(projectMetrics.materialDeliveries, {
                                    maximumFractionDigits: 0,
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <Button
                        onClick={generateESGReport}
                        disabled={
                          isGeneratingESG ||
                          projectIdValidation.status === "checking" ||
                          metricsLoading ||
                          !selectedProjectId
                        }
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-6"
                      >
                        {isGeneratingESG ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating Report...
                          </>
                        ) : (
                          <>
                            <TreePine className="h-4 w-4 mr-2" />
                            Generate ESG Report
                          </>
                        )}
                      </Button>

                      {esgGenerationStatus.type && (
                        <div
                          className={`px-3 py-2 rounded-lg text-sm ${
                            esgGenerationStatus.type === "success"
                              ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                              : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {esgGenerationStatus.type === "success" ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <AlertCircle className="h-4 w-4" />
                            )}
                            <span>{esgGenerationStatus.message}</span>
                          </div>
                          {esgGenerationStatus.type === "error" && (
                            <div className="flex items-center gap-2 mt-2">
                              <Button
                                onClick={generateESGReport}
                                disabled={
                                  isGeneratingESG ||
                                  projectIdValidation.status === "checking" ||
                                  metricsLoading ||
                                  !selectedProjectId
                                }
                                size="sm"
                                variant="outline"
                                className="text-xs h-7 border-red-300 hover:bg-red-50"
                              >
                                Try Again
                              </Button>
                              <span className="text-xs opacity-75">
                                {esgGenerationStatus.message.includes("quota")
                                  ? "Wait a few minutes before retrying"
                                  : "Check your connection and try again"}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Report Templates */}
              {!selectedReport && (
                <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                      <BarChart3 className="h-5 w-5" />
                      Report Templates
                    </CardTitle>
                    <CardDescription>
                      Create comprehensive reports from dashboard data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4">
                      {reportTemplates.map((template) => {
                        const IconComponent = template.icon;
                        return (
                          <div
                            key={template.id}
                            className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                            onClick={() => {
                              setSelectedReport(template);
                              setReportTitle(template.title);
                              setReportContent(
                                generateReportContent(template, projectMetrics)
                              );
                            }}
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <div
                                className={`p-2 rounded-lg bg-${template.color}-100 dark:bg-${template.color}-900/40`}
                              >
                                <IconComponent
                                  className={`h-4 w-4 text-${template.color}-600 dark:text-${template.color}-400`}
                                />
                              </div>
                              <div className="font-semibold">
                                {template.title}
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {template.description}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Document Editor */}
              {selectedReport && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Editor */}
                  <div className="lg:col-span-2 space-y-4">
                    <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Edit3 className="h-5 w-5 text-emerald-600" />
                            <CardTitle className="text-emerald-700 dark:text-emerald-300">
                              Document Editor
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedReport(null)}
                            >
                              Back to Templates
                            </Button>
                            <Button
                              size="sm"
                              className="bg-emerald-500 hover:bg-emerald-600"
                            >
                              <Save className="h-4 w-4 mr-2" />
                              Save Report
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Report Title
                          </label>
                          <Input
                            value={reportTitle}
                            onChange={(e) => setReportTitle(e.target.value)}
                            className="w-full"
                            placeholder="Enter report title..."
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Report Content
                          </label>
                          <Textarea
                            value={reportContent}
                            onChange={(e) => setReportContent(e.target.value)}
                            className="min-h-[400px] w-full font-mono text-sm"
                            placeholder="Report content will be generated here..."
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Preview & Actions */}
                  <div className="space-y-4">
                    <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                          <Eye className="h-4 w-4" />
                          Preview & Export
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={() =>
                            window.open(
                              "data:text/html;charset=utf-8," +
                                encodeURIComponent(`
                            <!DOCTYPE html>
                            <html>
                              <head>
                                <title>${reportTitle}</title>
                                <style>
                                  body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                                  h1 { color: #059669; border-bottom: 2px solid #059669; }
                                  h2 { color: #047857; margin-top: 30px; }
                                  h3 { color: #065f46; }
                                  pre { background: #f3f4f6; padding: 10px; border-radius: 4px; white-space: pre-wrap; }
                                </style>
                              </head>
                              <body><pre>${reportContent}</pre></body>
                            </html>
                          `),
                              "_blank"
                            )
                          }
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview Report
                        </Button>
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={handleExportToPDF}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export as PDF
                        </Button>
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={handleShareViaEmail}
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Share via Email
                        </Button>
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={handleCopyToClipboard}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy to Clipboard
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Report Metadata */}
                    <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
                      <CardHeader>
                        <CardTitle className="text-sm">
                          Report Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Type:</span>
                          <span>{selectedReport?.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Generated:
                          </span>
                          <span>{new Date().toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Words:</span>
                          <span>{reportContent.split(" ").length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Characters:
                          </span>
                          <span>{reportContent.length}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Data Sources */}
                    <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
                      <CardHeader>
                        <CardTitle className="text-sm">Data Sources</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            <span>ESG Dashboard Metrics</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>Carbon Footprint Data</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span>Compliance Records</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                            <span>Monthly Progress Reports</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Background>
  );
}
