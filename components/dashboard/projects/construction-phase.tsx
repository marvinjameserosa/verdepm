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
} from "@/types/construction";

import { useConstructionMetrics } from "@/hooks/use-construction-metrics";
import { useWasteManagement } from "@/hooks/use-waste-management";
import { useRouteAnimation } from "@/hooks/use-route-animation";
import { useSourcingMaterials } from "@/hooks/use-sourcing-materials";
import { submitConstructionLog } from "@/actions/construction/submit";

import { MetricCard } from "./construction/metric-card";
import { EquipmentEmissionsCard } from "./construction/equipment-emissions-card";
import { SafetyTrirCard } from "./construction/safety-trir-card";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [metricsPeriod, setMetricsPeriod] = useState<"daily" | "monthly">(
    "daily"
  );

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

  const { sourcingMaterials, materialFetchError, materialLoading } =
    useSourcingMaterials(project?.id);

  const resetMessages = () => {
    setStatusMessage(null);
    setErrorMessage(null);
  };

  const handleApplyRouteFuel = () => {
    resetMessages();
    if (routeDistanceKm === null || routeDistanceKm <= 0) {
      setErrorMessage("Calculate a valid route before applying fuel data.");
      return;
    }
    
    // If computedFuelLiters is available (from distance * efficiency), use that.
    // Otherwise check if routeFuelLiters (manual input) is set.
    const fuelToApply = computedFuelLiters !== null ? computedFuelLiters : Number(routeFuelLiters);

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

    // We don't need to update state here because the inputs in DeliveryRouteSection
    // are already bound to dailyMetrics (distanceKm, fuelEfficiency).
    // However, if the user manually entered fuel liters without efficiency,
    // we might want to back-calculate efficiency or just store the liters?
    // The current logic relies on distance * efficiency.
    // If we have a manual fuel entry but no efficiency, we should probably update efficiency.
    
    if (dailyMetrics.fuelEfficiency === "" && routeDistanceKm > 0) {
        const impliedEfficiency = fuelToApply / routeDistanceKm;
        handleDailyInputChange("fuelEfficiency", impliedEfficiency.toFixed(3));
    }
    
    // Also ensure distance is synced if it came from the route
    if (dailyMetrics.distanceKm === "" || Number(dailyMetrics.distanceKm) !== routeDistanceKm) {
        handleDailyInputChange("distanceKm", routeDistanceKm.toFixed(2));
    }

    setStatusMessage(
      "Route fuel data has been applied to the daily log."
    );
  };

  const handleSubmit = async () => {
    resetMessages();

    const hasDailyMetrics = Object.values(dailyMetrics).some(
      (value) => value.trim() !== ""
    );
    const hasMonthlyMetrics = Object.values(monthlyMetrics).some(
      (value) => value.trim() !== ""
    );
    const hasWasteEntries = wasteEntries.length > 0;
    const shouldSubmitDaily = metricsPeriod === "daily" && hasDailyMetrics;
    const shouldSubmitMonthly =
      metricsPeriod === "monthly" && (hasMonthlyMetrics || hasWasteEntries);

    if (!shouldSubmitDaily && !shouldSubmitMonthly) {
      const message =
        metricsPeriod === "monthly"
          ? "Enter at least one monthly metric or waste record before submitting."
          : "Enter at least one daily metric before submitting.";
      setErrorMessage(message);
      return;
    }

    setIsSubmitting(true);

    try {
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

      let dailyData = undefined;
      if (shouldSubmitDaily) {
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

        dailyData = {
          fuelConsumptionLiters,
          equipmentEmissionsKg,
          safetyTrirRounded,
          scope1,
          incidentCount: incidentCountValue,
          hoursWorked: hoursWorkedValue,
        };
      }

      let monthlyData = undefined;
      if (shouldSubmitMonthly) {
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

        monthlyData = {
          rawElectricityKwh,
          rawWaterCubicM,
          rawWasteKg: rawWaste,
          electricityEmissionsKg,
          waterEmissionsKg,
          wasteEmissionsKg,
          scope2,
          scope3,
        };
      }

      const result = await submitConstructionLog({
        projectId: project.id,
        date: new Date().toISOString().slice(0, 10),
        metricsPeriod: metricsPeriod as "daily" | "monthly",
        dailyData,
        monthlyData,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      // Construct summary messages
      let electricitySummary = "";
      let waterSummary = "";
      let wasteSummary = "";

      if (shouldSubmitMonthly && monthlyData && result.sumElec !== undefined) {
        if (monthlyData.electricityEmissionsKg !== null) {
          electricitySummary = ` Electricity emissions: ${monthlyData.electricityEmissionsKg.toFixed(
            2
          )} kg CO₂e (from ${result.sumElec.toFixed(2)} kWh).`;
        }
        if (
          monthlyData.waterEmissionsKg !== null &&
          result.sumWater !== undefined
        ) {
          waterSummary = ` Water emissions: ${monthlyData.waterEmissionsKg.toFixed(
            2
          )} kg CO₂e (from ${result.sumWater.toFixed(2)} m³).`;
        }
        if (monthlyData.wasteEmissionsKg !== null) {
          wasteSummary = ` Waste emissions: ${monthlyData.wasteEmissionsKg.toFixed(
            2
          )} kg CO₂e.`;
        }
      }

      let fuelSummary = "";
      let equipmentSummary = "";
      let safetySummary = "";

      if (shouldSubmitDaily && dailyData) {
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
      }

      const combinedSummary = `${fuelSummary}${equipmentSummary}${safetySummary}${electricitySummary}${waterSummary}${wasteSummary}`;
      const warningSummary =
        result.warnings && result.warnings.length > 0
          ? ` ${result.warnings.join(" ")}`
          : "";

      if (shouldSubmitDaily) {
        if (shouldSubmitMonthly) {
          setStatusMessage(
            `Daily report and monthly metrics saved successfully.${combinedSummary}${warningSummary}`.trim()
          );
        } else {
          setStatusMessage(
            `Daily report saved successfully.${combinedSummary}${warningSummary}`.trim()
          );
        }
      } else if (shouldSubmitMonthly) {
        setStatusMessage(
          `Monthly metrics saved successfully.${warningSummary}`.trim()
        );
      } else {
        setStatusMessage(`Submission completed.${warningSummary}`.trim());
      }

      if (shouldSubmitDaily) {
        setDailyMetrics({
          distanceKm: "",
          fuelEfficiency: "",
          equipmentHours: "",
          equipmentFuelRate: "",
          incidentCount: "",
          hoursWorked: "",
        });
      }

      if (shouldSubmitMonthly) {
        setMonthlyMetrics({
          electricity: "",
          water: "",
        });
        setWasteEntries([]);
        setNewWasteEntry(createDefaultWasteFormEntry());
      }
    } catch (error) {
      console.error("Failed to submit daily report", error);
      const message =
        error instanceof Error ? error.message : "Unable to submit report.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
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
    metricsPeriod === "daily"
      ? "Construction Phase: Daily ESG Monitoring"
      : "Construction Phase: Monthly ESG Monitoring";

  const monitoringDescription =
    metricsPeriod === "daily"
      ? "Log daily metrics to track performance against pre-construction targets."
      : "Review monthly resource usage to stay aligned with pre-construction targets.";

  const submitButtonLabel =
    metricsPeriod === "monthly"
      ? "Submit Full Monthly Report"
      : "Submit Full Daily Report";

  const submitButtonBusyLabel =
    metricsPeriod === "monthly"
      ? "Submitting Monthly..."
      : "Submitting Daily...";

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
        value={metricsPeriod}
        onValueChange={(value) =>
          setMetricsPeriod(value as "daily" | "monthly")
        }
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="daily">Daily Inputs</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Inputs</TabsTrigger>
        </TabsList>
        <TabsContent value="daily">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EquipmentEmissionsCard
              hoursValue={dailyMetrics.equipmentHours}
              fuelRateValue={dailyMetrics.equipmentFuelRate}
              onHoursChange={(value) =>
                handleDailyInputChange("equipmentHours", value)
              }
              onFuelRateChange={(value) =>
                handleDailyInputChange("equipmentFuelRate", value)
              }
              computedFuelLiters={computedEquipmentTotals.fuelLiters}
              computedCo2Kg={computedEquipmentTotals.co2Kg}
            />
            <SafetyTrirCard
              incidentsValue={dailyMetrics.incidentCount}
              hoursWorkedValue={dailyMetrics.hoursWorked}
              onIncidentsChange={(value) =>
                handleDailyInputChange("incidentCount", value)
              }
              onHoursWorkedChange={(value) =>
                handleDailyInputChange("hoursWorked", value)
              }
              computedTrir={computedSafetyTrir}
              target={preConstructionTargets.safety}
            />
          </div>
          <div className="mt-6">
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
              onDistanceChange={(value) =>
                handleDailyInputChange("distanceKm", value)
              }
              onEfficiencyChange={(value) =>
                handleDailyInputChange("fuelEfficiency", value)
              }
              computedFuelLiters={computedFuelLiters}
            />
          </div>
        </TabsContent>
        <TabsContent value="monthly">
          <div className="space-y-6">
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
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <MaterialSourcingSection
          materialLoading={materialLoading}
          sourcingMaterials={sourcingMaterials}
          materialFetchError={materialFetchError}
        />
      </div>

      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={handleSubmit}
            className="w-full"
            disabled={isSubmitting}
          >
            <Send className="mr-2 h-4 w-4" />
            {isSubmitting ? submitButtonBusyLabel : submitButtonLabel}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
