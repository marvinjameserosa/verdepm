import ProjectPageContent from "@/components/dashboard/projects/project-page-content";
import { Background } from "@/components/ui/background";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mapProjectFromSupabase } from "@/components/dashboard/projects/project-helpers";
import type { Project } from "@/types/project";

export const dynamic = "force-dynamic";

interface ProjectPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(
      "id, owner_id, name, slug, description, status, priority, category, project_manager, client_name, location, budget, start_date, end_date, created_at, updated_at"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Failed to load project", error);
    notFound();
  }

  if (!data) {
    notFound();
  }

  const project: Project = mapProjectFromSupabase(data);

  return (
    <Background variant="subtle" className="min-h-screen">
      <ProjectPageContent initialProject={project} />
    </Background>
  );
}
