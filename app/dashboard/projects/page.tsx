import ProjectsTab from "@/components/dashboard/projects/projects";
import { Background } from "@/components/ui/background";

export default function ProjectsPage() {
  return (
    <Background variant="subtle" className="min-h-screen">
      <div className="relative z-10">
        <ProjectsTab />
      </div>
    </Background>
  );
}
