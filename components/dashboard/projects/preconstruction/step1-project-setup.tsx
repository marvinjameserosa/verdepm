"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GanttChartSquare, FileText, Upload } from "lucide-react";
import LocationPicker from "@/components/ui/location-picker";
import { ErrorDisplay } from "@/components/ui/error-display";
import { useProjectSetupForm } from "@/hooks/useProjectSetupForm";
import type { Step1ProjectSetupProps } from "@/types/components";
import type { ProjectStatus, ProjectPriority } from "@/types/project";
import { useSession } from "@/components/auth/SessionProvider";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  categoryOptions,
  priorityOptions,
  statusOptions,
} from "@/lib/project-options";

import { verifyProjectFile } from "@/actions/preconstruction/storage";
import { useState } from "react";

export default function Step1ProjectSetup({
  onSubmit,
  onSave,
  initialValues,
  isSubmitting,
  insightsContent,
}: Step1ProjectSetupProps) {
  const [verifyingFile, setVerifyingFile] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isReplacingFile, setIsReplacingFile] = useState(false);

  const handleViewFile = async (path: string) => {
    setVerifyingFile(path);
    setFileError(null);
    try {
      const { exists, url, error } = await verifyProjectFile(path);
      if (exists && url) {
        window.open(url, "_blank");
      } else {
        setFileError(error || "File not found in storage.");
      }
    } catch (e) {
      console.error(e);
      setFileError("Failed to verify file.");
    } finally {
      setVerifyingFile(null);
    }
  };

  const {
    isLoading: isSessionLoading,
    error: sessionError,
    user,
  } = useSession();
  const {
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
  } = useProjectSetupForm({
    onSubmit,
    onSave,
    initialValues,
    user,
  });

  if (isSessionLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (sessionError) {
    return (
      <ErrorDisplay
        title={sessionError.title}
        message={sessionError.message}
        className="mt-4"
      />
    );
  }

  return (
    <section className="w-full pb-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 sm:px-6">
        <header className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <div className="rounded-lg bg-emerald-100 p-1.5 dark:bg-emerald-900/40">
              <GanttChartSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold sm:text-xl">
              Step 1: Project Overview
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Capture the baseline project narrative, location, and compliance
            context before moving into target setting.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <ErrorDisplay
              title={error.title}
              message={error.message}
              className="mb-2"
            />
          )}
          <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
            <div className="space-y-6">
              <Card className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950/40 shadow-sm">
                <CardHeader className="pb-2 px-6">
                  <CardTitle className="text-base text-emerald-800 dark:text-emerald-200 tracking-wide">
                    Project Information
                  </CardTitle>
                  <CardDescription className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    Required fields
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="projectName">Project Name</Label>
                    <Input
                      id="projectName"
                      placeholder="e.g., 'Greenwood Tower'"
                      className="bg-white/80 dark:bg-gray-800/80"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="projectAddress">Project Address</Label>
                    <LocationPicker
                      value={projectAddress}
                      onChange={setProjectAddress}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="projectDescription">
                      Project Description
                    </Label>
                    <Textarea
                      id="projectDescription"
                      placeholder="Describe the project's vision and scope."
                      className="bg-white/80 dark:bg-gray-800/80 min-h-[140px]"
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950/40 shadow-sm">
                <CardHeader className="pb-2 px-6">
                  <CardTitle className="text-base text-emerald-800 dark:text-emerald-200 tracking-wide">
                    Team & Timeline
                  </CardTitle>
                  <CardDescription className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    Ownership, schedule, client
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6 space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Client / Customer</Label>
                    <Input
                      id="clientName"
                      placeholder="Enter client name"
                      className="bg-white/80 dark:bg-gray-800/80"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        className="bg-white/80 dark:bg-gray-800/80"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">Target End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        className="bg-white/80 dark:bg-gray-800/80"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget">Estimated Budget</Label>
                    <Input
                      id="budget"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      placeholder="e.g., 500000"
                      className="bg-white/80 dark:bg-gray-800/80"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave blank to keep the current budget value.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {insightsContent ? (
                <div className="space-y-6">{insightsContent}</div>
              ) : null}

              <Card className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950/40 shadow-sm">
                <CardHeader className="pb-2 px-6">
                  <CardTitle className="text-base text-emerald-800 dark:text-emerald-200 tracking-wide">
                    Compliance Documents
                  </CardTitle>
                  <CardDescription className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    Upload building permit for reference
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6 space-y-4 text-sm">
                  <div className="space-y-2">
                    <Label htmlFor="buildingPermit">Building Permit</Label>
                    {documentPaths["building-permit"] &&
                    !isReplacingFile &&
                    !files["building-permit"] ? (
                      <div className="rounded-md border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white dark:bg-gray-800 rounded-md border border-gray-100 dark:border-gray-700">
                              <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                Document on file
                              </span>
                              <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {documentPaths["building-permit"]
                                  ?.split("/")
                                  .pop()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleViewFile(
                                  documentPaths["building-permit"]!
                                )
                              }
                              disabled={
                                verifyingFile ===
                                documentPaths["building-permit"]
                              }
                            >
                              {verifyingFile ===
                              documentPaths["building-permit"] ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                              ) : null}
                              View
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setIsReplacingFile(true)}
                            >
                              Replace
                            </Button>
                          </div>
                        </div>
                        {fileError && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-2 px-1">
                            {fileError}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <label
                          htmlFor="buildingPermit"
                          className="group flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-emerald-300/60 bg-emerald-50/60 px-4 py-3 text-sm font-medium text-emerald-700 transition-all hover:border-emerald-400 hover:bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100 dark:hover:border-emerald-700/70 dark:hover:bg-emerald-900/40"
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 transition-colors group-hover:bg-emerald-500/20">
                              <Upload className="h-4 w-4" />
                            </span>
                            <div className="flex flex-col gap-1 text-left">
                              <span className="leading-none">Choose File</span>
                              <span className="text-xs text-muted-foreground dark:text-emerald-100/70">
                                PDF only · Max 10 MB
                              </span>
                            </div>
                          </div>
                          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-600 transition group-hover:bg-emerald-500/20">
                            Browse
                          </span>
                        </label>
                        <Input
                          id="buildingPermit"
                          type="file"
                          accept=".pdf"
                          className="sr-only"
                          onChange={(event) =>
                            registerFile(
                              "building-permit",
                              event.target.files?.[0] ?? null
                            )
                          }
                        />
                        {files["building-permit"] ? (
                          <div className="flex items-center justify-between gap-3 rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-100">
                            <div className="flex items-center gap-2 truncate">
                              <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                              <span
                                className="truncate"
                                title={files["building-permit"]?.name}
                              >
                                {files["building-permit"]?.name}
                              </span>
                            </div>
                            <button
                              type="button"
                              className="rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-600 hover:bg-emerald-500/20 dark:bg-emerald-900/40 dark:text-emerald-200 dark:hover:bg-emerald-900/60"
                              onClick={() =>
                                registerFile("building-permit", null)
                              }
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                            <p>Accepted format: PDF.</p>
                            {documentPaths["building-permit"] && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                  setIsReplacingFile(false);
                                  registerFile("building-permit", null);
                                }}
                              >
                                Cancel replacement
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950/40 shadow-sm">
                <CardHeader className="pb-2 px-6">
                  <CardTitle className="text-base text-emerald-800 dark:text-emerald-200 tracking-wide">
                    Project Attributes
                  </CardTitle>
                  <CardDescription className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    Status, priority, category
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6 space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="status">Current Status</Label>
                    <Select
                      value={status}
                      onValueChange={(value) =>
                        setStatus(value as ProjectStatus)
                      }
                    >
                      <SelectTrigger
                        id="status"
                        className="bg-white/80 dark:bg-gray-800/80"
                      >
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="z-[60] max-h-60">
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={priority}
                      onValueChange={(value) =>
                        setPriority(value as ProjectPriority)
                      }
                    >
                      <SelectTrigger
                        id="priority"
                        className="bg-white/80 dark:bg-gray-800/80"
                      >
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent className="z-[60] max-h-60">
                        {priorityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={category || undefined}
                      onValueChange={(value) => setCategory(value)}
                    >
                      <SelectTrigger
                        id="category"
                        className="bg-white/80 dark:bg-gray-800/80"
                      >
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="z-[60] max-h-60">
                        {categoryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-100 pt-6 text-sm text-muted-foreground dark:border-gray-800 lg:flex-row lg:items-center lg:justify-between">
            <p>You can revisit this step anytime—details stay saved.</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={handleSave}
                className="w-full sm:w-auto"
              >
                Save progress
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? "Saving..." : "Continue"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
