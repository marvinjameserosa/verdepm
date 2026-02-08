import type { Project, ProjectStatus, SupabaseProject } from "@/types/project";

export const projectStatusLabels: Record<ProjectStatus, string> = {
  planning: "Planning",
  "in-progress": "In Progress",
  "on-hold": "On Hold",
  completed: "Completed",
};

export const mapProjectFromSupabase = (record: unknown): Project => {
  const supabaseProject = record as SupabaseProject;
  const normalizedId =
    supabaseProject.id ??
    (typeof supabaseProject.project_id === "string"
      ? supabaseProject.project_id
      : undefined);

  if (!normalizedId) {
    throw new Error("Project record is missing an id field");
  }

  const rawBudget = supabaseProject.budget;
  const parsedBudget =
    typeof rawBudget === "string"
      ? Number.isFinite(Number(rawBudget))
        ? Number(rawBudget)
        : null
      : rawBudget ?? null;

  return {
    id: normalizedId,
    ownerId: supabaseProject.owner_id ?? null,
    organizationId: supabaseProject.organization_id ?? null,
    name:
      supabaseProject.project_name ??
      supabaseProject.name ??
      "Untitled Project",
    slug: supabaseProject.slug ?? normalizedId,
    description: supabaseProject.description ?? null,
    status: supabaseProject.status,
    priority: supabaseProject.priority,
    category: supabaseProject.category ?? null,
    projectManager: supabaseProject.project_manager ?? null,
    clientName: supabaseProject.client_name ?? null,
    location: supabaseProject.location ?? null,
    budget: parsedBudget,
    startDate: supabaseProject.start_date ?? null,
    endDate: supabaseProject.end_date ?? null,
    createdAt: supabaseProject.created_at,
    updatedAt: supabaseProject.updated_at,
  };
};
