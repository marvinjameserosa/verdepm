"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ClipboardList,
  FileCheck,
  GanttChartSquare,
  Upload,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import LocationPicker from "@/components/ui/location-picker";

type DocumentKey = "sec-dti" | "mayors-permit" | "bir";

type FileState = Partial<Record<DocumentKey, File | null>>;

type ExistingFileState = Partial<Record<DocumentKey, string>>;

type Step1FormValues = {
  projectName: string;
  projectAddress: string;
  projectDescription: string;
  files: FileState;
};

type InitialValues = {
  projectName?: string;
  projectAddress?: string;
  projectDescription?: string;
  documentPaths?: ExistingFileState;
};

type Props = {
  onSubmit: (values: Step1FormValues) => Promise<void>;
  onSave: (values: Step1FormValues) => Promise<void>;
  initialValues?: InitialValues;
  isSubmitting: boolean;
};

export default function Step1ProjectSetup({
  onSubmit,
  onSave,
  initialValues,
  isSubmitting,
}: Props) {
  const [projectName, setProjectName] = useState(
    initialValues?.projectName ?? "Greenwood Tower"
  );
  const [projectAddress, setProjectAddress] = useState(
    initialValues?.projectAddress ?? "123 Sustainable Ave, Eco City"
  );
  const [projectDescription, setProjectDescription] = useState(
    initialValues?.projectDescription ?? ""
  );
  const [files, setFiles] = useState<FileState>({});
  const [existingFiles, setExistingFiles] = useState<ExistingFileState>(
    initialValues?.documentPaths ?? {}
  );

  useEffect(() => {
    if (!initialValues) {
      return;
    }
    setProjectName(initialValues.projectName ?? "");
    setProjectAddress(initialValues.projectAddress ?? "");
    setProjectDescription(initialValues.projectDescription ?? "");
    setExistingFiles(initialValues.documentPaths ?? {});
    setFiles({});
  }, [initialValues]);

  const fileRows = useMemo(
    () => [
      {
        key: "sec-dti" as DocumentKey,
        label: "SEC or DTI",
        description: "Scanned copy (PDF, max 5 MB)",
      },
      {
        key: "mayors-permit" as DocumentKey,
        label: "Latest Mayor’s Permit",
        description: "Scanned copy (PDF, max 5 MB)",
      },
      {
        key: "bir" as DocumentKey,
        label: "BIR Certificate of Registration",
        description: "Scanned copy (PDF, max 5 MB)",
      },
    ],
    []
  );

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: DocumentKey
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFiles((prev) => ({ ...prev, [key]: selectedFile }));
      setExistingFiles((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await onSubmit({
        projectName,
        projectAddress,
        projectDescription,
        files,
      });
    } catch (error) {
      console.error("Failed to save project setup", error);
    }
  };

  const handleSave = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    try {
      await onSave({
        projectName,
        projectAddress,
        projectDescription,
        files,
      });
    } catch (error) {
      console.error("Failed to save project setup", error);
    }
  };

  const getExistingFileLabel = (path?: string) => {
    if (!path) {
      return null;
    }
    const segments = path.split("/");
    return segments[segments.length - 1];
  };

  return (
    <section className="w-full">
      <Card className="w-full max-w-5xl mx-auto border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-3xl shadow-lg">
        <form onSubmit={handleSubmit}>
          <CardHeader className="gap-3 border-b border-gray-100/80 dark:border-gray-800/80">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40">
                <GanttChartSquare className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-xl text-emerald-800 dark:text-emerald-200">
                  Step 1 · Project Setup & Due Diligence
                </CardTitle>
                <CardDescription className="text-sm">
                  Capture the basics and attach compliance docs. Everything
                  auto-saves when you continue.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8 px-6 py-8 lg:px-10">
            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
              <Card className="bg-white dark:bg-gray-950/40 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm h-full">
                <CardHeader className="pb-2 px-6">
                  <CardTitle className="text-base text-emerald-700 dark:text-emerald-200 tracking-wide">
                    Project Information
                  </CardTitle>
                  <CardDescription className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
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
                    <div className="space-y-2">
                      <LocationPicker
                        value={projectAddress}
                        onChange={setProjectAddress}
                        onSave={() => {
                          onSave({
                            projectName,
                            projectAddress,
                            projectDescription,
                            files,
                          });
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        Selected Location: {projectAddress || "None"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="projectDescription">
                      Project Description
                    </Label>
                    <Textarea
                      id="projectDescription"
                      placeholder="Describe the project's vision and scope."
                      className="bg-white/80 dark:bg-gray-800/80 min-h-[120px]"
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-950/40 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm h-full space-y-4">
                <CardHeader className="pb-0 px-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30">
                      <ClipboardList className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        Minimum Document Requirement
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Upload clearly labeled PDFs so compliance reviews move
                        faster.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6 space-y-4">
                  {fileRows.map(({ key, label, description }) => (
                    <div
                      key={key}
                      className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <Label
                            htmlFor={`${key}-file`}
                            className="text-sm font-semibold"
                          >
                            {label}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {description}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Max 5 MB
                        </p>
                      </div>
                      <div className="flex flex-col gap-3">
                        {files[key] ? (
                          <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-md w-full">
                            <FileCheck className="h-4 w-4" />
                            <span className="truncate">{files[key]?.name}</span>
                          </div>
                        ) : existingFiles[key] ? (
                          <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-md w-full">
                            <FileCheck className="h-4 w-4" />
                            <span className="truncate">
                              {getExistingFileLabel(existingFiles[key])}
                            </span>
                          </div>
                        ) : (
                          <div className="flex h-12 items-center justify-center rounded-md border border-dashed border-gray-200 text-xs text-muted-foreground">
                            No file uploaded yet
                          </div>
                        )}
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            asChild
                            variant="outline"
                            className="flex-shrink-0"
                          >
                            <label
                              htmlFor={`${key}-file`}
                              className="cursor-pointer flex items-center justify-center gap-2"
                            >
                              <Upload className="h-4 w-4" />
                              <span>
                                {files[key] || existingFiles[key]
                                  ? "Change file"
                                  : "Upload file"}
                              </span>
                              <input
                                id={`${key}-file`}
                                type="file"
                                className="hidden"
                                accept=".pdf"
                                onChange={(e) => handleFileChange(e, key)}
                              />
                            </label>
                          </Button>
                          <p className="text-xs text-muted-foreground">
                            Rename files before uploading for cleaner audit
                            trails.
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 border-t border-gray-100 dark:border-gray-800 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="text-sm text-muted-foreground">
              <p>You can revisit this step anytime—details stay saved.</p>
              <p className="text-xs mt-1">
                Need to brief a teammate? Share the overview link after saving.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={handleSave}
                className="w-full lg:w-auto"
              >
                Save
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full lg:w-auto"
              >
                {isSubmitting ? "Saving..." : "Next"}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </section>
  );
}
