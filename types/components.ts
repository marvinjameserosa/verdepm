import { type Project } from "./project";
import type { ReactNode } from "react";
import type { InitialValues, Step1FormValues } from "@/types/forms";

export type AddProjectModalProps = {
  onProjectCreated?: (project: Project) => void;
};

export type Step1ProjectSetupProps = {
  onSubmit: (values: Step1FormValues) => Promise<void>;
  onSave: (values: Step1FormValues) => Promise<void>;
  initialValues?: InitialValues;
  isSubmitting: boolean;
  insightsContent?: ReactNode;
};
