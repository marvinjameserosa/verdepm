export interface ElectricalEmission {
    id: string;
    projectId: string | null;
    organizationId: string | null;
    electricityConsumedKwh: number;
    emissionFactorKgPerKwh: number;
    totalCo2eKg: number;
    measurementPeriodStart: string | null;
    measurementPeriodEnd: string | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface SupabaseElectricalEmission {
    id: string;
    project_id: string | null;
    organization_id: string | null;
    electricity_consumed_kwh: number;
    emission_factor_kg_per_kwh: number;
    total_co2e_kg: number;
    measurement_period_start: string | null;
    measurement_period_end: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface ElectricalEmissionInput {
    projectId?: string | null;
    organizationId: string;
    electricityConsumedKwh: number;
    emissionFactorKgPerKwh?: number; // Optional, defaults to 0.76
    measurementPeriodStart?: string | null;
    measurementPeriodEnd?: string | null;
    notes?: string | null;
}
