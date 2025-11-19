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
import { GanttChartSquare } from "lucide-react";
import { useEffect, useState } from "react";
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

const EMPTY_FILE_STATE: FileState = {};

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
    try {
      await onSubmit({
        projectName,
        projectAddress,
        projectDescription,
        files: EMPTY_FILE_STATE,
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
        files: EMPTY_FILE_STATE,
      });
    } catch (error) {
      console.error("Failed to save project setup", error);
    }
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
                  Capture the project basics. Compliance documentation now
                  lives in the Organization tab.
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
                            files: EMPTY_FILE_STATE,
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
