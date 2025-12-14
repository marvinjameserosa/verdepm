import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { addProject } from "@/actions/projects/addProject";
import type { Project } from "@/types/project";
import type { AddProjectData } from "@/types/forms";

const defaultFormState: AddProjectData = {
  projectTemplate: "",
  name: "",
  projectId: "",
  isActive: true,
  description: "",
  squareFeet: "",
  status: "planning",
  priority: "medium",
  startDate: "",
  endDate: "",
  address: "",
  city: "",
  country: "",
  zipCode: "",
  timezone: "",
  office: "",
  category: "",
  clientName: "",
  budget: "",
  location: "",
};

export function useAddProjectForm(
  onProjectCreated?: (project: Project) => void
) {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formState, setFormState] = useState<AddProjectData>(defaultFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isStep1Valid = useMemo(() => {
    return (
      formState.projectTemplate.trim() !== '' &&
      formState.name.trim() !== '' &&
      formState.projectId.trim() !== '' &&
      formState.description.trim() !== ''
    );
  }, [
    formState.projectTemplate,
    formState.name,
    formState.projectId,
    formState.description,
  ]);

  const isStep2Valid = useMemo(() => {
    return (
      formState.squareFeet.trim() !== '' &&
      formState.startDate.trim() !== '' &&
      formState.endDate.trim() !== '' &&
      !!formState.status &&
      formState.category.trim() !== ''
    );
  }, [
    formState.squareFeet,
    formState.startDate,
    formState.endDate,
    formState.status,
    formState.category,
  ]);

  const isStep3Valid = useMemo(() => {
    return (
      formState.address.trim() !== '' &&
      formState.city.trim() !== '' &&
      formState.country.trim() !== '' &&
      formState.zipCode.trim() !== '' &&
      formState.timezone.trim() !== ''
    );
  }, [
    formState.address,
    formState.city,
    formState.country,
    formState.zipCode,
    formState.timezone,
  ]);

  const isStep4Valid = useMemo(() => {
    return formState.office.trim() !== '';
  }, [formState.office]);

  const isSubmitDisabled = useMemo(() => {
    return (
      isSubmitting ||
      !formState.projectTemplate.trim() ||
      !formState.name.trim() ||
      !formState.projectId.trim() ||
      !formState.description.trim() ||
      !formState.squareFeet.trim() ||
      !formState.startDate.trim() ||
      !formState.endDate.trim() ||
      !formState.address.trim() ||
      !formState.city.trim() ||
      !formState.country.trim() ||
      !formState.zipCode.trim() ||
      !formState.timezone.trim() ||
      !formState.office.trim() ||
      !formState.category.trim() ||
      !formState.status ||
      !formState.priority
    );
  }, [
    formState.projectTemplate,
    formState.name,
    formState.projectId,
    formState.description,
    formState.squareFeet,
    formState.startDate,
    formState.endDate,
    formState.address,
    formState.city,
    formState.country,
    formState.zipCode,
    formState.timezone,
    formState.office,
    formState.category,
    formState.status,
    formState.priority,
    isSubmitting
  ]);

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = event.target;
    setFormState((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: keyof AddProjectData, value: any) => {
    setFormState((prev) => ({ ...prev, [id]: value }));
  };

  const resetForm = () => {
    setFormState(defaultFormState);
    setErrorMessage(null);
    setCurrentStep(1);
  };

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const canProceedToNextStep = useMemo(() => {
    switch (currentStep) {
      case 1:
        return isStep1Valid;
      case 2:
        return isStep2Valid;
      case 3:
        return isStep3Valid;
      case 4:
        return isStep4Valid;
      default:
        return false;
    }
  }, [currentStep, isStep1Valid, isStep2Valid, isStep3Valid, isStep4Valid]);

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
    currentStep,
    formState,
    isSubmitting,
    errorMessage,
    isSubmitDisabled,
    canProceedToNextStep,
    handleInputChange,
    handleSelectChange,
    handleSubmit,
    handleOpenChange,
    nextStep,
    prevStep,
  };
}
