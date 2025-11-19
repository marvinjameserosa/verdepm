"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Building2, Users2, ClipboardList } from "lucide-react";

const placeholderTeams = [
  {
    id: "department-1",
    name: "Sustainability Office",
    description: "Central ESG steering committee with cross-functional leads.",
  },
  {
    id: "department-2",
    name: "Field Operations",
    description: "Site supervisors and regional coordinators.",
  },
  {
    id: "department-3",
    name: "Executive Council",
    description: "Leadership group tracking ESG adoption milestones.",
  },
];

const placeholderPolicies = [
  {
    id: "policy-1",
    title: "Code of Conduct",
    status: "Draft",
  },
  {
    id: "policy-2",
    title: "Data Retention",
    status: "Review",
  },
  {
    id: "policy-3",
    title: "Supplier Ethics",
    status: "Published",
  },
];

export function OrganizationTab() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Organization</h2>
          <p className="text-muted-foreground">
            High-level directory for business units, policies, and reporting structure.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline">Export Snapshot</Button>
          <Button>Add Structure</Button>
        </div>
      </div>

      <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <Building2 className="h-5 w-5" />
            Company Overview
          </CardTitle>
          <CardDescription>
            Placeholders for legal entity and reporting lines.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-base">Parent Entity</CardTitle>
              <CardDescription>VerdePM Holdings, Inc.</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-base">Primary Region</CardTitle>
              <CardDescription>Philippines &amp; Southeast Asia</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-base">Reporting Cycle</CardTitle>
              <CardDescription>Quarterly ESG &amp; governance reviews</CardDescription>
            </CardHeader>
          </Card>
        </CardContent>
      </Card>

      <Tabs defaultValue="teams" className="w-full">
        <TabsList className="grid w-full grid-cols-2 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 rounded-xl p-1">
          <TabsTrigger value="teams" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700">
            Teams
          </TabsTrigger>
          <TabsTrigger value="policies" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700">
            Policies
          </TabsTrigger>
        </TabsList>
        <TabsContent value="teams" className="mt-6">
          <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users2 className="h-5 w-5 text-emerald-600" />
                Team Directory
              </CardTitle>
              <CardDescription>Placeholder groups until linked to live data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {placeholderTeams.map((team) => (
                <div key={team.id} className="rounded-lg border border-dashed border-emerald-200 dark:border-emerald-900/40 p-4">
                  <h3 className="font-semibold">{team.name}</h3>
                  <p className="text-sm text-muted-foreground">{team.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="policies" className="mt-6">
          <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-emerald-600" />
                Governance Policies
              </CardTitle>
              <CardDescription>Draft placeholders for policy management.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {placeholderPolicies.map((policy) => (
                <div key={policy.id} className="flex items-center justify-between rounded-lg border border-dashed border-emerald-200 dark:border-emerald-900/40 p-4">
                  <div>
                    <h3 className="font-semibold">{policy.title}</h3>
                    <p className="text-sm text-muted-foreground">Metadata and links to be added.</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {policy.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default OrganizationTab;
