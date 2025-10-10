"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PreConstructionPhase from "./pre-construction-phase";
import ConstructionPhase from "./construction-phase";
import PostConstructionPhase from "./post-construction-phase";

export default function ProjectPhases() {
  return (
    <Tabs defaultValue="pre-construction" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="pre-construction">Pre-Construction</TabsTrigger>
        <TabsTrigger value="construction">Construction</TabsTrigger>
        <TabsTrigger value="post-construction">Post-Construction</TabsTrigger>
      </TabsList>
      <TabsContent value="pre-construction">
        <PreConstructionPhase />
      </TabsContent>
      <TabsContent value="construction">
        <ConstructionPhase />
      </TabsContent>
      <TabsContent value="post-construction">
        <PostConstructionPhase />
      </TabsContent>
    </Tabs>
  );
}
