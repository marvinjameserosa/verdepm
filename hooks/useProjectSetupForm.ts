"use client";

import { useSession } from "@/components/auth/SessionProvider";
import type { AppError } from "@/types/error";
import type { InitialValues, Step1FormValues } from "@/types/forms";
import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";

const EMPTY_FILE_STATE = {};

type UseProjectSetupFormProps = {
  onSubmit: (values: Step1FormValues) => Promise<void>;
  onSave: (values: Step1FormValues) => Promise<void>;
  initialValues?: InitialValues;
  user: User | null;
};

export function useProjectSetupForm({
  onSubmit,
  onSave,
  initialValues,
  user,
}: UseProjectSetupFormProps) {
  const [projectName, setProjectName] = useState(
    initialValues?.projectName ?? "Greenwood Tower"
  );
  const [projectAddress, setProjectAddress] = useState(
    initialValues?.projectAddress ?? "123 Sustainable Ave, Eco City"
  );
  const [projectDescription, setProjectDescription] = useState(
    initialValues?.projectDescription ?? ""
  );
  const [error, setError] = useState<AppError | null>(null);

  useEffect(() => {
    if (!initialValues) {
      return;
    }
    setProjectName(initialValues.projectName ?? "");
    setProjectAddress(initialValues.projectAddress ?? "");
    setProjectDescription(initialValues.projectDescription ?? "");
  }, [initialValues]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      await onSubmit({
        projectName,
        projectAddress,
        projectDescription,
        files: EMPTY_FILE_STATE,
        userId: user?.id,
      });
    } catch (error) {
      console.error("Failed to save project setup", error);
      setError({
        title: "Failed to Submit",
        message:
          "There was an unexpected error while submitting the project details. Please try again.",
      });
    }
  };

  const handleSave = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setError(null);
    try {
      await onSave({
        projectName,
        projectAddress,
        projectDescription,
        files: EMPTY_FILE_STATE,
        userId: user?.id,
      });
    } catch (error) {
      console.error("Failed to save project setup", error);
      setError({
        title: "Failed to Save",
        message:
          "There was an unexpected error while saving the project details. Please try again.",
      });
    }
  };

  return {
    projectName,
    setProjectName,
    projectAddress,
    setProjectAddress,
    projectDescription,
    setProjectDescription,
    error,
    handleSubmit,
    handleSave,
  };
}
