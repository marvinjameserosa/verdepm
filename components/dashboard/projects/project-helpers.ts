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

export const mapProjectFromSupabase = (record: unknown): Project => {
  if (!record || typeof record !== "object") {
    throw new TypeError("Expected project record to be an object");
  }

  const {
    id,
    project_id: projectId,
    organization_id: organizationId,
    project_name: projectName,
    slug,
    description,
    status,
    priority,
    category,
    client_name: clientName,
    location,
    budget,
    start_date: startDate,
    end_date: endDate,
    building_permit_url: buildingPermitUrl,
    building_permit_storage_path: buildingPermitStoragePath,
    owner_id,
    created_at: createdAt,
    updated_at: updatedAt,
  } = record as Record<string, unknown>;

  const normalizedId =
    (id as string | null | undefined) ??
    (projectId as string | null | undefined);

  if (!normalizedId) {
    throw new Error("Project record is missing an id or project_id field");
  }

  const parsedBudget =
    typeof budget === "string"
      ? Number.isFinite(Number(budget))
        ? Number(budget)
        : null
      : (budget as number | null | undefined) ?? null;

  return {
    id: normalizedId,
    ownerId: (owner_id as string | null | undefined) ?? null,
    organizationId: (organizationId as string | null | undefined) ?? null,
    name: (projectName as string | null | undefined) ?? "Untitled Project",
    slug: (slug as string | null | undefined) ?? normalizedId,
    description: (description as string | null | undefined) ?? null,
    status: status as ProjectStatus,
    priority: priority as ProjectPriority,
    category: (category as string | null | undefined) ?? null,
    projectManager: null,
    clientName: (clientName as string | null | undefined) ?? null,
    location: (location as string | null | undefined) ?? null,
    budget: parsedBudget,
    startDate: (startDate as string | null | undefined) ?? null,
    endDate: (endDate as string | null | undefined) ?? null,
    buildingPermitUrl: (buildingPermitUrl as string | null | undefined) ?? null,
    buildingPermitStoragePath:
      (buildingPermitStoragePath as string | null | undefined) ?? null,
    createdAt:
      (createdAt as string | null | undefined) ?? new Date().toISOString(),
    updatedAt:
      (updatedAt as string | null | undefined) ??
      (createdAt as string | null | undefined) ??
      new Date().toISOString(),
  };
};
