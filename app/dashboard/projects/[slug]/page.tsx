import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/actions/projects/getProjectBySlug";
import ProjectPageContent from "@/components/dashboard/projects/project-page-content";
import { Background } from "@/components/ui/background";
import { ErrorDisplay } from "@/components/ui/error-display";
import { safeAsyncOperation } from "@/lib/errors";
import type { ProjectPageProps } from "@/types/pages";

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;

  const { data: project, error } = await safeAsyncOperation(() =>
    getProjectBySlug(slug)
  );

  if (error) {
    return (
      <Background variant="subtle" className="min-h-screen p-4">
        <ErrorDisplay title="Failed to load project" message={error} />
      </Background>
    );
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
