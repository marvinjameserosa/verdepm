import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { addProject } from "@/actions/addProject";
import type { Project } from "@/types/project";
import type { AddProjectData } from "@/types/forms";
import { z } from "zod";
import { addProjectSchema } from "@/types/forms";

const defaultFormState: AddProjectData = {
  name: "",
  description: "",
  status: "planning",
  priority: "medium",
  projectManager: "",
  startDate: "",
  endDate: "",
  clientName: "",
  category: "",
  budget: "",
  location: "",
};

export function useAddProjectForm(
  onProjectCreated?: (project: Project) => void
) {
  const [open, setOpen] = useState(false);
  const [formState, setFormState] = useState<AddProjectData>(defaultFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isSubmitDisabled = useMemo(() => {
    return (
      isSubmitting ||
      !formState.name.trim() ||
      !formState.status ||
      !formState.priority
    );
  }, [formState.name, formState.priority, formState.status, isSubmitting]);

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = event.target;
    setFormState((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: keyof AddProjectData, value: string) => {
    setFormState((prev) => ({ ...prev, [id]: value }));
  };

  const resetForm = () => {
    setFormState(defaultFormState);
    setErrorMessage(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitDisabled) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const { data, error } = await addProject(formState);

    if (error) {
      setErrorMessage(error);
      setIsSubmitting(false);
    } else if (data) {
      onProjectCreated?.(data);
      resetForm();
      setOpen(false);
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      resetForm();
    }
  };

  return {
    open,
    formState,
    isSubmitting,
    errorMessage,
    isSubmitDisabled,
    handleInputChange,
    handleSelectChange,
    handleSubmit,
    handleOpenChange,
  };
}
