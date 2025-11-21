"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Building2 } from "lucide-react";
import {
  type Project,
  type ProjectPriority,
  type ProjectStatus,
} from "@/types/project";
import LocationPicker from "@/components/ui/location-picker";
import { useAddProjectForm } from "@/hooks/useAddProjectForm";
import { ErrorDisplay } from "@/components/ui/error-display";
import { type AddProjectModalProps } from "@/types/components";
import {
  categoryOptions,
  priorityOptions,
  statusOptions,
} from "@/lib/project-options";

export function AddProjectModal({ onProjectCreated }: AddProjectModalProps) {
  const {
    open,
    formState,
    isSubmitting,
    errorMessage,
    isSubmitDisabled,
    handleInputChange,
    handleSelectChange,
    handleSubmit,
    handleOpenChange,
  } = useAddProjectForm(onProjectCreated);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold shadow-md transition-all duration-200 rounded-xl">
          <PlusCircle className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Add Project</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px] max-h-[80vh] rounded-2xl border border-emerald-100/70 dark:border-emerald-900/40 bg-gradient-to-br from-sky-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/40 shadow-2xl backdrop-blur p-0 flex flex-col overflow-hidden min-h-0">
        <form onSubmit={handleSubmit} className="flex h-full flex-col min-h-0">
          <DialogHeader className="text-center sm:text-left px-6 pt-6 shrink-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-200/50 dark:border-emerald-700/50">
                <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                Create New Project
              </DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground">
              Start a new construction project with essential details and
              tracking capabilities.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 space-y-5 px-6 py-4 overflow-y-auto pr-2 min-h-0">
            {errorMessage && (
              <ErrorDisplay title="Error" message={errorMessage} />
            )}

            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-foreground"
              >
                Project Name *
              </Label>
              <Input
                id="name"
                value={formState.name}
                onChange={handleInputChange}
                placeholder="Enter project name..."
                className="rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-sm font-medium text-foreground"
              >
                Description
              </Label>
              <Textarea
                id="description"
                value={formState.description}
                onChange={handleInputChange}
                placeholder="Brief description of the project..."
                className="rounded-xl min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="status"
                  className="text-sm font-medium text-foreground"
                >
                  Initial Status
                </Label>
                <Select
                  value={formState.status}
                  onValueChange={(value: ProjectStatus) =>
                    handleSelectChange("status", value)
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[100]">
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="priority"
                  className="text-sm font-medium text-foreground"
                >
                  Priority
                </Label>
                <Select
                  value={formState.priority}
                  onValueChange={(value: ProjectPriority) =>
                    handleSelectChange("priority", value)
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[100]">
                    {priorityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="startDate"
                  className="text-sm font-medium text-foreground"
                >
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formState.startDate}
                  onChange={handleInputChange}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="endDate"
                  className="text-sm font-medium text-foreground"
                >
                  Target End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formState.endDate}
                  onChange={handleInputChange}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="clientName"
                className="text-sm font-medium text-foreground"
              >
                Client / Customer
              </Label>
              <Input
                id="clientName"
                value={formState.clientName}
                onChange={handleInputChange}
                placeholder="Enter client's name..."
                className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="category"
                  className="text-sm font-medium text-foreground"
                >
                  Project Type / Category
                </Label>
                <Select
                  value={formState.category || undefined}
                  onValueChange={(value: string) =>
                    handleSelectChange("category", value)
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="z-[100]">
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="budget"
                  className="text-sm font-medium text-foreground"
                >
                  Estimated Budget
                </Label>
                <Input
                  id="budget"
                  type="number"
                  inputMode="decimal"
                  value={formState.budget}
                  onChange={handleInputChange}
                  placeholder="e.g., 500000"
                  className="rounded-xl"
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="location"
                className="text-sm font-medium text-foreground"
              >
                Site Location
              </Label>
              <LocationPicker
                value={formState.location || ""}
                onChange={(value) => handleSelectChange("location", value)}
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3 px-6 pb-6 pt-4 border-t border-emerald-100/70 dark:border-emerald-900/40 bg-white/60 dark:bg-slate-950/40 backdrop-blur shrink-0">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold shadow-md transition-all duration-200 rounded-xl"
              disabled={isSubmitDisabled}
            >
              {isSubmitting ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
