"use client";

import { useState } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Zap, Droplets, Send } from "lucide-react";
import type { Project } from "@/types/project";
import {
  MonthlyMetricKey,
  EQUIPMENT_EMISSION_FACTOR_KG_PER_LITER,
  TRIR_STANDARD_HOURS,
  SourcedMaterial,
} from "@/types/construction";

import { useConstructionMetrics } from "@/hooks/use-construction-metrics";
import { useWasteManagement } from "@/hooks/use-waste-management";
import { useRouteAnimation } from "@/hooks/use-route-animation";
import { useSourcingMaterials } from "@/hooks/use-sourcing-materials";
import { submitConstructionLog } from "@/actions/construction/submit";
import { addMaterialFuel } from "@/actions/preconstruction/update-material";

import { MetricCard } from "./construction/metric-card";
import { DistanceFuelCard } from "./construction/distance-fuel-card";

import { WasteEmissionsCard } from "./construction/waste-emissions-card";
import { DeliveryRouteSection } from "./construction/delivery-route-section";
import { MaterialSourcingSection } from "./construction/material-sourcing-section";

// --- Default Targets from Pre-Construction Phase ---
const preConstructionTargets = {
  emissions: {
    goal: "Reduce Embodied & Operational Carbon",
    metric: "< 500 kgCO2e/m²",
  },
  water: {
    goal: "Achieve Net-Zero Water",
    metric: "100% rainwater harvesting",
  },
  waste: {
    goal: "Divert 90% of Waste from Landfill",
    metric: "90% by weight",
  },
  safety: { goal: "Maintain a Zero-Incident Site", metric: "0 LTI" },
};

type ConstructionPhaseProps = {
  project: Project;
};

export default function ConstructionPhase({ project }: ConstructionPhaseProps) {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmittingDaily, setIsSubmittingDaily] = useState(false);
  const [isSubmittingMonthly, setIsSubmittingMonthly] = useState(false);
  const [isSavingFuel, setIsSavingFuel] = useState(false);
  const [activeTab, setActiveTab] = useState<"monitoring" | "logistics">(
    "monitoring"
  );

  // Logistics State
  const [selectedMaterial, setSelectedMaterial] =
    useState<SourcedMaterial | null>(null);

  const {
    dailyMetrics,
    setDailyMetrics,
    monthlyMetrics,
    setMonthlyMetrics,
    handleDailyInputChange,
    handleMonthlyInputChange,
    computedFuelLiters,
    computedEquipmentTotals,
    computedSafetyTrir,
    computedMonthlyElectricityEmissions,
    computedMonthlyWaterEmissions,
  } = useConstructionMetrics();

  const {
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
  } = useWasteManagement();

  const {
    routeStartQuery,
    setRouteStartQuery,
    routeEndQuery,
    setRouteEndQuery,
    routeFuelLiters,
    setRouteFuelLiters,
    routeDistanceKm,
    routeDurationMinutes,
    startLabel,
    endLabel,
    mapDisplayCenter,
    startCoordinate,
    endCoordinate,
    truckPosition,
    routePoints,
    isFetchingRoute,
    isAnimatingRoute,
    handleAnimateRoute,
  } = useRouteAnimation();

  const {
    sourcingMaterials,
    materialFetchError,
    materialLoading,
    refreshMaterials,
  } = useSourcingMaterials(project?.id);

  const resetMessages = () => {
    setStatusMessage(null);
    setErrorMessage(null);
  };

  const handleSelectLogisticsMaterial = (material: SourcedMaterial) => {
    setSelectedMaterial(material);
    setActiveTab("logistics");
    // Pre-fill route if warehouse exists
    if (material.warehouse) {
      setRouteStartQuery(material.warehouse);
    } else {
      setRouteStartQuery("");
    }
    // Pre-fill destination with project location
    if (project.location) {
      setRouteEndQuery(project.location);
    }
    // Reset other route states
    setRouteFuelLiters("");
    // Note: We can't easily reset routeDistanceKm etc. without exposing resetters from the hook,
    // but setting queries is a good start.
  };

  const handleApplyRouteFuel = async () => {
    resetMessages();
    if (routeDistanceKm === null || routeDistanceKm <= 0) {
      setErrorMessage("Calculate a valid route before applying fuel data.");
      return;
    }

    const fuelToApply =
      computedFuelLiters !== null
        ? computedFuelLiters
        : Number(routeFuelLiters);

    if (!fuelToApply && fuelToApply !== 0) {
      setErrorMessage(
        "Ensure fuel consumption is calculated or entered before applying."
      );
      return;
    }

    if (Number.isNaN(fuelToApply) || fuelToApply < 0) {
      setErrorMessage("Fuel consumption must be a valid non-negative number.");
      return;
    }

    // Accumulate into daily metrics
    setDailyMetrics((prev) => {
      const currentDistance = Number(prev.distanceKm) || 0;
      // If we have a current efficiency, we can calculate current fuel
      const currentEfficiency = Number(prev.fuelEfficiency) || 0;
      const currentFuel = currentDistance * currentEfficiency;

      const newTotalDistance = currentDistance + routeDistanceKm;
      const newTotalFuel = currentFuel + fuelToApply;

      // Recalculate average efficiency
      const newEfficiency =
        newTotalDistance > 0 ? newTotalFuel / newTotalDistance : 0;

      return {
        ...prev,
        distanceKm: newTotalDistance.toFixed(2),
        fuelEfficiency: newEfficiency.toFixed(3),
      };
    });

    // If a material is selected, update its fuel summary
    if (selectedMaterial) {
      setIsSavingFuel(true);
      try {
        await addMaterialFuel(selectedMaterial.id, fuelToApply);
        refreshMaterials();
        setStatusMessage(
          `Added ${fuelToApply.toFixed(2)}L fuel from ${
            selectedMaterial.name
          } to daily total and material record.`
        );
      } catch (error) {
        console.error("Failed to update material fuel", error);
        setErrorMessage("Failed to update material fuel summary.");
      } finally {
        setIsSavingFuel(false);
      }
    } else {
      setStatusMessage(`Added ${fuelToApply.toFixed(2)}L fuel to daily total.`);
    }
  };

  const parseNumber = (value: string) => {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    if (Number.isNaN(parsed)) {
      throw new Error("One of the numeric fields contains invalid data.");
    }
    return parsed;
  };

  const handleSaveDaily = async () => {
    resetMessages();
    const hasDailyMetrics = Object.values(dailyMetrics).some(
      (value) => value.trim() !== ""
    );

    if (!hasDailyMetrics) {
      setErrorMessage("Enter at least one daily metric before saving.");
      return;
    }

    setIsSubmittingDaily(true);

    try {
      const distanceValue = parseNumber(dailyMetrics.distanceKm);
      const efficiencyValue = parseNumber(dailyMetrics.fuelEfficiency);
      const equipmentHoursValue = parseNumber(dailyMetrics.equipmentHours);
      const equipmentFuelRateValue = parseNumber(
        dailyMetrics.equipmentFuelRate
      );
      const incidentCountValue = parseNumber(dailyMetrics.incidentCount);
      const hoursWorkedValue = parseNumber(dailyMetrics.hoursWorked);

      if (
        (distanceValue !== null && efficiencyValue === null) ||
        (distanceValue === null && efficiencyValue !== null)
      ) {
        throw new Error(
          "Provide both total distance and fuel efficiency to compute fuel usage."
        );
      }

      if (
        (equipmentHoursValue !== null && equipmentFuelRateValue === null) ||
        (equipmentHoursValue === null && equipmentFuelRateValue !== null)
      ) {
        throw new Error(
          "Provide both equipment hours and fuel rate to compute equipment emissions."
        );
      }

      if (
        (incidentCountValue !== null && hoursWorkedValue === null) ||
        (incidentCountValue === null && hoursWorkedValue !== null)
      ) {
        throw new Error(
          "Provide both number of incidents and total hours worked to compute TRIR."
        );
      }

      if (incidentCountValue !== null && incidentCountValue < 0) {
        throw new Error("Number of incidents cannot be negative.");
      }

      if (hoursWorkedValue !== null && hoursWorkedValue <= 0) {
        throw new Error("Total hours worked must be greater than zero.");
      }

      const fuelConsumptionLiters =
        distanceValue !== null && efficiencyValue !== null
          ? Number((distanceValue * efficiencyValue).toFixed(4))
          : null;
      const fuelTco2e =
        fuelConsumptionLiters !== null
          ? Number((fuelConsumptionLiters * 2.68).toFixed(4))
          : null;

      const equipmentFuelConsumptionLiters =
        equipmentHoursValue !== null && equipmentFuelRateValue !== null
          ? equipmentHoursValue * equipmentFuelRateValue
          : null;
      const equipmentEmissionsKg =
        equipmentFuelConsumptionLiters !== null
          ? Number(
              (
                equipmentFuelConsumptionLiters *
                EQUIPMENT_EMISSION_FACTOR_KG_PER_LITER
              ).toFixed(4)
            )
          : null;

      const scope1 =
        (fuelTco2e !== null ? fuelTco2e : 0) +
        (equipmentEmissionsKg !== null ? equipmentEmissionsKg : 0);

      const safetyTrirRaw =
        incidentCountValue !== null && hoursWorkedValue !== null
          ? (incidentCountValue * TRIR_STANDARD_HOURS) / hoursWorkedValue
          : null;

      const safetyTrirRounded =
        safetyTrirRaw !== null && Number.isFinite(safetyTrirRaw)
          ? Math.round(safetyTrirRaw)
          : null;

      const dailyData = {
        fuelConsumptionLiters,
        equipmentEmissionsKg,
        safetyTrirRounded,
        scope1,
        incidentCount: incidentCountValue,
        hoursWorked: hoursWorkedValue,
      };

      const result = await submitConstructionLog({
        projectId: project.id,
        date: new Date().toISOString().slice(0, 10),
        metricsPeriod: "daily",
        dailyData,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      let fuelSummary = "";
      let equipmentSummary = "";
      let safetySummary = "";

      if (dailyData.fuelConsumptionLiters !== null) {
        fuelSummary = ` Calculated fuel usage: ${dailyData.fuelConsumptionLiters.toFixed(
          2
        )} L.`;
      }
      if (dailyData.equipmentEmissionsKg !== null) {
        equipmentSummary = ` Equipment emissions: ${dailyData.equipmentEmissionsKg.toFixed(
          2
        )} kg CO₂e.`;
      }
      if (dailyData.safetyTrirRounded !== null) {
        safetySummary = ` Safety TRIR recorded: ${
          dailyData.safetyTrirRounded
        } (Incidents: ${dailyData.incidentCount ?? 0}, Hours: ${
          dailyData.hoursWorked ?? 0
        }).`;
      }

      const combinedSummary = `${fuelSummary}${equipmentSummary}${safetySummary}`;
      const warningSummary =
        result.warnings && result.warnings.length > 0
          ? ` ${result.warnings.join(" ")}`
          : "";

      setStatusMessage(
        `Daily report saved successfully.${combinedSummary}${warningSummary}`.trim()
      );

      setDailyMetrics({
        distanceKm: "",
        fuelEfficiency: "",
        equipmentHours: "",
        equipmentFuelRate: "",
        incidentCount: "",
        hoursWorked: "",
      });
    } catch (error) {
      console.error("Failed to submit daily report", error);
      const message =
        error instanceof Error ? error.message : "Unable to submit report.";
      setErrorMessage(message);
    } finally {
      setIsSubmittingDaily(false);
    }
  };

  const handleSaveMonthly = async () => {
    resetMessages();
    const hasMonthlyMetrics = Object.values(monthlyMetrics).some(
      (value) => value.trim() !== ""
    );
    const hasWasteEntries = wasteEntries.length > 0;

    if (!hasMonthlyMetrics && !hasWasteEntries) {
      setErrorMessage(
        "Enter at least one monthly metric or waste record before saving."
      );
      return;
    }

    setIsSubmittingMonthly(true);

    try {
      const rawElectricityKwh = parseNumber(monthlyMetrics.electricity) ?? 0;
      const rawWaterCubicM = parseNumber(monthlyMetrics.water) ?? 0;
      const rawWaste =
        hasWasteEntries && wasteEntries.length > 0
          ? wasteEntries.reduce(
              (sum, entry) =>
                sum + Number(entry.mass) * (entry.unit === "ton" ? 1000 : 1),
              0
            )
          : 0;

      const electricityEmissionsKg =
        computedMonthlyElectricityEmissions !== null
          ? Number(computedMonthlyElectricityEmissions.toFixed(4))
          : null;
      const scope2 =
        electricityEmissionsKg !== null
          ? Number(electricityEmissionsKg.toFixed(4))
          : null;

      const waterEmissionsKg =
        computedMonthlyWaterEmissions !== null
          ? Number(computedMonthlyWaterEmissions.toFixed(4))
          : null;

      const wasteEmissionsKg =
        computedMonthlyWasteEmissions > 0
          ? Number(computedMonthlyWasteEmissions.toFixed(4))
          : null;

      const scope3 =
        (wasteEmissionsKg !== null ? wasteEmissionsKg : 0) +
        (waterEmissionsKg !== null ? waterEmissionsKg : 0);

      const monthlyData = {
        rawElectricityKwh,
        rawWaterCubicM,
        rawWasteKg: rawWaste,
        electricityEmissionsKg,
        waterEmissionsKg,
        wasteEmissionsKg,
        scope2,
        scope3,
      };

      const result = await submitConstructionLog({
        projectId: project.id,
        date: new Date().toISOString().slice(0, 10),
        metricsPeriod: "monthly",
        monthlyData,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      let electricitySummary = "";
      let waterSummary = "";
      let wasteSummary = "";

      if (monthlyData.electricityEmissionsKg !== null) {
        electricitySummary = ` Electricity emissions: ${monthlyData.electricityEmissionsKg.toFixed(
          2
        )} kg CO₂e.`;
      }
      if (monthlyData.waterEmissionsKg !== null) {
        waterSummary = ` Water emissions: ${monthlyData.waterEmissionsKg.toFixed(
          2
        )} kg CO₂e.`;
      }
      if (monthlyData.wasteEmissionsKg !== null) {
        wasteSummary = ` Waste emissions: ${monthlyData.wasteEmissionsKg.toFixed(
          2
        )} kg CO₂e.`;
      }

      const combinedSummary = `${electricitySummary}${waterSummary}${wasteSummary}`;
      const warningSummary =
        result.warnings && result.warnings.length > 0
          ? ` ${result.warnings.join(" ")}`
          : "";

      setStatusMessage(
        `Monthly metrics saved successfully.${combinedSummary}${warningSummary}`.trim()
      );

      setMonthlyMetrics({
        electricity: "",
        water: "",
      });
      setWasteEntries([]);
      setNewWasteEntry(createDefaultWasteFormEntry());
    } catch (error) {
      console.error("Failed to submit monthly report", error);
      const message =
        error instanceof Error ? error.message : "Unable to submit report.";
      setErrorMessage(message);
    } finally {
      setIsSubmittingMonthly(false);
    }
  };

  const monthlyMetricConfigs = [
    {
      id: "electricity",
      icon: <Zap className="h-4 w-4 text-muted-foreground" />,
      title: "Electricity Usage",
      unit: "kWh",
      relatedTarget: preConstructionTargets.emissions,
    },
    {
      id: "water",
      icon: <Droplets className="h-4 w-4 text-muted-foreground" />,
      title: "Water Consumption",
      unit: "m³",
      relatedTarget: preConstructionTargets.water,
    },
  ] as const;

  const monitoringTitle =
    activeTab === "logistics"
      ? "Construction Phase: Logistics & Delivery Planning"
      : "Construction Phase: Site Monitoring";

  const monitoringDescription =
    activeTab === "logistics"
      ? "Plan material deliveries and calculate route fuel consumption."
      : "Track daily and monthly environmental metrics and safety performance.";

  return (
    <div className="space-y-6">
      <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-white/30 dark:border-gray-700/30 rounded-xl">
        <CardHeader>
          <CardTitle className="text-emerald-700 dark:text-emerald-300">
            {monitoringTitle}
          </CardTitle>
          <CardDescription>{monitoringDescription}</CardDescription>
        </CardHeader>
      </Card>

      {errorMessage ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}
      {statusMessage ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {statusMessage}
        </div>
      ) : null}

      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as "monitoring" | "logistics")
        }
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="monitoring">Construction Data</TabsTrigger>
          <TabsTrigger value="logistics">
            Material Delivery & Logistics
          </TabsTrigger>
        </TabsList>
        <TabsContent value="monitoring">
          <div className="space-y-6">
            {/* Daily Inputs Section */}
            <DistanceFuelCard
              equipmentHours={dailyMetrics.equipmentHours}
              equipmentFuelRate={dailyMetrics.equipmentFuelRate}
              onEquipmentHoursChange={(value) =>
                handleDailyInputChange("equipmentHours", value)
              }
              onEquipmentFuelRateChange={(value) =>
                handleDailyInputChange("equipmentFuelRate", value)
              }
              computedEquipmentFuelLiters={computedEquipmentTotals.fuelLiters}
              computedEquipmentCo2Kg={computedEquipmentTotals.co2Kg}
              incidentCount={dailyMetrics.incidentCount}
              hoursWorked={dailyMetrics.hoursWorked}
              onIncidentCountChange={(value) =>
                handleDailyInputChange("incidentCount", value)
              }
              onHoursWorkedChange={(value) =>
                handleDailyInputChange("hoursWorked", value)
              }
              computedTrir={computedSafetyTrir}
              safetyTarget={preConstructionTargets.safety}
              onSave={handleSaveDaily}
              isSaving={isSubmittingDaily}
            />

            {/* Monthly Inputs Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {monthlyMetricConfigs.map((metric) => {
                const isElectricity = metric.id === "electricity";
                const isWater = metric.id === "water";
                let secondaryValue: string | null | undefined;

                if (isElectricity) {
                  secondaryValue =
                    computedMonthlyElectricityEmissions !== null
                      ? computedMonthlyElectricityEmissions.toFixed(2)
                      : null;
                } else if (isWater) {
                  secondaryValue =
                    computedMonthlyWaterEmissions !== null
                      ? computedMonthlyWaterEmissions.toFixed(2)
                      : null;
                }

                return (
                  <MetricCard
                    key={metric.id}
                    {...metric}
                    value={monthlyMetrics[metric.id as MonthlyMetricKey]}
                    onChange={(value) =>
                      handleMonthlyInputChange(
                        metric.id as MonthlyMetricKey,
                        value
                      )
                    }
                    labelPrefix="This Month's"
                    secondaryLabel={
                      isElectricity || isWater ? "Total CO₂e (kg):" : undefined
                    }
                    secondaryValue={secondaryValue}
                    onSave={handleSaveMonthly}
                    isSaving={isSubmittingMonthly}
                  />
                );
              })}
            </div>
            <WasteEmissionsCard
              newEntry={newWasteEntry}
              onEntryChange={handleWasteEntryChange}
              onAddEntry={() =>
                addWasteEntry(setErrorMessage, setStatusMessage)
              }
              entries={wasteEntrySummaries}
              onRemoveEntry={(id) => removeWasteEntry(id, setStatusMessage)}
              totalAllocatedMassKg={totalAllocatedWasteMassKg}
              totalInputMassKg={totalWasteInputMassKg}
              totalEmissionsKg={computedMonthlyWasteEmissions}
              onSave={handleSaveMonthly}
              isSaving={isSubmittingMonthly}
            />
          </div>
        </TabsContent>
        <TabsContent value="logistics">
          <div className="space-y-6">
            <MaterialSourcingSection
              materialLoading={materialLoading}
              sourcingMaterials={sourcingMaterials}
              materialFetchError={materialFetchError}
              onOpenLogisticsModal={handleSelectLogisticsMaterial}
              projectId={project.id}
              onMaterialUpdated={refreshMaterials}
            />
            <DeliveryRouteSection
              routeStartQuery={routeStartQuery}
              setRouteStartQuery={setRouteStartQuery}
              routeEndQuery={routeEndQuery}
              setRouteEndQuery={setRouteEndQuery}
              routeFuelLiters={routeFuelLiters}
              setRouteFuelLiters={setRouteFuelLiters}
              routeDistanceKm={routeDistanceKm}
              routeDurationMinutes={routeDurationMinutes}
              startLabel={startLabel}
              endLabel={endLabel}
              mapDisplayCenter={mapDisplayCenter}
              startCoordinate={startCoordinate}
              endCoordinate={endCoordinate}
              truckPosition={truckPosition}
              routePoints={routePoints}
              isFetchingRoute={isFetchingRoute}
              isAnimatingRoute={isAnimatingRoute}
              handleAnimateRoute={() => handleAnimateRoute(setErrorMessage)}
              handleApplyRouteFuel={handleApplyRouteFuel}
              metricsPeriod="daily"
              sourcingMaterials={sourcingMaterials}
              projectLocation={project.location}
              distanceValue={dailyMetrics.distanceKm}
              efficiencyValue={dailyMetrics.fuelEfficiency}
              onDistanceChange={(val) =>
                handleDailyInputChange("distanceKm", val)
              }
              onEfficiencyChange={(val) =>
                handleDailyInputChange("fuelEfficiency", val)
              }
              computedFuelLiters={computedFuelLiters}
              selectedMaterialId={selectedMaterial?.id}
              onMaterialSelect={handleSelectLogisticsMaterial}
              isSavingFuel={isSavingFuel}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
