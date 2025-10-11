"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PreConstructionPhase from "./pre-construction-phase";
import ConstructionPhase from "./construction-phase";
import PostConstructionPhase from "./post-construction-phase";

export default function ProjectPhases() {
  return (
    <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 rounded-2xl border border-white/20 shadow-2xl p-6">
      <Tabs defaultValue="pre-construction" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-1">
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
        <TabsContent value="pre-construction" className="mt-6">
          <PreConstructionPhase />
        </TabsContent>
        <TabsContent value="construction" className="mt-6">
          <ConstructionPhase />
        </TabsContent>
        <TabsContent value="post-construction" className="mt-6">
          <PostConstructionPhase />
        </TabsContent>
      </Tabs>
    </div>
  );
}
