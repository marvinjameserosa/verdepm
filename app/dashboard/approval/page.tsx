"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Background } from "@/components/ui/background";
import {
  CheckCircle2,
  Clock3,
  FlagTriangleRight,
  UserCircle,
  XCircle,
} from "lucide-react";

const flaggedReviews = [
  {
    id: "APR-1024",
    title: "Verde Tower Site Plan",
    owner: "Laura Chen",
    submitted: "Nov 12, 2025",
    message: "Missing updated environmental impact addendum.",
  },
  {
    id: "APR-1027",
    title: "Solaris Park Budget Revision",
    owner: "Carlos Reyes",
    submitted: "Nov 14, 2025",
    message: "Budget variance exceeds the 5% threshold.",
  },
];

const decisions = [
  {
    id: "APR-1018",
    title: "Azure Mall Logistics Plan",
    owner: "Eugene An",
    status: "Approved",
    decided: "Nov 10, 2025",
    notes: "Cleared with conditions for phased rollout.",
  },
  {
    id: "APR-1015",
    title: "Crimson Bridge Safety Report",
    owner: "Dana Malik",
    status: "Denied",
    decided: "Nov 08, 2025",
    notes: "Need revised load-testing results before sign-off.",
  },
];

export default function ApprovalPage() {
  return (
    <Background variant="subtle">
      <div className="relative z-10 p-6 space-y-8">
        <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 rounded-2xl border border-white/20 dark:border-gray-800/40 shadow-2xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                Approval Center
              </h1>
              <p className="text-muted-foreground mt-1">
                Monitor flagged submissions, capture decisions, and keep project governance aligned.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-100/80 dark:bg-emerald-900/40">
              <FlagTriangleRight className="h-8 w-8 text-emerald-600 dark:text-emerald-300" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/40 rounded-xl shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg text-emerald-700 dark:text-emerald-300">
                    <FlagTriangleRight className="h-5 w-5" />
                    Needs Review
                  </CardTitle>
                  <CardDescription>
                    Items flagged for follow-up before a final decision is made.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-amber-100/70 text-amber-700 border-amber-200/40 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-900/60">
                  {flaggedReviews.length} flagged
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {flaggedReviews.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-gray-200/70 dark:border-gray-700/60 bg-white/60 dark:bg-gray-800/60 p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={`flag-${item.id}`}
                      defaultChecked
                      className="mt-1"
                      aria-label={`Flagged item ${item.id}`}
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {item.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.id} • Submitted {item.submitted}
                          </p>
                        </div>
                        <Badge variant="outline" className="border-amber-200/60 bg-amber-100/50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-300">
                          Needs review
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.message}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <UserCircle className="h-4 w-4" />
                        {item.owner}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {flaggedReviews.length === 0 && (
                <div className="text-center py-10 text-sm text-muted-foreground border border-dashed border-emerald-200/60 dark:border-emerald-900/40 rounded-2xl">
                  Nothing is flagged at the moment. Great job keeping everything on track!
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/40 rounded-xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-emerald-700 dark:text-emerald-300">
                <Clock3 className="h-5 w-5" />
                Status Overview
              </CardTitle>
              <CardDescription>
                Quick glance at the state of recent approvals.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-200/70 dark:border-gray-700/60 bg-white/60 dark:bg-gray-800/60 p-4">
                  <p className="text-xs uppercase text-sky-600 dark:text-sky-300 font-semibold tracking-wide">
                    Under Review
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                    {flaggedReviews.length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Awaiting updates</p>
                </div>
                <div className="rounded-xl border border-gray-200/70 dark:border-gray-700/60 bg-white/60 dark:bg-gray-800/60 p-4">
                  <p className="text-xs uppercase text-emerald-600 dark:text-emerald-300 font-semibold tracking-wide">
                    Approved
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                    {decisions.filter((d) => d.status === "Approved").length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Cleared for action</p>
                </div>
                <div className="rounded-xl border border-gray-200/70 dark:border-gray-700/60 bg-white/60 dark:bg-gray-800/60 p-4">
                  <p className="text-xs uppercase text-red-600 dark:text-red-300 font-semibold tracking-wide">
                    Denied
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                    {decisions.filter((d) => d.status === "Denied").length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Needs attention</p>
                </div>
              </div>
              <Separator className="bg-emerald-100/80 dark:bg-emerald-900/40" />
              <div className="space-y-3">
                {decisions.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-gray-200/70 dark:border-gray-700/60 bg-white/60 dark:bg-gray-800/60 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {item.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.id} • {item.owner}
                        </p>
                      </div>
                      <Badge
                        className={`gap-1 ${
                          item.status === "Approved"
                            ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-900"
                            : "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-900"
                        }`}
                      >
                        {item.status === "Approved" ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {item.status}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {item.notes}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Decision recorded {item.decided}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Background>
  );
}
