import { useState, useMemo } from "react";
import {
  WasteEntry,
  WasteFormEntry,
  WasteEntrySummary,
  WasteTreatmentMethod,
  WASTE_EMISSION_FACTORS_KG_PER_KG,
  WASTE_TYPE_SPECIFIC_EMISSION_FACTORS,
} from "@/types/construction";

const createDefaultWasteFormEntry = (): WasteFormEntry => ({
  mass: "",
  unit: "kg",
  wasteType: "",
  treatmentMethod: "",
  treatmentPercentage: "",
});

const convertWasteMassToKg = (mass: number, unit: "kg" | "ton") =>
  unit === "ton" ? mass * 1_000 : mass;

export function useWasteManagement() {
  const [wasteEntries, setWasteEntries] = useState<WasteEntry[]>([]);
  const [newWasteEntry, setNewWasteEntry] = useState<WasteFormEntry>(
    createDefaultWasteFormEntry()
  );

  const handleWasteEntryChange = (
    field: keyof WasteFormEntry,
    value: string
  ) => {
    setNewWasteEntry((prev) => {
      if (field === "unit") {
        return { ...prev, unit: value as WasteFormEntry["unit"] };
      }

      if (field === "treatmentMethod") {
        return {
          ...prev,
          treatmentMethod: value as WasteFormEntry["treatmentMethod"],
        };
      }

      return { ...prev, [field]: value };
    });
  };

  const addWasteEntry = (
    setErrorMessage: (msg: string) => void,
    setStatusMessage: (msg: string) => void
  ) => {
    if (!newWasteEntry.mass.trim()) {
      setErrorMessage("Enter the total mass before adding a waste record.");
      return;
    }

    const parsedMass = Number(newWasteEntry.mass);

    if (!Number.isFinite(parsedMass) || parsedMass <= 0) {
      setErrorMessage("Waste mass must be a valid positive number.");
      return;
    }

    if (!newWasteEntry.wasteType) {
      setErrorMessage("Select a waste type before adding.");
      return;
    }

    if (!newWasteEntry.treatmentMethod) {
      setErrorMessage("Select a treatment method before adding.");
      return;
    }

    if (!newWasteEntry.treatmentPercentage.trim()) {
      setErrorMessage("Enter the treatment percentage before adding.");
      return;
    }

    const parsedPercentage = Number(newWasteEntry.treatmentPercentage);

    if (!Number.isFinite(parsedPercentage) || parsedPercentage <= 0) {
      setErrorMessage("Treatment percentage must be a valid positive number.");
      return;
    }

    if (parsedPercentage > 100) {
      setErrorMessage("Treatment percentage cannot exceed 100%.");
      return;
    }

    const existingPercentageTotal = wasteEntries
      .filter((entry) => entry.wasteType === newWasteEntry.wasteType)
      .reduce(
        (total, entry) => total + Number(entry.treatmentPercentage || "0"),
        0
      );

    if (existingPercentageTotal + parsedPercentage > 100.0001) {
      setErrorMessage(
        "Treatment percentages for this waste type would exceed 100%. Adjust the allocation before adding another entry."
      );
      return;
    }

    const updatedAllocation = existingPercentageTotal + parsedPercentage;

    const entry: WasteEntry = {
      id: crypto.randomUUID(),
      mass: newWasteEntry.mass,
      unit: newWasteEntry.unit,
      wasteType: newWasteEntry.wasteType,
      treatmentMethod: newWasteEntry.treatmentMethod as WasteTreatmentMethod,
      treatmentPercentage: parsedPercentage.toString(),
    };

    setWasteEntries((prev) => [...prev, entry]);
    setNewWasteEntry(createDefaultWasteFormEntry());
    setStatusMessage(
      `Waste entry recorded. ${
        entry.wasteType
      } allocation now ${updatedAllocation.toFixed(2)}% of 100%.`
    );
  };

  const removeWasteEntry = (
    id: string,
    setStatusMessage: (msg: string) => void
  ) => {
    setWasteEntries((prev) => prev.filter((entry) => entry.id !== id));
    setStatusMessage(
      "Waste entry removed. Re-check percentage totals before submitting."
    );
  };

  const wasteEntrySummaries = useMemo(
    () =>
      wasteEntries.map((entry) => {
        const parsedMass = Number(entry.mass);
        const massKg = Number.isFinite(parsedMass)
          ? convertWasteMassToKg(parsedMass, entry.unit)
          : 0;
        const percentageValue = Number(entry.treatmentPercentage);
        const normalizedPercentage = Number.isFinite(percentageValue)
          ? Math.max(0, percentageValue) / 100
          : 0;

        // Try to find a specific factor for the waste type and treatment method
        const specificFactor =
          WASTE_TYPE_SPECIFIC_EMISSION_FACTORS[entry.wasteType]?.[
            entry.treatmentMethod
          ];

        // Fallback to the generic factor if no specific factor is found
        const emissionFactor =
          specificFactor ??
          WASTE_EMISSION_FACTORS_KG_PER_KG[entry.treatmentMethod] ??
          0;

        const allocatedMassKg = massKg * normalizedPercentage;
        const emissionKg = allocatedMassKg * emissionFactor;

        return {
          ...entry,
          massKg,
          allocatedMassKg,
          emissionKg,
          emissionFactor,
          percentageValue: Number.isFinite(percentageValue)
            ? percentageValue
            : 0,
        } satisfies WasteEntrySummary;
      }),
    [wasteEntries]
  );

  const totalWasteInputMassKg = useMemo(() => {
    const highestMassByType = new Map<string, number>();

    for (const entry of wasteEntrySummaries) {
      const previous = highestMassByType.get(entry.wasteType) ?? 0;
      if (entry.massKg > previous) {
        highestMassByType.set(entry.wasteType, entry.massKg);
      }
    }

    let sum = 0;
    highestMassByType.forEach((value) => {
      sum += value;
    });

    return sum;
  }, [wasteEntrySummaries]);

  const totalAllocatedWasteMassKg = useMemo(
    () =>
      wasteEntrySummaries.reduce(
        (total, entry) => total + entry.allocatedMassKg,
        0
      ),
    [wasteEntrySummaries]
  );

  const computedMonthlyWasteEmissions = useMemo(
    () =>
      wasteEntrySummaries.reduce((total, entry) => total + entry.emissionKg, 0),
    [wasteEntrySummaries]
  );

  return {
    wasteEntries,
    setWasteEntries,
    newWasteEntry,
    setNewWasteEntry,
    handleWasteEntryChange,
    addWasteEntry,
    removeWasteEntry,
    wasteEntrySummaries,
    totalWasteInputMassKg,
    totalAllocatedWasteMassKg,
    computedMonthlyWasteEmissions,
    createDefaultWasteFormEntry,
  };
}
