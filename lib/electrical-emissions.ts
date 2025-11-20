import type {
    ElectricalEmission,
    SupabaseElectricalEmission,
} from "@/types/electrical-emission";

/**
 * Philippines Grid Emission Factor (2023 DOE data)
 * Source: Department of Energy, Philippines
 * Unit: kg CO2e per kWh
 */
export const PHILIPPINES_GRID_EMISSION_FACTOR = 0.76;

/**
 * Calculate CO2 emissions from electricity consumption
 * Formula: Total CO2e (kg) = Total Electricity Consumed (kWh) × Grid Emission Factor
 *
 * @param electricityKwh - Total electricity consumed in kilowatt-hours
 * @param emissionFactor - Grid emission factor in kg CO2e/kWh (defaults to Philippines factor)
 * @returns Total CO2 equivalent emissions in kilograms
 *
 * @example
 * // Example from the documentation:
 * // Data: 2,000 kWh consumption
 * // Calculation: 2,000 kWh × 0.76 kg CO2e/kWh = 1,520 kg CO2e
 * const emissions = calculateElectricalEmissions(2000);
 * console.log(emissions); // 1520
 */
export function calculateElectricalEmissions(
    electricityKwh: number,
    emissionFactor: number = PHILIPPINES_GRID_EMISSION_FACTOR
): number {
    if (electricityKwh < 0) {
        throw new Error("Electricity consumption cannot be negative");
    }
    if (emissionFactor < 0) {
        throw new Error("Emission factor cannot be negative");
    }

    return electricityKwh * emissionFactor;
}

/**
 * Convert kg CO2e to tonnes CO2e
 * @param kgCo2e - Emissions in kilograms
 * @returns Emissions in tonnes
 */
export function kgToTonnes(kgCo2e: number): number {
    return kgCo2e / 1000;
}

/**
 * Map Supabase database record to ElectricalEmission type
 * @param record - Raw database record
 * @returns Typed ElectricalEmission object
 */
export function mapElectricalEmissionFromSupabase(
    record: SupabaseElectricalEmission
): ElectricalEmission {
    return {
        id: record.id,
        projectId: record.project_id,
        organizationId: record.organization_id,
        electricityConsumedKwh: record.electricity_consumed_kwh,
        emissionFactorKgPerKwh: record.emission_factor_kg_per_kwh,
        totalCo2eKg: record.total_co2e_kg,
        measurementPeriodStart: record.measurement_period_start,
        measurementPeriodEnd: record.measurement_period_end,
        notes: record.notes,
        createdAt: record.created_at,
        updatedAt: record.updated_at,
    };
}

/**
 * Format emission value for display
 * @param kgCo2e - Emissions in kilograms
 * @returns Formatted string with appropriate unit
 */
export function formatEmissions(kgCo2e: number): string {
    if (kgCo2e >= 1_000_000) {
        return `${(kgCo2e / 1_000_000).toFixed(2)} Mt CO₂e`;
    }
    if (kgCo2e >= 1_000) {
        return `${(kgCo2e / 1_000).toFixed(2)} t CO₂e`;
    }
    return `${kgCo2e.toFixed(2)} kg CO₂e`;
}
