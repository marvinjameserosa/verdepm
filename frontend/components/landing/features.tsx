"use client";

import {
  BarChart3,
  Database,
  FileText,
  Smartphone,
  Users,
  Lock,
} from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";

export const Features = () => {
  return (
    <section
      id="features"
      className="py-20 sm:py-32 text-foreground relative overflow-hidden bg-transparent"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-green-500 to-lime-400 bg-clip-text text-transparent">
            Everything You Need in One Platform
          </h2>
          <p className="text-muted-foreground text-lg">
            Designed for sustainability and efficiency — VerdePM brings all your
            project essentials under one green roof.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <BarChart3 className="h-10 w-10 text-emerald-500 mb-3" />,
              title: "Centralized Dashboard",
              desc: "View project performance and ESG progress at a glance",
            },
            {
              icon: <FileText className="h-10 w-10 text-emerald-400 mb-3" />,
              title: "Automated Reports",
              desc: "Generate PDF and visual summaries ready for investor or auditor submission",
            },
            {
              icon: <Users className="h-10 w-10 text-emerald-600 mb-3" />,
              title: "Role-Based Access",
              desc: "Define permissions for Project Managers, Accountants, and Suppliers",
            },
            {
              icon: <Database className="h-10 w-10 text-emerald-500 mb-3" />,
              title: "Data Backup & Security",
              desc: "Secure storage with version control and access tracking",
            },
            {
              icon: <Smartphone className="h-10 w-10 text-emerald-400 mb-3" />,
              title: "Responsive Design",
              desc: "Manage your projects anytime, on any device",
            },
            {
              icon: <Lock className="h-10 w-10 text-emerald-600 mb-3" />,
              title: "Compliance Ready",
              desc: "Built-in templates for industry standards and regulations",
            },
          ].map((feature, index) => (
            <Card
              key={index}
              className="border border-border bg-card hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300 group"
            >
              <CardHeader>
                {feature.icon}
                <CardTitle className="text-foreground">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {feature.desc}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
