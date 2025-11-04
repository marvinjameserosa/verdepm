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
import { useState } from "react";

type Props = {
  onNext: () => void;
};

type FileState = {
  "sec-dti": File | null;
  "mayors-permit": File | null;
  bir: File | null;
};

export default function Step1ProjectSetup({ onNext }: Props) {
  const [files, setFiles] = useState<FileState>({
    "sec-dti": null,
    "mayors-permit": null,
    bir: null,
  });

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: keyof FileState
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles((prev) => ({ ...prev, [key]: e.target.files![0] }));
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-4xl backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
              <GanttChartSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            Step 1: Project Setup & Due Diligence
          </CardTitle>
          <CardDescription>
            Define project goals and complete initial compliance checks.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="bg-white/60 dark:bg-gray-900/60">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  id="projectName"
                  placeholder="e.g., 'Greenwood Tower'"
                  defaultValue="Greenwood Tower"
                  className="bg-white/80 dark:bg-gray-800/80"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectAddress">Project Address</Label>
                <Input
                  id="projectAddress"
                  placeholder="e.g., '123 Sustainable Ave, Eco City'"
                  defaultValue="123 Sustainable Ave, Eco City"
                  className="bg-white/80 dark:bg-gray-800/80"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectDescription">Project Description</Label>
                <Textarea
                  id="projectDescription"
                  placeholder="Describe the project's vision and scope."
                  className="bg-white/80 dark:bg-gray-800/80"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 dark:bg-gray-900/60">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ClipboardList className="h-5 w-5" /> Minimum Document
                Requirement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  key: "sec-dti",
                  label: "SEC or DTI",
                  description: "Scanned copy (PDF, max 5 MB)",
                },
                {
                  key: "mayors-permit",
                  label: "Latest Mayor’s Permit",
                  description: "Scanned copy (PDF, max 5 MB)",
                },
                {
                  key: "bir",
                  label: "BIR Certificate of Registration",
                  description: "Scanned copy (PDF, max 5 MB)",
                },
              ].map(({ key, label, description }) => (
                <div
                  key={key}
                  className="grid grid-cols-1 sm:grid-cols-3 sm:items-center gap-3"
                >
                  <div className="sm:col-span-1">
                    <Label
                      htmlFor={`${key}-file`}
                      className="text-sm font-medium"
                    >
                      {label}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {description}
                    </p>
                  </div>
                  <div className="sm:col-span-2 flex items-center justify-between gap-4">
                    {files[key as keyof FileState] ? (
                      <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-md w-full">
                        <FileCheck className="h-4 w-4" />
                        <span className="truncate">
                          {files[key as keyof FileState]!.name}
                        </span>
                      </div>
                    ) : (
                      <div className="w-full h-10"></div> // Placeholder for alignment
                    )}
                    <Button
                      asChild
                      variant="outline"
                      className="w-auto flex-shrink-0"
                    >
                      <label
                        htmlFor={`${key}-file`}
                        className="cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        <span>
                          {files[key as keyof FileState] ? "Change" : "Upload"}
                        </span>
                        <input
                          id={`${key}-file`}
                          type="file"
                          className="hidden"
                          accept=".pdf"
                          onChange={(e) =>
                            handleFileChange(e, key as keyof FileState)
                          }
                        />
                      </label>
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={onNext}>Next</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
