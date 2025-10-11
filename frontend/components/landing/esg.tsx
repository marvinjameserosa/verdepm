"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Leaf, Shield, Users } from "lucide-react";

export const ESG = () => {
  return (
    <section className="text-foreground py-20 sm:py-32 relative overflow-hidden bg-transparent">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header Section */}
        <div className="max-w-3xl mx-auto text-center space-y-6 mb-20">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-green-500 to-lime-400 bg-clip-text text-transparent">
            Turn Sustainability into Measurable Progress
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            ESG data doesn&apos;t have to be complicated.{" "}
            <span className="text-emerald-500 font-semibold">VerdePM</span>{" "}
            simplifies tracking by dividing metrics into three intuitive tabs.
          </p>
        </div>

        {/* ESG Cards */}
        <div className="grid md:grid-cols-3 gap-10">
          {/* Environment */}
          <Card className="border border-border bg-card hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300 group">
            <CardHeader>
              <div className="h-16 w-16 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                <Leaf className="h-8 w-8 text-emerald-500" />
              </div>
              <CardTitle className="text-2xl text-foreground">
                Environment (E)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>Input electricity, fuel, water, and waste data per phase.</p>
              <ul className="space-y-2">
                {[
                  "Energy consumption tracking",
                  "Water usage monitoring",
                  "Waste management logs",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Social */}
          <Card className="border border-border bg-card hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300 group">
            <CardHeader>
              <div className="h-16 w-16 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                <Users className="h-8 w-8 text-emerald-400" />
              </div>
              <CardTitle className="text-2xl text-foreground">
                Social (S)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>Log labor hours, safety records, and community activities.</p>
              <ul className="space-y-2">
                {[
                  "Labor hours documentation",
                  "Safety incident tracking",
                  "Community engagement logs",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Governance */}
          <Card className="border border-border bg-card hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300 group">
            <CardHeader>
              <div className="h-16 w-16 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                <Shield className="h-8 w-8 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl text-foreground">
                Governance (G)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>
                Manage compliance records, audit trails, and ethical sourcing
                documentation.
              </p>
              <ul className="space-y-2">
                {[
                  "Compliance management",
                  "Audit trail tracking",
                  "Ethical sourcing records",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
