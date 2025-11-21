"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import { GanttChartSquare } from "lucide-react";
import {
  ProjectEsgTargets,
  TargetSectionKey,
  TargetSectionValuesMap,
} from "@/types/preconstruction";

const DEFAULT_EMISSION_FACTOR = "2.68";

type Props = {
  onNext: () => void;
  onBack: () => void;
  projectId?: string | null;
  targets: ProjectEsgTargets;
  onSaveTargetSection: <K extends TargetSectionKey>(
    section: K,
    values: TargetSectionValuesMap[K]
  ) => Promise<void>;
  savingSection?: TargetSectionKey | null;
  onError?: (message: string) => void;
  onResetFeedback?: () => void;
};

export default function Step2TargetSetting({
  onNext,
  onBack,
  projectId,
  targets,
  onSaveTargetSection,
  savingSection,
  onError,
  onResetFeedback,
}: Props) {
  const [electricityForm, setElectricityForm] = useState<
    TargetSectionValuesMap["electricityUsage"]
  >(() => ({
    id: targets.electricityUsage?.id ?? null,
    timeframe: targets.electricityUsage?.timeframe ?? null,
    date: targets.electricityUsage?.date ?? "",
    totalElectricityConsumed:
      targets.electricityUsage?.totalElectricityConsumed ?? "",
  }));

  const [equipmentForm, setEquipmentForm] = useState<
    TargetSectionValuesMap["equipmentUsage"]
  >(() => ({
    id: targets.equipmentUsage?.id ?? null,
    timeframe: targets.equipmentUsage?.timeframe ?? null,
    date: targets.equipmentUsage?.date ?? "",
    equipmentOperationLogs:
      targets.equipmentUsage?.equipmentOperationLogs ?? "",
    fuelRate: targets.equipmentUsage?.fuelRate ?? "",
    totalFuel: targets.equipmentUsage?.totalFuel ?? "",
    combustionEmissionFactor:
      targets.equipmentUsage?.combustionEmissionFactor ??
      DEFAULT_EMISSION_FACTOR,
  }));

  const [fuelForm, setFuelForm] = useState<
    TargetSectionValuesMap["fuelConsumption"]
  >(() => ({
    id: targets.fuelConsumption?.id ?? null,
    timeframe: targets.fuelConsumption?.timeframe ?? null,
    date: targets.fuelConsumption?.date ?? "",
    totalDistance: targets.fuelConsumption?.totalDistance ?? "",
    fuelEfficiency: targets.fuelConsumption?.fuelEfficiency ?? "",
    totalFuel: targets.fuelConsumption?.totalFuel ?? "",
    fuelEmissionFactor:
      targets.fuelConsumption?.fuelEmissionFactor ?? DEFAULT_EMISSION_FACTOR,
  }));

  const [wasteForm, setWasteForm] = useState<
    TargetSectionValuesMap["wasteGenerated"]
  >(() => ({
    id: targets.wasteGenerated?.id ?? null,
    timeframe: targets.wasteGenerated?.timeframe ?? null,
    date: targets.wasteGenerated?.date ?? "",
    totalWasteMass: targets.wasteGenerated?.totalWasteMass ?? "",
    percentByTreatment: targets.wasteGenerated?.percentByTreatment ?? "",
    emissionFactor: targets.wasteGenerated?.emissionFactor ?? "",
  }));

  const [waterForm, setWaterForm] = useState<
    TargetSectionValuesMap["waterSupply"]
  >(() => ({
    id: targets.waterSupply?.id ?? null,
    timeframe: targets.waterSupply?.timeframe ?? null,
    date: targets.waterSupply?.date ?? "",
    totalWaterConsumed: targets.waterSupply?.totalWaterConsumed ?? "",
    waterSupplyEmissionFactor:
      targets.waterSupply?.waterSupplyEmissionFactor ?? "",
  }));

  const [safetyForm, setSafetyForm] = useState<
    TargetSectionValuesMap["safetyIncident"]
  >(() => ({
    id: targets.safetyIncident?.id ?? null,
    timeframe: targets.safetyIncident?.timeframe ?? null,
    date: targets.safetyIncident?.date ?? "",
    numberOfIncidents: targets.safetyIncident?.numberOfIncidents ?? "",
    totalEmployeeHours: targets.safetyIncident?.totalEmployeeHours ?? "",
  }));

  useEffect(() => {
    const source = targets.electricityUsage;
    if (!source) {
      return;
    }

    setElectricityForm((prev) => {
      const next = {
        id: source.id ?? null,
        timeframe: source.timeframe ?? null,
        date: source.date ?? "",
        totalElectricityConsumed: source.totalElectricityConsumed ?? "",
      };

      if (
        prev.id === next.id &&
        prev.timeframe === next.timeframe &&
        prev.date === next.date &&
        prev.totalElectricityConsumed === next.totalElectricityConsumed
      ) {
        return prev;
      }

      return next;
    });
  }, [targets.electricityUsage]);

  useEffect(() => {
    const source = targets.equipmentUsage;
    if (!source) {
      return;
    }

    setEquipmentForm((prev) => {
      const next = {
        id: source.id ?? null,
        timeframe: source.timeframe ?? null,
        date: source.date ?? "",
        equipmentOperationLogs: source.equipmentOperationLogs ?? "",
        fuelRate: source.fuelRate ?? "",
        totalFuel: source.totalFuel ?? "",
        combustionEmissionFactor:
          source.combustionEmissionFactor ?? DEFAULT_EMISSION_FACTOR,
      };

      if (
        prev.id === next.id &&
        prev.timeframe === next.timeframe &&
        prev.date === next.date &&
        prev.equipmentOperationLogs === next.equipmentOperationLogs &&
        prev.fuelRate === next.fuelRate &&
        prev.totalFuel === next.totalFuel &&
        prev.combustionEmissionFactor === next.combustionEmissionFactor
      ) {
        return prev;
      }

      return next;
    });
  }, [targets.equipmentUsage]);

  useEffect(() => {
    const source = targets.fuelConsumption;
    if (!source) {
      return;
    }

    setFuelForm((prev) => {
      const next = {
        id: source.id ?? null,
        timeframe: source.timeframe ?? null,
        date: source.date ?? "",
        totalDistance: source.totalDistance ?? "",
        fuelEfficiency: source.fuelEfficiency ?? "",
        totalFuel: source.totalFuel ?? "",
        fuelEmissionFactor:
          source.fuelEmissionFactor ?? DEFAULT_EMISSION_FACTOR,
      };

      if (
        prev.id === next.id &&
        prev.timeframe === next.timeframe &&
        prev.date === next.date &&
        prev.totalDistance === next.totalDistance &&
        prev.fuelEfficiency === next.fuelEfficiency &&
        prev.totalFuel === next.totalFuel &&
        prev.fuelEmissionFactor === next.fuelEmissionFactor
      ) {
        return prev;
      }

      return next;
    });
  }, [targets.fuelConsumption]);

  useEffect(() => {
    const source = targets.wasteGenerated;
    if (!source) {
      return;
    }

    setWasteForm((prev) => {
      const next = {
        id: source.id ?? null,
        timeframe: source.timeframe ?? null,
        date: source.date ?? "",
        totalWasteMass: source.totalWasteMass ?? "",
        percentByTreatment: source.percentByTreatment ?? "",
        emissionFactor: source.emissionFactor ?? "",
      };

      if (
        prev.id === next.id &&
        prev.timeframe === next.timeframe &&
        prev.date === next.date &&
        prev.totalWasteMass === next.totalWasteMass &&
        prev.percentByTreatment === next.percentByTreatment &&
        prev.emissionFactor === next.emissionFactor
      ) {
        return prev;
      }

      return next;
    });
  }, [targets.wasteGenerated]);

  useEffect(() => {
    const source = targets.waterSupply;
    if (!source) {
      return;
    }

    setWaterForm((prev) => {
      const next = {
        id: source.id ?? null,
        timeframe: source.timeframe ?? null,
        date: source.date ?? "",
        totalWaterConsumed: source.totalWaterConsumed ?? "",
        waterSupplyEmissionFactor: source.waterSupplyEmissionFactor ?? "",
      };

      if (
        prev.id === next.id &&
        prev.timeframe === next.timeframe &&
        prev.date === next.date &&
        prev.totalWaterConsumed === next.totalWaterConsumed &&
        prev.waterSupplyEmissionFactor === next.waterSupplyEmissionFactor
      ) {
        return prev;
      }

      return next;
    });
  }, [targets.waterSupply]);

  useEffect(() => {
    const source = targets.safetyIncident;
    if (!source) {
      return;
    }

    setSafetyForm((prev) => {
      const next = {
        id: source.id ?? null,
        timeframe: source.timeframe ?? null,
        date: source.date ?? "",
        numberOfIncidents: source.numberOfIncidents ?? "",
        totalEmployeeHours: source.totalEmployeeHours ?? "",
      };

      if (
        prev.id === next.id &&
        prev.timeframe === next.timeframe &&
        prev.date === next.date &&
        prev.numberOfIncidents === next.numberOfIncidents &&
        prev.totalEmployeeHours === next.totalEmployeeHours
      ) {
        return prev;
      }

      return next;
    });
  }, [targets.safetyIncident]);

  const sectionIsSaving = (section: TargetSectionKey) =>
    savingSection === section;

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
    return Number.isFinite(numeric);
  };

  const TargetSectionCard = ({
    title,
    description,
    onSave,
    disabled,
    saving,
    children,
  }: {
    title: string;
    description?: string;
    onSave: () => void;
    disabled: boolean;
    saving: boolean;
    children: React.ReactNode;
  }) => (
    <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950/40 shadow-sm">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </CardTitle>
          {description ? (
            <CardDescription className="text-xs md:text-sm text-muted-foreground">
              {description}
            </CardDescription>
          ) : null}
        </div>
        <Button type="button" onClick={onSave} disabled={disabled || saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );

  const handleSaveElectricity = async () => {
    onResetFeedback?.();
    if (!ensureProjectAvailable()) {
      return;
    }
    if (!electricityForm.totalElectricityConsumed.trim()) {
      onError?.("Provide the total electricity consumed.");
      return;
    }
    if (!isValidNumber(electricityForm.totalElectricityConsumed)) {
      onError?.("Total electricity consumed must be a number.");
      return;
    }

    await onSaveTargetSection("electricityUsage", {
      id: electricityForm.id,
      timeframe: null,
      date: electricityForm.date.trim(),
      totalElectricityConsumed: electricityForm.totalElectricityConsumed.trim(),
    });
  };

  const handleSaveEquipment = async () => {
    onResetFeedback?.();
    if (!ensureProjectAvailable()) {
      return;
    }
    const totalFuelInput = equipmentForm.totalFuel.trim();
    if (!totalFuelInput || !equipmentForm.combustionEmissionFactor.trim()) {
      onError?.("Complete all equipment usage inputs before saving.");
      return;
    }
    if (!isValidNumber(totalFuelInput)) {
      onError?.("Total fuel must be a number.");
      return;
    }
    const combustionEmissionFactorInput = DEFAULT_EMISSION_FACTOR;
    const combustionEmissionFactorValue = Number(combustionEmissionFactorInput);
    if (!Number.isFinite(combustionEmissionFactorValue)) {
      onError?.("Combustion emission factor is not configured correctly.");
      return;
    }

    await onSaveTargetSection("equipmentUsage", {
      id: equipmentForm.id,
      timeframe: null,
      date: equipmentForm.date.trim(),
      equipmentOperationLogs: "",
      fuelRate: "",
      totalFuel: totalFuelInput,
      combustionEmissionFactor: combustionEmissionFactorInput,
    });
  };

  const handleSaveFuel = async () => {
    onResetFeedback?.();
    if (!ensureProjectAvailable()) {
      return;
    }
    const totalFuelInput = fuelForm.totalFuel.trim();
    if (!totalFuelInput) {
      onError?.("Provide the total fuel value.");
      return;
    }
    if (!isValidNumber(totalFuelInput)) {
      onError?.("Total fuel must be a number.");
      return;
    }

    const fuelEmissionFactorInput = DEFAULT_EMISSION_FACTOR;
    const fuelEmissionFactorValue = Number(fuelEmissionFactorInput);
    if (!Number.isFinite(fuelEmissionFactorValue)) {
      onError?.("Fuel emission factor is not configured correctly.");
      return;
    }

    await onSaveTargetSection("fuelConsumption", {
      id: fuelForm.id,
      timeframe: null,
      date: fuelForm.date.trim(),
      totalDistance: "",
      fuelEfficiency: "",
      totalFuel: totalFuelInput,
      fuelEmissionFactor: fuelEmissionFactorInput,
    });
  };

  const handleSaveWaste = async () => {
    onResetFeedback?.();
    if (!ensureProjectAvailable()) {
      return;
    }
    if (
      !wasteForm.totalWasteMass.trim() ||
      !wasteForm.percentByTreatment.trim() ||
      !wasteForm.emissionFactor.trim()
    ) {
      onError?.("Complete all waste tracking inputs before saving.");
      return;
    }
    if (!isValidNumber(wasteForm.totalWasteMass)) {
      onError?.("Total waste mass must be a number.");
      return;
    }
    if (!isValidNumber(wasteForm.percentByTreatment)) {
      onError?.("Percent by treatment must be a number.");
      return;
    }
    if (!isValidNumber(wasteForm.emissionFactor)) {
      onError?.("Emission factor must be a number.");
      return;
    }

    await onSaveTargetSection("wasteGenerated", {
      id: wasteForm.id,
      timeframe: null,
      date: wasteForm.date.trim(),
      totalWasteMass: wasteForm.totalWasteMass.trim(),
      percentByTreatment: wasteForm.percentByTreatment.trim(),
      emissionFactor: wasteForm.emissionFactor.trim(),
    });
  };

  const handleSaveWater = async () => {
    onResetFeedback?.();
    if (!ensureProjectAvailable()) {
      return;
    }
    if (
      !waterForm.totalWaterConsumed.trim() ||
      !waterForm.waterSupplyEmissionFactor.trim()
    ) {
      onError?.("Complete all water supply inputs before saving.");
      return;
    }
    if (!isValidNumber(waterForm.totalWaterConsumed)) {
      onError?.("Total water consumed must be a number.");
      return;
    }
    if (!isValidNumber(waterForm.waterSupplyEmissionFactor)) {
      onError?.("Water supply emission factor must be a number.");
      return;
    }

    await onSaveTargetSection("waterSupply", {
      id: waterForm.id,
      timeframe: null,
      date: waterForm.date.trim(),
      totalWaterConsumed: waterForm.totalWaterConsumed.trim(),
      waterSupplyEmissionFactor: waterForm.waterSupplyEmissionFactor.trim(),
    });
  };

  const handleSaveSafety = async () => {
    onResetFeedback?.();
    if (!ensureProjectAvailable()) {
      return;
    }
    if (
      !safetyForm.numberOfIncidents.trim() ||
      !safetyForm.totalEmployeeHours.trim()
    ) {
      onError?.("Provide the incident count and employee hours before saving.");
      return;
    }
    if (!isValidNumber(safetyForm.numberOfIncidents)) {
      onError?.("Number of incidents must be a number.");
      return;
    }
    if (!isValidNumber(safetyForm.totalEmployeeHours)) {
      onError?.("Total employee hours must be a number.");
      return;
    }

    await onSaveTargetSection("safetyIncident", {
      id: safetyForm.id,
      timeframe: null,
      date: safetyForm.date.trim(),
      numberOfIncidents: safetyForm.numberOfIncidents.trim(),
      totalEmployeeHours: safetyForm.totalEmployeeHours.trim(),
    });
  };

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
            Capture measurable ESG ambitions.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <TargetSectionCard
            title="Electricity Usage"
            description="Log the target date and baseline electricity consumption."
            onSave={() => {
              void handleSaveElectricity();
            }}
            disabled={!projectId}
            saving={sectionIsSaving("electricityUsage")}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Total Electricity Consumed (kWh)</Label>
                <Input
                  placeholder="e.g., 125000"
                  value={electricityForm.totalElectricityConsumed}
                  onChange={(event) =>
                    setElectricityForm((prev) => ({
                      ...prev,
                      totalElectricityConsumed: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </TargetSectionCard>

          <TargetSectionCard
            title="Equipment Usage"
            description="Log operating details for construction equipment."
            onSave={() => {
              void handleSaveEquipment();
            }}
            disabled={!projectId}
            saving={sectionIsSaving("equipmentUsage")}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Total Fuel (L)</Label>
                <Input
                  type="number"
                  step="any"
                  placeholder="e.g., 962"
                  value={equipmentForm.totalFuel}
                  onChange={(event) =>
                    setEquipmentForm((prev) => ({
                      ...prev,
                      totalFuel: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </TargetSectionCard>

          <TargetSectionCard
            title="Logistic Fuel Consumption"
            description="Track fuel consumption for logistics."
            onSave={() => {
              void handleSaveFuel();
            }}
            disabled={!projectId}
            saving={sectionIsSaving("fuelConsumption")}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Total Fuel (L)</Label>
                <Input
                  type="number"
                  step="any"
                  placeholder="e.g., 2666"
                  value={fuelForm.totalFuel}
                  onChange={(event) =>
                    setFuelForm((prev) => ({
                      ...prev,
                      totalFuel: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </TargetSectionCard>

          <TargetSectionCard
            title="Waste Generated"
            description="Capture disposal volumes and treatments."
            onSave={() => {
              void handleSaveWaste();
            }}
            disabled={!projectId}
            saving={sectionIsSaving("wasteGenerated")}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Total Waste Mass (kg)</Label>
                <Input
                  placeholder="e.g., 7800"
                  value={wasteForm.totalWasteMass}
                  onChange={(event) =>
                    setWasteForm((prev) => ({
                      ...prev,
                      totalWasteMass: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Percent by Treatment (%)</Label>
                <Input
                  placeholder="e.g., 45"
                  value={wasteForm.percentByTreatment}
                  onChange={(event) =>
                    setWasteForm((prev) => ({
                      ...prev,
                      percentByTreatment: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Emission Factor</Label>
                <Input
                  placeholder="e.g., 0.32"
                  value={wasteForm.emissionFactor}
                  onChange={(event) =>
                    setWasteForm((prev) => ({
                      ...prev,
                      emissionFactor: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </TargetSectionCard>

          <TargetSectionCard
            title="Water Supply"
            description="Track potable water demand and associated emissions."
            onSave={() => {
              void handleSaveWater();
            }}
            disabled={!projectId}
            saving={sectionIsSaving("waterSupply")}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Total Water Consumed (m³)</Label>
                <Input
                  placeholder="e.g., 410"
                  value={waterForm.totalWaterConsumed}
                  onChange={(event) =>
                    setWaterForm((prev) => ({
                      ...prev,
                      totalWaterConsumed: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Water Supply Emission Factor</Label>
                <Input
                  placeholder="e.g., 0.27"
                  value={waterForm.waterSupplyEmissionFactor}
                  onChange={(event) =>
                    setWaterForm((prev) => ({
                      ...prev,
                      waterSupplyEmissionFactor: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </TargetSectionCard>

          <TargetSectionCard
            title="Safety Incidents"
            description="Outline safety goals alongside leading metrics."
            onSave={() => {
              void handleSaveSafety();
            }}
            disabled={!projectId}
            saving={sectionIsSaving("safetyIncident")}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Number of Incidents</Label>
                <Input
                  placeholder="e.g., 0"
                  value={safetyForm.numberOfIncidents}
                  onChange={(event) =>
                    setSafetyForm((prev) => ({
                      ...prev,
                      numberOfIncidents: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Total Employee Hours</Label>
                <Input
                  placeholder="e.g., 4800"
                  value={safetyForm.totalEmployeeHours}
                  onChange={(event) =>
                    setSafetyForm((prev) => ({
                      ...prev,
                      totalEmployeeHours: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </TargetSectionCard>
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-100 pt-6 dark:border-gray-800 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-sm text-muted-foreground">
            Save at least one target before moving forward.
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
