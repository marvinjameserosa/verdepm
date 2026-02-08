import { getProjects } from "@/actions/projects/getProjects";
import { Background } from "@/components/ui/background";
import { SupplierWorkspace } from "@/components/dashboard/suppliers/SupplierWorkspace";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const { data: projects, error } = await getProjects();

  return (
    <Background variant="subtle" className="min-h-screen p-4">
      <SupplierWorkspace
        initialProjects={projects ?? []}
        initialError={error}
      />
    </Background>
  );
}

