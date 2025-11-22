"use client";

import React, { useEffect, useRef, useState } from "react";
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
import { GanttChartSquare, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ProjectTargets = {
  id?: string | null;
  scopeOne: string;
  scopeTwo: string;
  scopeThree: string;
  trir: string;
};

type Props = {
  onNext: () => void;
  onBack: () => void;
  projectId?: string | null;
  targets: ProjectTargets | null;
  onSaveTargets: (values: ProjectTargets) => Promise<void>;
  isSaving?: boolean;
  onError?: (message: string) => void;
  onResetFeedback?: () => void;
};

export default function Step2TargetSetting({
  onNext,
  onBack,
  projectId,
  targets,
  onSaveTargets,
  isSaving,
  onError,
  onResetFeedback,
}: Props) {
  const [formState, setFormState] = useState<ProjectTargets>({
    id: targets?.id ?? null,
    scopeOne: targets?.scopeOne ?? "",
    scopeTwo: targets?.scopeTwo ?? "",
    scopeThree: targets?.scopeThree ?? "",
    trir: targets?.trir ?? "",
  });
  const inputRefs = useRef<Record<keyof ProjectTargets, HTMLInputElement | null>>({
    id: null,
    scopeOne: null,
    scopeTwo: null,
    scopeThree: null,
    trir: null,
  });
  const [activeField, setActiveField] = useState<keyof ProjectTargets | null>(null);

  useEffect(() => {
    if (targets) {
      setFormState({
        id: targets.id ?? null,
        scopeOne: targets.scopeOne ?? "",
        scopeTwo: targets.scopeTwo ?? "",
        scopeThree: targets.scopeThree ?? "",
        trir: targets.trir ?? "",
      });
    }
  }, [targets]);

  useEffect(() => {
    if (!activeField || activeField === "id") {
      return;
    }
    const element = inputRefs.current[activeField];
    if (element && document.activeElement !== element) {
      element.focus({ preventScroll: true });
      const length = element.value.length;
      element.setSelectionRange(length, length);
    }
  }, [
    activeField,
    formState.scopeOne,
    formState.scopeTwo,
    formState.scopeThree,
    formState.trir,
  ]);

  const ensureProjectAvailable = () => {
    if (!projectId) {
      onError?.("Save the project setup before defining ESG targets.");
      return false;
    }
    return true;
  };

  const isValidNumber = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return false;
    }
    const numeric = Number(trimmed);
    return Number.isFinite(numeric) && numeric >= 0;
  };

  const handleSave = async () => {
    onResetFeedback?.();
    if (!ensureProjectAvailable()) {
      return;
    }

    // Validate all fields
    if (
      !formState.scopeOne.trim() ||
      !formState.scopeTwo.trim() ||
      !formState.scopeThree.trim() ||
      !formState.trir.trim()
    ) {
      onError?.("Please fill in all target values before saving.");
      return;
    }

    if (!isValidNumber(formState.scopeOne)) {
      onError?.("Scope 1 target must be a valid number.");
      return;
    }

    if (!isValidNumber(formState.scopeTwo)) {
      onError?.("Scope 2 target must be a valid number.");
      return;
    }

    if (!isValidNumber(formState.scopeThree)) {
      onError?.("Scope 3 target must be a valid number.");
      return;
    }

    if (!isValidNumber(formState.trir)) {
      onError?.("TRIR target must be a valid number.");
      return;
    }

    await onSaveTargets({
      id: formState.id,
      scopeOne: formState.scopeOne.trim(),
      scopeTwo: formState.scopeTwo.trim(),
      scopeThree: formState.scopeThree.trim(),
      trir: formState.trir.trim(),
    });
  };

  const TargetCard = ({
    title,
    description,
    explanation,
    unit,
    value,
    onChange,
    placeholder,
    inputRef,
    onFieldFocus,
    onFieldBlur,
  }: {
    title: string;
    description: string;
    explanation: string;
    unit: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    inputRef?: (node: HTMLInputElement | null) => void;
    onFieldFocus?: () => void;
    onFieldBlur?: () => void;
  }) => (
    <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950/40 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </CardTitle>
            <CardDescription className="text-xs md:text-sm text-muted-foreground">
              {description}
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-help">
                  <Info className="h-4 w-4 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">{explanation}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label>Target Value ({unit})</Label>
          <Input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={(event) => {
              event.target.select();
              onFieldFocus?.();
            }}
            onBlur={() => {
              onFieldBlur?.();
            }}
            ref={inputRef}
          />
        </div>
      </CardContent>
    </Card>
  );

  const hasAnyTarget =
    formState.scopeOne.trim() ||
    formState.scopeTwo.trim() ||
    formState.scopeThree.trim() ||
    formState.trir.trim();

  return (
    <section className="w-full pb-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 sm:px-6">
        <header className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <div className="rounded-lg bg-emerald-100 p-1.5 dark:bg-emerald-900/40">
              <GanttChartSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold sm:text-xl">
              Step 2: Target Setting
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Set your ESG targets for CO2 emissions and safety metrics. All values represent targets to achieve during the project lifecycle.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <TargetCard
            title="Scope 1 Emissions"
            description="Direct emissions from logistics and equipment"
            explanation="Scope 1 includes direct greenhouse gas emissions from sources owned or controlled by the organization, such as fuel combustion from construction vehicles and equipment."
            unit="tCO2e"
            placeholder="e.g., 150"
            value={formState.scopeOne}
            onChange={(val) =>
              setFormState((prev) => ({ ...prev, scopeOne: val }))
            }
            inputRef={(node) => {
              inputRefs.current.scopeOne = node;
            }}
            onFieldFocus={() => setActiveField("scopeOne")}
            onFieldBlur={() => setActiveField(null)}
          />

          <TargetCard
            title="Scope 2 Emissions"
            description="Indirect emissions from electricity usage"
            explanation="Scope 2 covers indirect greenhouse gas emissions from the consumption of purchased electricity, heat, or steam used in construction activities."
            unit="tCO2e"
            placeholder="e.g., 75"
            value={formState.scopeTwo}
            onChange={(val) =>
              setFormState((prev) => ({ ...prev, scopeTwo: val }))
            }
            inputRef={(node) => {
              inputRefs.current.scopeTwo = node;
            }}
            onFieldFocus={() => setActiveField("scopeTwo")}
            onFieldBlur={() => setActiveField(null)}
          />

          <TargetCard
            title="Scope 3 Emissions"
            description="Other indirect emissions from waste and water"
            explanation="Scope 3 encompasses all other indirect emissions in the value chain, including waste disposal and water consumption related to construction operations."
            unit="tCO2e"
            placeholder="e.g., 50"
            value={formState.scopeThree}
            onChange={(val) =>
              setFormState((prev) => ({ ...prev, scopeThree: val }))
            }
            inputRef={(node) => {
              inputRefs.current.scopeThree = node;
            }}
            onFieldFocus={() => setActiveField("scopeThree")}
            onFieldBlur={() => setActiveField(null)}
          />

          <TargetCard
            title="Total Recordable Incident Rate (TRIR)"
            description="Safety performance target"
            explanation="TRIR measures the number of recordable workplace injuries and illnesses per 200,000 hours worked. A lower TRIR indicates better safety performance on the construction site."
            unit="incidents per 200,000 hours"
            placeholder="e.g., 2.5"
            value={formState.trir}
            onChange={(val) =>
              setFormState((prev) => ({ ...prev, trir: val }))
            }
            inputRef={(node) => {
              inputRefs.current.trir = node;
            }}
            onFieldFocus={() => setActiveField("trir")}
            onFieldBlur={() => setActiveField(null)}
          />
        </div>

        <div className="flex items-center justify-end border-t border-gray-100 pt-6 dark:border-gray-800">
          <Button
            type="button"
            onClick={handleSave}
            disabled={!projectId || isSaving}
            className="w-full sm:w-auto"
          >
            {isSaving ? "Saving..." : "Save Targets"}
          </Button>
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-100 pt-6 dark:border-gray-800 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-sm text-muted-foreground">
            {hasAnyTarget
              ? "Save your targets before moving forward."
              : "Define at least one target to continue."}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onBack}>
              Previous
            </Button>
            <Button onClick={onNext}>Next</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
