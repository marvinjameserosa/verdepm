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
  projectTemplate: z.string().min(1, "Project template is required"),
  name: z.string().min(3, "Project name must be at least 3 characters"),
  projectId: z.string().min(1, "Project ID/Number is required"),
  isActive: z.boolean().default(true),
  description: z.string().min(1, "Project description is required"),
  squareFeet: z.string().min(1, "Square feet is required"),
  status: z.enum(["planning", "in-progress", "on-hold", "completed"]),
  priority: z.enum(["low", "medium", "high"]),
  startDate: z.string().min(1, "Est. Start Date is required"),
  endDate: z.string().min(1, "Est. Completion Date is required"),
  address: z.string().min(1, "Project address is required"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  timezone: z.string().min(1, "Timezone is required"),
  office: z.string().min(1, "Office is required"),
  category: z.string().min(1, "Project type is required"),
  clientName: z.string().optional(),
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
