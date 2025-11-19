import ProjectPageContent from "@/components/dashboard/projects/project-page-content";
import { Background } from "@/components/ui/background";
import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/actions/getProjectBySlug";
import type { Project } from "@/types/project";
import type { ProjectPageProps } from "@/types/pages";

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;

  let project: Project | null = null;

  try {
    project = await getProjectBySlug(slug);
  } catch (error) {
    console.error("Failed to load project", error);
    notFound();
  }

  if (!project) {
    notFound();
  }

  return (
    <Background variant="subtle" className="min-h-screen">
      <ProjectPageContent initialProject={project} />
    </Background>
  );
}
