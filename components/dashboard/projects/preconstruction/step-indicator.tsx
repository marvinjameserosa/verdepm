import { STEP_DEFINITIONS, type StepDefinition } from "@/lib/preconstruction";

type StepIndicatorProps = {
  currentStep: number;
  steps?: StepDefinition[];
};

export const StepIndicator = ({ currentStep, steps = STEP_DEFINITIONS }: StepIndicatorProps) => {
  const totalSteps = steps.length || 1;
  const safeCurrentStep = Math.min(Math.max(currentStep, 1), totalSteps);
  const progressPercent = Math.round((safeCurrentStep / totalSteps) * 100);

  return (
    <div className="rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white/90 dark:bg-gray-900/70 p-4 space-y-4 shadow-sm">
      <div className="flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span className="font-medium text-gray-700 dark:text-gray-200">
          Step {safeCurrentStep} of {totalSteps}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
          {progressPercent}% complete
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <ol
        className="flex w-full gap-3 overflow-x-auto pb-2 sm:flex-col sm:gap-0 sm:space-y-3 sm:overflow-visible snap-x snap-mandatory"
        style={{ scrollbarWidth: "thin" }}
      >
        {steps.map((stepDef, index) => {
          const stepNumber = index + 1;
          const isActive = safeCurrentStep === stepNumber;
          const isComplete = safeCurrentStep > stepNumber;
          const itemKey = stepDef.id ?? `${stepNumber}-${stepDef.title}`;
          const itemBorder = isActive
            ? "border-emerald-200/80 dark:border-emerald-800/60"
            : isComplete
            ? "border-emerald-200/50 dark:border-emerald-800/40"
            : "border-gray-200/70 dark:border-gray-800/70";
          const itemBackground = isActive
            ? "bg-emerald-50/80 dark:bg-emerald-900/20 shadow-sm"
            : isComplete
            ? "bg-emerald-50/40 dark:bg-emerald-900/10"
            : "bg-white/70 dark:bg-gray-900/40";
          return (
            <li
              key={itemKey}
              className={`min-w-[180px] flex-shrink-0 snap-start rounded-xl border ${itemBorder} ${itemBackground} flex items-start gap-3 p-3 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 sm:min-w-0`}
              tabIndex={0}
            >
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                  isComplete
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : isActive
                    ? "border-emerald-500 text-emerald-700 dark:text-emerald-200"
                    : "border-gray-300 text-gray-500"
                }`}
                aria-label={
                  isActive ? "Current step" : `Step ${stepNumber} indicator`
                }
              >
                {isComplete ? "✓" : stepNumber}
              </div>
              <div>
                <p
                  className={`text-sm font-medium ${
                    isActive || isComplete
                      ? "text-emerald-700 dark:text-emerald-200"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {stepDef.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stepDef.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};
