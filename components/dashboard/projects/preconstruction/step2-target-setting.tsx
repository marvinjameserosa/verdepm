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
import {
  ChevronsUpDown,
  GanttChartSquare,
  Layers,
  Loader2,
  PlusCircle,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Material, MaterialStatus, units } from "./types";
import {
  ProjectEsgTargets,
  TargetSectionKey,
  TargetSectionValuesMap,
} from "@/types/preconstruction";

const DEFAULT_EMISSION_FACTOR = "2.68";

const computeTotalFuel = (operationLogs: string, fuelRate: string): string => {
  const logsInput = operationLogs.trim();
  const fuelRateInput = fuelRate.trim();
  if (!logsInput || !fuelRateInput) {
    return "";
  }
  const logsValue = Number(logsInput);
  const rateValue = Number(fuelRateInput);
  if (!Number.isFinite(logsValue) || !Number.isFinite(rateValue)) {
    return "";
  }
  const total = logsValue * rateValue;
  if (!Number.isFinite(total)) {
    return "";
  }
  return total.toString();
};

const computeFuelConsumptionTotal = (
  totalDistance: string,
  fuelEfficiency: string
): string => {
  const distanceInput = totalDistance.trim();
  const efficiencyInput = fuelEfficiency.trim();
  if (!distanceInput || !efficiencyInput) {
    return "";
  }
  const distanceValue = Number(distanceInput);
  const efficiencyValue = Number(efficiencyInput);
  if (!Number.isFinite(distanceValue) || !Number.isFinite(efficiencyValue)) {
    return "";
  }
  const total = distanceValue * efficiencyValue;
  if (!Number.isFinite(total)) {
    return "";
  }
  return total.toString();
};

type MaterialDraft = {
  category: string;
  name: string;
  supplier: string;
  cost: string;
  unit: string;
  notes: string;
  credentials?: string;
  status: MaterialStatus;
  warehouse?: string;
};

type Props = {
  onNext: () => void;
  onBack: () => void;
  onAddMaterial: (material: MaterialDraft, specSheet?: File | null) => Promise<void>;
  onDeleteMaterial: (materialId: string) => Promise<void>;
  projectId?: string | null;
  targets: ProjectEsgTargets;
  onSaveTargetSection: <K extends TargetSectionKey>(
    section: K,
    values: TargetSectionValuesMap[K]
  ) => Promise<void>;
  savingSection?: TargetSectionKey | null;
  onError?: (message: string) => void;
  onResetFeedback?: () => void;
  materials: Material[];
  isSavingMaterial: boolean;
  deletingMaterialId?: string | null;
};

export default function Step2TargetSetting({
  onNext,
  onBack,
  onAddMaterial,
  onDeleteMaterial,
  projectId,
  targets,
  onSaveTargetSection,
  savingSection,
  onError,
  onResetFeedback,
  materials,
  isSavingMaterial,
  deletingMaterialId,
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
    totalFuel: (() => {
      const computed = computeTotalFuel(
        targets.equipmentUsage?.equipmentOperationLogs ?? "",
        targets.equipmentUsage?.fuelRate ?? ""
      );
      if (computed !== "") {
        return computed;
      }
      return targets.equipmentUsage?.totalFuel ?? "";
    })(),
    combustionEmissionFactor:
      targets.equipmentUsage?.combustionEmissionFactor ?? DEFAULT_EMISSION_FACTOR,
  }));

  const [fuelForm, setFuelForm] = useState<
    TargetSectionValuesMap["fuelConsumption"]
  >(() => ({
    id: targets.fuelConsumption?.id ?? null,
    timeframe: targets.fuelConsumption?.timeframe ?? null,
    date: targets.fuelConsumption?.date ?? "",
    totalDistance: targets.fuelConsumption?.totalDistance ?? "",
    fuelEfficiency: targets.fuelConsumption?.fuelEfficiency ?? "",
    totalFuel: (() => {
      const computed = computeFuelConsumptionTotal(
        targets.fuelConsumption?.totalDistance ?? "",
        targets.fuelConsumption?.fuelEfficiency ?? ""
      );
      if (computed !== "") {
        return computed;
      }
      return targets.fuelConsumption?.totalFuel ?? "";
    })(),
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
      const computedTotalFuel = computeTotalFuel(
        source.equipmentOperationLogs ?? "",
        source.fuelRate ?? ""
      );
      const next = {
        id: source.id ?? null,
        timeframe: source.timeframe ?? null,
        date: source.date ?? "",
        equipmentOperationLogs: source.equipmentOperationLogs ?? "",
        fuelRate: source.fuelRate ?? "",
        totalFuel:
          computedTotalFuel !== ""
            ? computedTotalFuel
            : source.totalFuel ?? "",
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
      const computedTotalFuel = computeFuelConsumptionTotal(
        source.totalDistance ?? "",
        source.fuelEfficiency ?? ""
      );
      const next = {
        id: source.id ?? null,
        timeframe: source.timeframe ?? null,
        date: source.date ?? "",
        totalDistance: source.totalDistance ?? "",
        fuelEfficiency: source.fuelEfficiency ?? "",
        totalFuel:
          computedTotalFuel !== ""
            ? computedTotalFuel
            : source.totalFuel ?? "",
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

  const sectionIsSaving = (section: TargetSectionKey) => savingSection === section;

  const ensureProjectAvailable = () => {
    if (!projectId) {
      onError?.(
        "Save the project setup before defining ESG targets."
      );
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

  const isValidDate = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return true;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return false;
    }
    const parsed = new Date(trimmed);
    return !Number.isNaN(parsed.getTime());
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
    if (!isValidDate(electricityForm.date)) {
      onError?.("Target date must use the YYYY-MM-DD format.");
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
    const equipmentOperationLogsInput = equipmentForm.equipmentOperationLogs.trim();
    const fuelRateInput = equipmentForm.fuelRate.trim();
    if (
      !equipmentOperationLogsInput ||
      !fuelRateInput ||
      !equipmentForm.combustionEmissionFactor.trim()
    ) {
      onError?.("Complete all equipment usage inputs before saving.");
      return;
    }
    if (!isValidDate(equipmentForm.date)) {
      onError?.("Target date must use the YYYY-MM-DD format.");
      return;
    }
    if (!isValidNumber(equipmentOperationLogsInput)) {
      onError?.("Equipment operation logs must be a number.");
      return;
    }
    if (!isValidNumber(fuelRateInput)) {
      onError?.("Fuel rate must be a number.");
      return;
    }
    const combustionEmissionFactorInput = DEFAULT_EMISSION_FACTOR;
    const combustionEmissionFactorValue = Number(combustionEmissionFactorInput);
    if (!Number.isFinite(combustionEmissionFactorValue)) {
      onError?.("Combustion emission factor is not configured correctly.");
      return;
    }
    const computedTotalFuel = computeTotalFuel(
      equipmentOperationLogsInput,
      fuelRateInput
    );
    if (!computedTotalFuel) {
      onError?.("Total fuel could not be calculated. Check the inputs.");
      return;
    }
    const totalFuelValue = Number(computedTotalFuel);
    if (!Number.isFinite(totalFuelValue)) {
      onError?.("Total fuel calculation produced an invalid value.");
      return;
    }

    await onSaveTargetSection("equipmentUsage", {
      id: equipmentForm.id,
      timeframe: null,
      date: equipmentForm.date.trim(),
      equipmentOperationLogs: equipmentOperationLogsInput,
      fuelRate: fuelRateInput,
      totalFuel: computedTotalFuel,
      combustionEmissionFactor: combustionEmissionFactorInput,
    });
  };

  const handleSaveFuel = async () => {
    onResetFeedback?.();
    if (!ensureProjectAvailable()) {
      return;
    }
    const totalDistanceInput = fuelForm.totalDistance.trim();
    const fuelEfficiencyInput = fuelForm.fuelEfficiency.trim();
    if (!totalDistanceInput || !fuelEfficiencyInput) {
      onError?.("Provide the total distance and fuel efficiency values.");
      return;
    }
    if (!isValidDate(fuelForm.date)) {
      onError?.("Target date must use the YYYY-MM-DD format.");
      return;
    }
    if (!isValidNumber(totalDistanceInput)) {
      onError?.("Total distance must be a number.");
      return;
    }
    if (!isValidNumber(fuelEfficiencyInput)) {
      onError?.("Fuel efficiency must be a number.");
      return;
    }

    const fuelEmissionFactorInput = DEFAULT_EMISSION_FACTOR;
    const fuelEmissionFactorValue = Number(fuelEmissionFactorInput);
    if (!Number.isFinite(fuelEmissionFactorValue)) {
      onError?.("Fuel emission factor is not configured correctly.");
      return;
    }

    const computedTotalFuel = computeFuelConsumptionTotal(
      totalDistanceInput,
      fuelEfficiencyInput
    );
    if (!computedTotalFuel) {
      onError?.("Total fuel could not be calculated. Check the inputs.");
      return;
    }
    const totalFuelValue = Number(computedTotalFuel);
    if (!Number.isFinite(totalFuelValue)) {
      onError?.("Total fuel calculation produced an invalid value.");
      return;
    }

    await onSaveTargetSection("fuelConsumption", {
      id: fuelForm.id,
      timeframe: null,
      date: fuelForm.date.trim(),
      totalDistance: totalDistanceInput,
      fuelEfficiency: fuelEfficiencyInput,
      totalFuel: computedTotalFuel,
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
    if (!isValidDate(wasteForm.date)) {
      onError?.("Target date must use the YYYY-MM-DD format.");
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
    if (!isValidDate(waterForm.date)) {
      onError?.("Target date must use the YYYY-MM-DD format.");
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
    if (!isValidDate(safetyForm.date)) {
      onError?.("Target date must use the YYYY-MM-DD format.");
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
  const [newMaterial, setNewMaterial] = useState<Partial<Material>>({
    category: "",
    name: "",
    supplier: "",
    cost: "",
    unit: "",
    notes: "",
    status: "Identified",
  });
  const [warehouse, setWarehouse] = useState("");
  const [open, setOpen] = React.useState(false);
  const [specSheet, setSpecSheet] = useState<File | null>(null);

  const resetMaterialForm = () => {
    setNewMaterial({
      category: "",
      name: "",
      supplier: "",
      cost: "",
      unit: "",
      notes: "",
      credentials: "",
      status: "Identified",
    });
    setWarehouse("");
    setSpecSheet(null);
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewMaterial((prev) => ({ ...prev, [name]: value }));
  };

  const materialIsValid = useMemo(() => {
    return (
      !!newMaterial.category &&
      !!newMaterial.name &&
      !!newMaterial.supplier &&
      !!newMaterial.cost &&
      !!newMaterial.unit &&
      !!newMaterial.status
    );
  }, [
    newMaterial.category,
    newMaterial.name,
    newMaterial.supplier,
    newMaterial.cost,
    newMaterial.unit,
    newMaterial.status,
  ]);

  const handleAddMaterial = async () => {
    if (
      !materialIsValid
    ) {
      console.warn("Please fill all required fields");
      return;
    }

    try {
      await onAddMaterial(
        {
          category: newMaterial.category!,
          name: newMaterial.name!,
          supplier: newMaterial.supplier!,
          cost: newMaterial.cost!,
          unit: newMaterial.unit!,
          notes: newMaterial.notes ?? "",
          credentials: newMaterial.credentials,
          status: newMaterial.status!,
          warehouse,
        },
        specSheet
      );
      resetMaterialForm();
    } catch (error) {
      console.error("Failed to add material", error);
    }
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
              Step 2: Target Setting & Material Sourcing
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Capture measurable ESG ambitions, then log supporting materials and suppliers.
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
                <Label>Target Date</Label>
                <Input
                  type="date"
                  value={electricityForm.date}
                  onChange={(event) =>
                    setElectricityForm((prev) => ({
                      ...prev,
                      date: event.target.value,
                    }))
                  }
                />
              </div>
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
                <Label>Target Date</Label>
                <Input
                  type="date"
                  value={equipmentForm.date}
                  onChange={(event) =>
                    setEquipmentForm((prev) => ({
                      ...prev,
                      date: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Equipment Operation Logs (hrs)</Label>
                <Input
                  type="number"
                  step="any"
                  placeholder="e.g., 52"
                  value={equipmentForm.equipmentOperationLogs}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setEquipmentForm((prev) => {
                      const derivedTotal = computeTotalFuel(
                        nextValue,
                        prev.fuelRate
                      );
                      if (
                        prev.equipmentOperationLogs === nextValue &&
                        prev.totalFuel === derivedTotal
                      ) {
                        return prev;
                      }
                      return {
                        ...prev,
                        equipmentOperationLogs: nextValue,
                        totalFuel: derivedTotal,
                      };
                    });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Fuel Rate (L/hr)</Label>
                <Input
                  placeholder="e.g., 18.5"
                  value={equipmentForm.fuelRate}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setEquipmentForm((prev) => {
                      const derivedTotal = computeTotalFuel(
                        prev.equipmentOperationLogs,
                        nextValue
                      );
                      if (
                        prev.fuelRate === nextValue &&
                        prev.totalFuel === derivedTotal
                      ) {
                        return prev;
                      }
                      return {
                        ...prev,
                        fuelRate: nextValue,
                        totalFuel: derivedTotal,
                      };
                    });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Total Fuel (L)</Label>
                <div className="flex h-10 items-center rounded-md border border-input bg-background px-3 text-sm">
                  {equipmentForm.totalFuel ? equipmentForm.totalFuel : "--"}
                </div>
              </div>
            </div>
          </TargetSectionCard>

          <TargetSectionCard
            title="Fuel Consumption"
            description="Track distance and fuel efficiency for logistics."
            onSave={() => {
              void handleSaveFuel();
            }}
            disabled={!projectId}
            saving={sectionIsSaving("fuelConsumption")}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Target Date</Label>
                <Input
                  type="date"
                  value={fuelForm.date}
                  onChange={(event) =>
                    setFuelForm((prev) => ({
                      ...prev,
                      date: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Total Distance (km)</Label>
                <Input
                  placeholder="e.g., 430"
                  value={fuelForm.totalDistance}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setFuelForm((prev) => {
                      const derivedTotal = computeFuelConsumptionTotal(
                        nextValue,
                        prev.fuelEfficiency
                      );
                      if (
                        prev.totalDistance === nextValue &&
                        prev.totalFuel === derivedTotal
                      ) {
                        return prev;
                      }
                      return {
                        ...prev,
                        totalDistance: nextValue,
                        totalFuel: derivedTotal,
                      };
                    });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Fuel Efficiency (km/L)</Label>
                <Input
                  placeholder="e.g., 6.2"
                  value={fuelForm.fuelEfficiency}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setFuelForm((prev) => {
                      const derivedTotal = computeFuelConsumptionTotal(
                        prev.totalDistance,
                        nextValue
                      );
                      if (
                        prev.fuelEfficiency === nextValue &&
                        prev.totalFuel === derivedTotal
                      ) {
                        return prev;
                      }
                      return {
                        ...prev,
                        fuelEfficiency: nextValue,
                        totalFuel: derivedTotal,
                      };
                    });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Total Fuel (L)</Label>
                <div className="flex h-10 items-center rounded-md border border-input bg-background px-3 text-sm">
                  {fuelForm.totalFuel ? fuelForm.totalFuel : "--"}
                </div>
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
                <Label>Target Date</Label>
                <Input
                  type="date"
                  value={wasteForm.date}
                  onChange={(event) =>
                    setWasteForm((prev) => ({
                      ...prev,
                      date: event.target.value,
                    }))
                  }
                />
              </div>
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
                <Label>Target Date</Label>
                <Input
                  type="date"
                  value={waterForm.date}
                  onChange={(event) =>
                    setWaterForm((prev) => ({
                      ...prev,
                      date: event.target.value,
                    }))
                  }
                />
              </div>
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
                <Label>Target Date</Label>
                <Input
                  type="date"
                  value={safetyForm.date}
                  onChange={(event) =>
                    setSafetyForm((prev) => ({
                      ...prev,
                      date: event.target.value,
                    }))
                  }
                />
              </div>
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

        <Card className="border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950/40">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Material Sourcing & Due Diligence
              </CardTitle>
            </div>
            <CardDescription>
              Capture the sourcing pipeline for critical project materials and suppliers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Material Category</Label>
                <Select
                  value={newMaterial.category || ""}
                  onValueChange={(value) => handleSelectChange("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Material" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Concrete">Concrete</SelectItem>
                    <SelectItem value="Masonry">Masonry</SelectItem>
                    <SelectItem value="Structural Steel">Structural Steel</SelectItem>
                    <SelectItem value="Carpentry">Carpentry</SelectItem>
                    <SelectItem value="Roofing & Waterproofing">Roofing & Waterproofing</SelectItem>
                    <SelectItem value="Doors & Windows">Doors & Windows</SelectItem>
                    <SelectItem value="Interior Finishes">Interior Finishes</SelectItem>
                    <SelectItem value="Plumbing">Plumbing</SelectItem>
                    <SelectItem value="Electrical">Electrical</SelectItem>
                    <SelectItem value="Landscaping">Landscaping</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Planned Supplier</Label>
                <Input
                  placeholder="e.g., KLH Massivholz"
                  value={newMaterial.supplier || ""}
                  onChange={(event) =>
                    setNewMaterial({
                      ...newMaterial,
                      supplier: event.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Material Name</Label>
              <Input
                placeholder="e.g., Cross-Laminated Timber"
                value={newMaterial.name || ""}
                onChange={(event) =>
                  setNewMaterial({ ...newMaterial, name: event.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Warehouse of the supplier</Label>
              <Input
                placeholder="e.g., '456 Logistics Rd, Industrial Park'"
                value={warehouse}
                onChange={(event) => setWarehouse(event.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Budgeted Cost ($)</Label>
                <Input
                  type="number"
                  placeholder="150000"
                  value={newMaterial.cost || ""}
                  onChange={(event) =>
                    setNewMaterial({
                      ...newMaterial,
                      cost: event.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="flex w-full justify-between border-gray-300 bg-white/80 dark:border-gray-700 dark:bg-gray-900/80"
                    >
                      {newMaterial.unit
                        ? units.find((unit) => unit.value === newMaterial.unit)?.label
                        : "Select unit..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Search unit..." />
                      <CommandEmpty>No unit found.</CommandEmpty>
                      <CommandGroup>
                        {units.map((unit) => (
                          <CommandItem
                            key={unit.value}
                            value={unit.value}
                            onSelect={(currentValue) => {
                              handleSelectChange(
                                "unit",
                                currentValue === newMaterial.unit ? "" : currentValue
                              );
                              setOpen(false);
                            }}
                          >
                            {unit.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Sustainability Credentials</Label>
              <Input
                placeholder="e.g., FSC Certified, EPD Available"
                value={newMaterial.credentials || ""}
                onChange={(event) =>
                  setNewMaterial({
                    ...newMaterial,
                    credentials: event.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center">
                <Search className="mr-2 h-4 w-4" /> Supplier Vetting Notes
              </Label>
              <Textarea
                placeholder="Document your due diligence here. Why this supplier? ESG score? Transport distance?"
                value={newMaterial.notes || ""}
                onChange={(event) =>
                  setNewMaterial({ ...newMaterial, notes: event.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center">
                  <Upload className="mr-2 h-4 w-4" /> Upload Spec Sheet/EPD
                </Label>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    setSpecSheet(file ?? null);
                  }}
                />
                {specSheet && (
                  <p className="truncate text-xs text-muted-foreground">
                    Selected: {specSheet.name}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Vetting Status</Label>
                <Select
                  name="status"
                  value={newMaterial.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vetted">Vetted</SelectItem>
                    <SelectItem value="Identified">Identified</SelectItem>
                    <SelectItem value="Denied">Denied</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={handleAddMaterial}
                disabled={isSavingMaterial || !materialIsValid}
              >
                {isSavingMaterial ? (
                  "Saving..."
                ) : (
                  <span className="flex items-center">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add to Sourcing Plan
                  </span>
                )}
              </Button>
            </div>
            <div className="space-y-3 border-t border-dashed border-gray-200 pt-6 dark:border-gray-800">
              <h5 className="text-sm font-medium text-muted-foreground">Materials Added</h5>
              {materials.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Log at least one sourced item to complete this stage.
                </p>
              ) : (
                <div className="grid gap-3">
                  {materials.map((material) => (
                    <div
                      key={material.id}
                      className="rounded-lg border border-gray-200 bg-white/80 p-3 text-sm dark:border-gray-800 dark:bg-gray-900/60"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="font-semibold text-emerald-700 dark:text-emerald-200">
                            {material.name}
                          </div>
                          <div className="text-muted-foreground">
                            {material.supplier} • {material.unit ?? "--"}
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <span>Status: {material.status}</span>
                            {material.credentials && <span>• {material.credentials}</span>}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50"
                          onClick={() => {
                            void onDeleteMaterial(material.id);
                          }}
                          disabled={isSavingMaterial || deletingMaterialId === material.id}
                          aria-label="Delete material"
                        >
                          {deletingMaterialId === material.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 border-t border-gray-100 pt-6 dark:border-gray-800 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-sm text-muted-foreground">
            Save at least one target and one material before moving forward.
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
