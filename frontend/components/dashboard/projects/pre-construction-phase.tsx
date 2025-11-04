"use client";

import React, { useState } from "react";
import Step1ProjectSetup from "./preconstruction/step1-project-setup";
import Step2TargetSetting from "./preconstruction/step2-target-setting";
import Step3ReviewPlans from "./preconstruction/step3-review-plans";
import { Material, initialMaterials } from "./preconstruction/types";

const StepIndicator = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { id: 1, title: "Project Setup" },
    { id: 2, title: "Target Setting" },
    { id: 3, title: "Review Plans" },
  ];
  return (
    <div className="flex justify-center items-center py-8">
      <div className="flex items-center">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= step.id
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}
              >
                {step.id}
              </div>
              <p
                className={`mt-2 text-sm ${
                  currentStep >= step.id
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-gray-500"
                }`}
              >
                {step.title}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-auto border-t-2 mx-4 ${
                  currentStep > step.id
                    ? "border-emerald-500"
                    : "border-gray-300 dark:border-gray-700"
                }`}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export function PreConstructionPhase() {
  const [step, setStep] = useState(1);
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const addMaterial = (material: Material) => {
    setMaterials((prev) => [...prev, material]);
  };

  return (
    <div>
      <StepIndicator currentStep={step} />
      {step === 1 && <Step1ProjectSetup onNext={nextStep} />}
      {step === 2 && (
        <Step2TargetSetting
          onNext={nextStep}
          onBack={prevStep}
          addMaterial={addMaterial}
        />
      )}
      {step === 3 && (
        <Step3ReviewPlans onBack={prevStep} materials={materials} />
      )}
    </div>
  );
}

export default PreConstructionPhase;
