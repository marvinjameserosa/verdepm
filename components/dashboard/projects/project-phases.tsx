"use client";

import { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PreConstructionPhase from "./pre-construction-phase";
import ConstructionPhase from "./construction-phase";
import PostConstructionPhase from "./post-construction-phase";
import ProjectOverviewTab from "./project-overview-tab";
import type { Project } from "@/types/project";

type ProjectPhasesProps = {
  project: Project;
  onProjectUpdated?: (project: Project) => void;
};

type TabValue =
  | "project-overview"
  | "pre-construction"
  | "construction"
  | "post-construction";

export default function ProjectPhases({ project, onProjectUpdated }: ProjectPhasesProps) {
  const [activeTab, setActiveTab] = useState<TabValue>("project-overview");
  const [preconstructionRefreshKey, setPreconstructionRefreshKey] = useState(0);

  const handleTabChange = (value: string) => {
    setActiveTab(value as TabValue);
  };

  const handleOverviewSaved = () => {
    setPreconstructionRefreshKey((prev) => prev + 1);
  };

  const handleContinueToPreConstruction = () => {
    setActiveTab("pre-construction");
  };

  return (
    <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 rounded-2xl border border-white/20 shadow-2xl p-6">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-1">
          <TabsTrigger
            value="project-overview"
            className="data-[state=active]:bg-emerald-100 dark:data-[state=active]:bg-emerald-900/40 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-300 rounded-lg transition-all duration-200"
          >
            Project Overview
          </TabsTrigger>
          <TabsTrigger
            value="pre-construction"
            className="data-[state=active]:bg-emerald-100 dark:data-[state=active]:bg-emerald-900/40 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-300 rounded-lg transition-all duration-200"
          >
            Pre-Construction
          </TabsTrigger>
          <TabsTrigger
            value="construction"
            className="data-[state=active]:bg-emerald-100 dark:data-[state=active]:bg-emerald-900/40 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-300 rounded-lg transition-all duration-200"
          >
            Construction
          </TabsTrigger>
          <TabsTrigger
            value="post-construction"
            className="data-[state=active]:bg-emerald-100 dark:data-[state=active]:bg-emerald-900/40 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-300 rounded-lg transition-all duration-200"
          >
            Post-Construction
          </TabsTrigger>
        </TabsList>
        <TabsContent value="project-overview" className="mt-6">
          <ProjectOverviewTab
            project={project}
            onProjectUpdated={onProjectUpdated}
            onContinueToPreConstruction={handleContinueToPreConstruction}
            onSetupSaved={handleOverviewSaved}
          />
        </TabsContent>
        <TabsContent value="pre-construction" className="mt-6">
          <PreConstructionPhase
            project={project}
            onProjectUpdated={onProjectUpdated}
            step2ReadOnly
            refreshKey={preconstructionRefreshKey}
          />
        </TabsContent>
        <TabsContent value="construction" className="mt-6">
          <ConstructionPhase project={project} />
        </TabsContent>
        <TabsContent value="post-construction" className="mt-6">
          <PostConstructionPhase project={project} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
