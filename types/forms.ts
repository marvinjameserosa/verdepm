import { z } from "zod";
import type { ProjectPriority, ProjectStatus } from "@/types/project";

export const careersFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  selectedPosition: z.string().min(1, "Position is required"),
  majorGraduation: z.string().min(1, "Major and graduation are required"),
  growthMetrics: z.string().min(1, "Growth metrics are required"),
  previousRole: z.string().min(1, "Previous role is required"),
  resume: z
    .instanceof(File)
    .refine((file) => file.size > 0, "Resume is required"),
});

export type CareersFormData = z.infer<typeof careersFormSchema>;

export const addProjectSchema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters"),
  description: z.string().optional(),
  status: z.enum(["planning", "in-progress", "on-hold", "completed"]),
  priority: z.enum(["low", "medium", "high"]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  clientName: z.string().optional(),
  category: z.string().optional(),
  budget: z.string().optional(),
  location: z.string().optional(),
});

export type AddProjectData = z.infer<typeof addProjectSchema>;

export type DocumentKey = "building-permit";

export type FileState = Partial<Record<DocumentKey, File | null>>;

export type ExistingFileState = Partial<Record<DocumentKey, string>>;

export type Step1FormValues = {
  projectName: string;
  projectAddress: string;
  projectDescription: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate?: string;
  endDate?: string;
  clientName: string;
  category: string;
  budget: string;
  files: FileState;
  userId?: string;
};

export type InitialValues = {
  projectName?: string;
  projectAddress?: string;
  projectDescription?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  startDate?: string | null;
  endDate?: string | null;
  clientName?: string;
  category?: string;
  budget?: string;
  documentPaths?: ExistingFileState;
};
