import type { Project, ProjectStatus, SupabaseProject } from "@/types/project";

export const projectStatusLabels: Record<ProjectStatus, string> = {
  planning: "Planning",
  "in-progress": "In Progress",
  "on-hold": "On Hold",
  completed: "Completed",
};

export const mapProjectFromSupabase = (record: unknown): Project => {
  const supabaseProject = record as SupabaseProject;
  return {
    id: supabaseProject.id,
    ownerId: supabaseProject.owner_id,
    name: supabaseProject.name,
    slug: supabaseProject.slug,
    description: supabaseProject.description,
    status: supabaseProject.status,
    priority: supabaseProject.priority,
    category: supabaseProject.category,
    projectManager: supabaseProject.project_manager,
    clientName: supabaseProject.client_name,
    location: supabaseProject.location,
    budget: supabaseProject.budget,
    startDate: supabaseProject.start_date,
    endDate: supabaseProject.end_date,
    createdAt: supabaseProject.created_at,
    updatedAt: supabaseProject.updated_at,
  };
};
