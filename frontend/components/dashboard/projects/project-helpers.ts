import type { Project, ProjectPriority, ProjectStatus } from "@/types/project";

export const projectStatusLabels: Record<ProjectStatus, string> = {
  planning: "Planning",
  "in-progress": "In Progress",
  "on-hold": "On Hold",
  completed: "Completed",
};

export const projectStatusBadgeClass: Record<ProjectStatus, string> = {
  planning:
    "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800",
  "in-progress":
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  "on-hold":
    "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  completed:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800",
};

export const projectPriorityLabels: Record<ProjectPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const mapProjectFromSupabase = (record: any): Project => ({
  id: record.id,
  ownerId: record.owner_id ?? null,
  name: record.name,
  slug: record.slug,
  description: record.description,
  status: record.status,
  priority: record.priority,
  category: record.category,
  projectManager: record.project_manager,
  clientName: record.client_name,
  location: record.location,
  budget: record.budget,
  startDate: record.start_date,
  endDate: record.end_date,
  createdAt: record.created_at ?? new Date().toISOString(),
  updatedAt: record.updated_at ?? record.created_at ?? new Date().toISOString(),
});
