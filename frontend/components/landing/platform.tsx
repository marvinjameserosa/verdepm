"use client";

import { motion } from "framer-motion";
import { Building2, Database, FileText } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";

export const Platform = () => {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32 text-foreground transition-colors duration-300 bg-transparent">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          className="max-w-3xl mx-auto text-center space-y-6 mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-green-400 to-lime-300 bg-clip-text text-transparent">
            A Smarter Way to Manage Construction Projects
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            From planning to post-construction,{" "}
            <span className="font-semibold text-emerald-500">VerdePM</span>{" "}
            centralizes your workflows — enabling real-time monitoring, resource
            tracking, and ESG reporting for sustainable project success.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: <Building2 className="h-8 w-8 text-emerald-500" />,
              title: "Unified Platform",
              desc: "A centralized system for every project management need.",
            },
            {
              icon: <FileText className="h-8 w-8 text-emerald-400" />,
              title: "Automated Reports",
              desc: "Generate compliance-ready documentation instantly.",
            },
            {
              icon: <Database className="h-8 w-8 text-emerald-600" />,
              title: "Centralized Data",
              desc: "Ensure all stakeholders work from the same reliable source.",
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              viewport={{ once: true }}
            >
              <Card className="border border-border bg-card hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300 group">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-emerald-100/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    {card.icon}
                  </div>
                  <CardTitle className="text-foreground">
                    {card.title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {card.desc}
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="bg-card border border-border rounded-2xl p-10 sm:p-12 shadow-inner backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <p className="text-center text-lg text-muted-foreground leading-relaxed">
            Built for{" "}
            <span className="font-semibold text-emerald-500">
              Project Managers
            </span>
            ,{" "}
            <span className="font-semibold text-emerald-400">
              Construction Accountants
            </span>
            , and{" "}
            <span className="font-semibold text-emerald-600">Suppliers</span> —
            ensuring every stakeholder collaborates seamlessly under one
            sustainable digital roof.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
