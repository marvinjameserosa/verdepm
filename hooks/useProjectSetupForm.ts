"use client";

import type { AppError } from "@/types/error";
import type {
  ExistingFileState,
  FileState,
  InitialValues,
  Step1FormValues,
  DocumentKey,
} from "@/types/forms";
import type { ProjectPriority, ProjectStatus } from "@/types/project";
import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";

const EMPTY_FILE_STATE: FileState = {};

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
  const [status, setStatus] = useState<ProjectStatus>(
    initialValues?.status ?? "planning"
  );
  const [priority, setPriority] = useState<ProjectPriority>(
    initialValues?.priority ?? "medium"
  );

  const [startDate, setStartDate] = useState(initialValues?.startDate ?? "");
  const [endDate, setEndDate] = useState(initialValues?.endDate ?? "");
  const [clientName, setClientName] = useState(initialValues?.clientName ?? "");
  const [category, setCategory] = useState(initialValues?.category ?? "");
  const [budget, setBudget] = useState(initialValues?.budget ?? "");
  const [files, setFiles] = useState<FileState>(EMPTY_FILE_STATE);
  const [documentPaths, setDocumentPaths] = useState<ExistingFileState>(
    initialValues?.documentPaths ?? {}
  );
  const [error, setError] = useState<AppError | null>(null);

  useEffect(() => {
    if (!initialValues) {
      return;
    }
    setProjectName(initialValues.projectName ?? "");
    setProjectAddress(initialValues.projectAddress ?? "");
    setProjectDescription(initialValues.projectDescription ?? "");
    setStatus(initialValues.status ?? "planning");
    setPriority(initialValues.priority ?? "medium");
    setStartDate(initialValues.startDate ?? "");
    setEndDate(initialValues.endDate ?? "");
    setClientName(initialValues.clientName ?? "");
    setCategory(initialValues.category ?? "");
    setBudget(initialValues.budget ?? "");
    setDocumentPaths(initialValues.documentPaths ?? {});
    setFiles(EMPTY_FILE_STATE);
  }, [initialValues]);

  const registerFile = (key: DocumentKey, file: File | null) => {
    setFiles((prev) => {
      const next = { ...prev };
      if (file) {
        next[key] = file;
      } else {
        delete next[key];
      }
      return next;
    });

    if (file) {
      setDocumentPaths((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      await onSubmit({
        projectName,
        projectAddress,
        projectDescription,
        status,
        priority,
        startDate,
        endDate,
        clientName,
        category,
        budget,
        files,
        userId: user?.id,
      });
      setFiles(EMPTY_FILE_STATE);
    } catch (error) {
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
        status,
        priority,
        startDate,
        endDate,
        clientName,
        category,
        budget,
        files,
        userId: user?.id,
      });
      setFiles(EMPTY_FILE_STATE);
    } catch (error) {
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
    status,
    setStatus,
    priority,
    setPriority,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    clientName,
    setClientName,
    category,
    setCategory,
    budget,
    setBudget,
    files,
    documentPaths,
    registerFile,
    error,
    handleSubmit,
    handleSave,
  };
}
