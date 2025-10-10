"use client";

import { motion } from "framer-motion";
import { Building2, Database, FileText } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";

export const Platform = () => {
  return (
    <section
      className="relative overflow-hidden py-24 sm:py-32 bg-gradient-to-b from-black via-emerald-950/40 to-black text-white transition-colors duration-300"
    >
      {/* Subtle background grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px] opacity-20"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header Section */}
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
          <p className="text-lg text-gray-300 leading-relaxed">
            From planning to post-construction,{" "}
            <span className="font-semibold text-emerald-400">
              VerdePM
            </span>{" "}
            centralizes your workflows — enabling real-time monitoring, resource
            tracking, and ESG reporting for sustainable project success.
          </p>
        </motion.div>

        {/* Cards Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: <Building2 className="h-8 w-8 text-emerald-400" />,
              title: "Unified Platform",
              desc: "A centralized system for every project management need.",
            },
            {
              icon: <FileText className="h-8 w-8 text-green-400" />,
              title: "Automated Reports",
              desc: "Generate compliance-ready documentation instantly.",
            },
            {
              icon: <Database className="h-8 w-8 text-lime-400" />,
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
              <Card className="border border-emerald-700/40 bg-gradient-to-b from-emerald-900/20 to-transparent hover:from-emerald-800/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300 group">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-emerald-900/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    {card.icon}
                  </div>
                  <CardTitle className="text-white">{card.title}</CardTitle>
                  <CardDescription className="text-gray-300">
                    {card.desc}
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom Note */}
        <motion.div
          className="bg-emerald-900/40 border border-emerald-700/50 rounded-2xl p-10 sm:p-12 shadow-inner backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <p className="text-center text-lg text-gray-200 leading-relaxed">
            Built for{" "}
            <span className="font-semibold text-emerald-400">
              Project Managers
            </span>
            ,{" "}
            <span className="font-semibold text-green-400">
              Construction Accountants
            </span>
            , and{" "}
            <span className="font-semibold text-lime-400">
              Suppliers
            </span>{" "}
            — ensuring every stakeholder collaborates seamlessly under one
            sustainable digital roof.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
