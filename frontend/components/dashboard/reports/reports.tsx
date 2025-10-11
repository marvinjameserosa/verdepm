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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
  TrendingUp,
} from "lucide-react";
import { Background } from "@/components/ui/background";

// Documentation items from post-construction phase
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
  {
    name: "Carbon Footprint Assessment",
    type: "Environmental Report",
    size: "3.1 MB",
    status: "Complete",
    description:
      "Detailed analysis of project carbon emissions and reduction strategies",
  },
  {
    name: "Social Impact Analysis",
    type: "Impact Report",
    size: "2.8 MB",
    status: "Complete",
    description: "Community engagement outcomes and social benefits assessment",
  },
];

const certifications = [
  { name: "LEED Platinum", status: "Achieved", date: "2024-10-01" },
  { name: "BREEAM Excellent", status: "Achieved", date: "2024-09-28" },
  { name: "ISO 14001", status: "In Progress", date: "2024-11-15" },
  { name: "WELL Building Standard", status: "Achieved", date: "2024-10-10" },
];

const reportTemplates = [
  {
    id: "esg-summary",
    title: "ESG Performance Summary",
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
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [reportContent, setReportContent] = useState("");
  const [reportTitle, setReportTitle] = useState("");

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

  // Function to generate report content based on template and dashboard data
  function generateReportContent(template: any) {
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    switch (template.id) {
      case "esg-summary":
        return `# ESG Performance Summary Report

**Project:** Verde Tower Construction Project
**Generated:** ${currentDate}
**Period:** January 2024 - October 2024

## Executive Summary

This comprehensive ESG performance report provides an overview of our project's Environmental, Social, and Governance achievements during the post-construction phase.

## Environmental Performance
- **Score:** ${template.data.environmental.score}/100 (Target: ${
          template.data.environmental.target
        })
- **Status:** ${template.data.environmental.status.toUpperCase()}
- **Carbon Footprint:** ${template.data.carbonFootprint} tCO₂e
- **Waste Recycling Rate:** ${template.data.wasteRecycled}%
- **Energy Efficiency:** ${template.data.energyEfficiency}%

## Social Impact
- **Score:** ${template.data.social.score}/100 (Target: ${
          template.data.social.target
        })
- **Status:** ${template.data.social.status.toUpperCase()}
- **Community Programs:** 8 initiatives launched
- **Local Employment:** 145 jobs created
- **Safety Record:** Zero incidents during construction

## Governance Excellence
- **Score:** ${template.data.governance.score}/100 (Target: ${
          template.data.governance.target
        })
- **Status:** ${template.data.governance.status.toUpperCase()}
- **Certifications Achieved:** 4 out of 4 planned
- **Compliance Rate:** 100%
- **Stakeholder Engagement:** 25 sessions conducted

## Recommendations
1. Continue monitoring environmental metrics quarterly
2. Expand community engagement programs
3. Maintain governance excellence standards
4. Prepare for annual ESG audit

---
*Report generated from live dashboard data*`;

      case "carbon-footprint":
        return `# Carbon Footprint Analysis Report

**Project:** Verde Tower Construction Project
**Generated:** ${currentDate}
**Analysis Period:** Full Project Lifecycle

## Carbon Emissions Overview

**Total Project Emissions:** ${template.data.totalEmissions} tCO₂e
**Original Target:** ${template.data.reductionTarget} tCO₂e
**Reduction Achieved:** ${template.data.reductionAchieved}%

## Emissions by Scope
- **Scope 1 (Direct):** ${template.data.scopes.scope1} tCO₂e
- **Scope 2 (Electricity):** ${template.data.scopes.scope2} tCO₂e
- **Scope 3 (Indirect):** ${template.data.scopes.scope3} tCO₂e

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

      case "compliance-report":
        return `# Compliance & Certifications Report

**Project:** Verde Tower Construction Project
**Generated:** ${currentDate}
**Reporting Period:** January 2024 - October 2024

## Certification Status

**Achieved Certifications (${template.data.certifications}/${template.data.totalCertifications}):**
- LEED Platinum (October 1, 2024)
- BREEAM Excellent (September 28, 2024)
- WELL Building Standard (October 10, 2024)

**In Progress:**
- ISO 14001 Environmental Management (Expected: November 15, 2024)

## Regulatory Compliance
**Overall Compliance Rate:** ${template.data.complianceRate}%

### Environmental Regulations
- ✅ Air Quality Standards: Fully compliant
- ✅ Water Discharge Permits: All requirements met
- ✅ Waste Management: Properly documented and disposed

### Building Codes & Safety
- ✅ Fire Safety Standards: Exceeded requirements
- ✅ Structural Engineering: Third-party verified
- ✅ Accessibility Standards: ADA compliant

### Labor & Social Compliance
- ✅ Fair Labor Standards: All contractors verified
- ✅ Safety Protocols: Zero incident record
- ✅ Community Impact: All mitigation measures implemented

## Risk Assessment
- **High Priority:** None identified
- **Medium Priority:** 2 items under monitoring
- **Low Priority:** 3 items scheduled for routine review

---
*All compliance data verified by independent auditors*`;

      case "stakeholder-summary":
        return `# Stakeholder Impact Report

**Project:** Verde Tower Construction Project
**Generated:** ${currentDate}
**Stakeholder Engagement Period:** Project Lifecycle

## Community Engagement Overview

**Programs Implemented:** ${template.data.communityPrograms}
**Local Jobs Created:** ${template.data.localJobs}
**Stakeholder Satisfaction:** ${template.data.stakeholderSatisfaction}%

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
                  <div className="space-y-4">
                    {documentationItems.map((doc, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                              <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                              <div className="font-semibold">{doc.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {doc.description}
                              </div>
                              <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                <span>{doc.type}</span>
                                <span>{doc.size}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge
                              variant="secondary"
                              className={getStatusBadge(doc.status)}
                            >
                              {doc.status}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-lg"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
                </CardContent>
              </Card>
            </TabsContent>

            {/* Generate Reports Tab */}
            <TabsContent value="generate" className="space-y-6 mt-6">
              {/* Report Templates */}
              {!selectedReport && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                                  generateReportContent(template)
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

                  {/* Report Statistics */}
                  <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
                    <CardHeader>
                      <CardTitle className="text-emerald-700 dark:text-emerald-300">
                        Report Statistics
                      </CardTitle>
                      <CardDescription>
                        Overview of available data for reporting
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">ESG Data Points</span>
                          <Badge variant="outline" className="text-emerald-600">
                            156
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Carbon Metrics</span>
                          <Badge variant="outline" className="text-blue-600">
                            24
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Certifications</span>
                          <Badge variant="outline" className="text-purple-600">
                            {certifications.length}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Monthly Tracking</span>
                          <Badge variant="outline" className="text-amber-600">
                            6 months
                          </Badge>
                        </div>
                        <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                          <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                            Data Quality Score: 94%
                          </div>
                          <div className="text-xs text-emerald-600 dark:text-emerald-400">
                            All data sources verified and up-to-date
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
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
                        <Button className="w-full" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview Report
                        </Button>
                        <Button className="w-full" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Export as PDF
                        </Button>
                        <Button className="w-full" variant="outline">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share via Email
                        </Button>
                        <Button className="w-full" variant="outline">
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
