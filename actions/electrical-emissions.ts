"use server";

import { createClient } from "@/lib/supabase/server";
import type {
    ElectricalEmission,
    ElectricalEmissionInput,
    SupabaseElectricalEmission,
} from "@/types/electrical-emission";
import {
    mapElectricalEmissionFromSupabase,
    PHILIPPINES_GRID_EMISSION_FACTOR,
} from "@/lib/electrical-emissions";

/**
 * Add a new electrical emission record
 * The total CO2e is automatically calculated by the database
 */
export async function addElectricalEmission(
    input: ElectricalEmissionInput
): Promise<{ data: ElectricalEmission | null; error: string | null }> {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("Electrical_Emission")
            .insert({
                project_id: input.projectId || null,
                organization_id: input.organizationId,
                electricity_consumed_kwh: input.electricityConsumedKwh,
                emission_factor_kg_per_kwh:
                    input.emissionFactorKgPerKwh || PHILIPPINES_GRID_EMISSION_FACTOR,
                measurement_period_start: input.measurementPeriodStart || null,
                measurement_period_end: input.measurementPeriodEnd || null,
                notes: input.notes || null,
            })
            .select()
            .single();

        if (error) {
            console.error("Error adding electrical emission:", error);
            return { data: null, error: error.message };
        }

        return {
            data: mapElectricalEmissionFromSupabase(
                data as SupabaseElectricalEmission
            ),
            error: null,
        };
    } catch (error) {
        console.error("Unexpected error adding electrical emission:", error);
        return {
            data: null,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Get all electrical emissions for a specific project
 */
export async function getElectricalEmissionsByProject(
    projectId: string
): Promise<{ data: ElectricalEmission[] | null; error: string | null }> {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("Electrical_Emission")
            .select("*")
            .eq("project_id", projectId)
            .order("measurement_period_start", { ascending: false });

        if (error) {
            console.error("Error fetching electrical emissions:", error);
            return { data: null, error: error.message };
        }

        return {
            data: (data as SupabaseElectricalEmission[]).map(
                mapElectricalEmissionFromSupabase
            ),
            error: null,
        };
    } catch (error) {
        console.error("Unexpected error fetching electrical emissions:", error);
        return {
            data: null,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Get all electrical emissions for an organization
 */
export async function getElectricalEmissionsByOrganization(
    organizationId: string
): Promise<{ data: ElectricalEmission[] | null; error: string | null }> {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("Electrical_Emission")
            .select("*")
            .eq("organization_id", organizationId)
            .order("measurement_period_start", { ascending: false });

        if (error) {
            console.error("Error fetching electrical emissions:", error);
            return { data: null, error: error.message };
        }

        return {
            data: (data as SupabaseElectricalEmission[]).map(
                mapElectricalEmissionFromSupabase
            ),
            error: null,
        };
    } catch (error) {
        console.error("Unexpected error fetching electrical emissions:", error);
        return {
            data: null,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Get total electrical emissions summary for an organization
 */
export async function getElectricalEmissionsSummary(organizationId: string): Promise<{
    data: {
        totalElectricityKwh: number;
        totalCo2eKg: number;
        recordCount: number;
    } | null;
    error: string | null;
}> {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("Electrical_Emission")
            .select("electricity_consumed_kwh, total_co2e_kg")
            .eq("organization_id", organizationId);

        if (error) {
            console.error("Error fetching electrical emissions summary:", error);
            return { data: null, error: error.message };
        }

        const summary = (data as SupabaseElectricalEmission[]).reduce(
            (acc, record) => ({
                totalElectricityKwh:
                    acc.totalElectricityKwh + record.electricity_consumed_kwh,
                totalCo2eKg: acc.totalCo2eKg + record.total_co2e_kg,
                recordCount: acc.recordCount + 1,
            }),
            { totalElectricityKwh: 0, totalCo2eKg: 0, recordCount: 0 }
        );

        return { data: summary, error: null };
    } catch (error) {
        console.error("Unexpected error fetching electrical emissions summary:", error);
        return {
            data: null,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Update an existing electrical emission record
 */
export async function updateElectricalEmission(
    id: string,
    updates: Partial<ElectricalEmissionInput>
): Promise<{ data: ElectricalEmission | null; error: string | null }> {
    try {
        const supabase = await createClient();

        const updateData: any = {};
        if (updates.electricityConsumedKwh !== undefined) {
            updateData.electricity_consumed_kwh = updates.electricityConsumedKwh;
        }
        if (updates.emissionFactorKgPerKwh !== undefined) {
            updateData.emission_factor_kg_per_kwh = updates.emissionFactorKgPerKwh;
        }
        if (updates.measurementPeriodStart !== undefined) {
            updateData.measurement_period_start = updates.measurementPeriodStart;
        }
        if (updates.measurementPeriodEnd !== undefined) {
            updateData.measurement_period_end = updates.measurementPeriodEnd;
        }
        if (updates.notes !== undefined) {
            updateData.notes = updates.notes;
        }

        const { data, error } = await supabase
            .from("Electrical_Emission")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("Error updating electrical emission:", error);
            return { data: null, error: error.message };
        }

        return {
            data: mapElectricalEmissionFromSupabase(
                data as SupabaseElectricalEmission
            ),
            error: null,
        };
    } catch (error) {
        console.error("Unexpected error updating electrical emission:", error);
        return {
            data: null,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Delete an electrical emission record
 */
export async function deleteElectricalEmission(
    id: string
): Promise<{ error: string | null }> {
    try {
        const supabase = await createClient();

        const { error } = await supabase
            .from("Electrical_Emission")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error deleting electrical emission:", error);
            return { error: error.message };
        }

        return { error: null };
    } catch (error) {
        console.error("Unexpected error deleting electrical emission:", error);
        return {
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}
