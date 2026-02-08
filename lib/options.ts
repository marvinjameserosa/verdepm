import type { ProjectPriority, ProjectStatus } from "@/types/project";

export const statusOptions: Array<{ value: ProjectStatus; label: string }> = [
  { value: "planning", label: "Planning" },
  { value: "in-progress", label: "In Progress" },
  { value: "on-hold", label: "On Hold" },
  { value: "completed", label: "Completed" },
];

export const priorityOptions: Array<{ value: ProjectPriority; label: string }> =
  [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
  ];

export const categoryOptions = [
  { value: "commercial", label: "Commercial" },
  { value: "residential", label: "Residential" },
  { value: "infrastructure", label: "Infrastructure" },
  { value: "renovation", label: "Renovation" },
];
