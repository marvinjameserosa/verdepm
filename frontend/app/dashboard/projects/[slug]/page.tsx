import ProjectPhases from "@/components/dashboard/projects/project-phases";
import { Background } from "@/components/ui/background";
import { projects } from "@/lib/data";
import { notFound } from "next/navigation";

interface ProjectPageProps {
  params: {
    slug: string;
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = params;
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  return (
    <Background variant="subtle" className="min-h-screen">
      <div className="relative z-10">
        <div className="flex flex-col gap-6 p-6">
          <main className="space-y-6">
            {/* Project Header */}
            <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 rounded-2xl border border-white/20 shadow-2xl p-6">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                  {project.name}
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground">
                  {project.description}
                </p>
              </div>
            </div>
            <ProjectPhases />
          </main>
        </div>
      </div>
    </Background>
  );
}
