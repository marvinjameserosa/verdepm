"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Mail, Users, BarChart3 } from "lucide-react";

export const Collaboration = () => {
  return (
    <section className="bg-black text-white py-20 sm:py-32 relative overflow-hidden">
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
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-green-500 to-lime-400 bg-clip-text text-transparent">
            Connect Every Stakeholder in One Portal
          </h2>
          <p className="text-lg text-gray-300 leading-relaxed">
            No more scattered spreadsheets or endless email chains.{" "}
            <span className="font-semibold text-emerald-400">VerdePM</span> enables
            real-time collaboration — uniting engineers, suppliers, environmental
            officers, and project managers in one platform.
          </p>
        </motion.div>

        {/* Collaboration Cards */}
        <div className="grid md:grid-cols-3 gap-10">
          {/* Instant Invitations */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="border border-emerald-700/40 bg-gradient-to-b from-emerald-900/20 to-transparent hover:from-emerald-800/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300 group">
              <CardHeader>
                <div className="h-16 w-16 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                  <Mail className="h-8 w-8 text-emerald-400" />
                </div>
                <CardTitle className="text-2xl text-white">Instant Invitations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-300">
                <p>Invite your entire project team within seconds via email.</p>
                <ul className="space-y-2">
                  {[
                    "One-click user invitations",
                    "Automatic role assignment",
                    "Quick onboarding process",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Role Management */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            viewport={{ once: true }}
          >
            <Card className="border border-green-700/40 bg-gradient-to-b from-green-900/20 to-transparent hover:from-green-800/30 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all duration-300 group">
              <CardHeader>
                <div className="h-16 w-16 rounded-xl bg-green-500/10 flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
                  <Users className="h-8 w-8 text-green-400" />
                </div>
                <CardTitle className="text-2xl text-white">Role Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-300">
                <p>Assign permissions and manage access effortlessly.</p>
                <ul className="space-y-2">
                  {[
                    "Customizable role creation",
                    "Permission-based task visibility",
                    "Secure data segregation",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Real-Time Updates */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <Card className="border border-lime-700/40 bg-gradient-to-b from-lime-900/20 to-transparent hover:from-lime-800/30 hover:shadow-[0_0_20px_rgba(163,230,53,0.3)] transition-all duration-300 group">
              <CardHeader>
                <div className="h-16 w-16 rounded-xl bg-lime-500/10 flex items-center justify-center mb-4 group-hover:bg-lime-500/20 transition-colors">
                  <BarChart3 className="h-8 w-8 text-lime-400" />
                </div>
                <CardTitle className="text-2xl text-white">Real-Time Updates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-300">
                <p>Keep all teams aligned with synchronized project tracking.</p>
                <ul className="space-y-2">
                  {[
                    "Live task progress",
                    "Instant report generation",
                    "Automated milestone notifications",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-lime-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
