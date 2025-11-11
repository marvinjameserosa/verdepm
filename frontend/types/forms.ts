import { z } from "zod";

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
