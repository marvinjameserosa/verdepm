import { Building2, ChevronRight, Database, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";

export const Platform = () => {
  return (
    <section className="bg-background py-16 md:py-32">
      {/* Platform Overview */}
      <section id="platform" className="py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
              A Smarter Way to Manage Construction Projects
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed text-pretty">
              From planning to post-construction, VerdePM centralizes your project workflows — allowing teams to monitor
              progress, track resource usage, and generate compliance-ready ESG reports in real time.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Unified Platform</CardTitle>
                <CardDescription>One centralized system for all project management needs</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Automated Reports</CardTitle>
                <CardDescription>Generate compliance-ready documentation instantly</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-chart-3/10 flex items-center justify-center mb-4">
                  <Database className="h-6 w-6 text-chart-3" />
                </div>
                <CardTitle>Centralized Data</CardTitle>
                <CardDescription>All stakeholders work from the same reliable source</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="bg-muted/50 rounded-2xl p-8 sm:p-12">
            <p className="text-center text-lg text-muted-foreground">
              Built for <span className="font-semibold text-foreground">Project Managers</span>,{" "}
              <span className="font-semibold text-foreground">Construction Accountants</span>, and{" "}
              <span className="font-semibold text-foreground">Suppliers</span> — ensuring every stakeholder works from
              the same reliable data source.
            </p>
          </div>
        </div>
      </section>
    </section>
  );
};
