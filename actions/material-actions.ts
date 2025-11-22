"use server";

import { createClient } from "@/lib/supabase/server";

type MaterialDeliveryUpdate = {
  delivery_distance?: number | null;
  vehicle_fuel_efficiency?: number | null;
  combustion_emission_factor?: number | null;
  delivery_date?: Date | string | null;
  delivery_status?: string | null;
};

export async function updateMaterialDelivery(
  materialId: string,
  data: MaterialDeliveryUpdate
) {
  const supabase = await createClient();

  try {
    const updates: Record<string, any> = {};

    if (data.delivery_distance !== undefined) {
      updates.delivery_distance = data.delivery_distance;
    }
    if (data.vehicle_fuel_efficiency !== undefined) {
      updates.vehicle_fuel_efficiency = data.vehicle_fuel_efficiency;
    }
    if (data.combustion_emission_factor !== undefined) {
      updates.combustion_emission_factor = data.combustion_emission_factor;
    }
    if (data.delivery_status !== undefined) {
      updates.delivery_status = data.delivery_status;
    }
    if (data.delivery_date !== undefined) {
      if (data.delivery_date === null) {
        updates.delivery_date = null;
      } else {
        const normalized = new Date(data.delivery_date);
        if (Number.isNaN(normalized.getTime())) {
          return { success: false, error: "Invalid delivery date" };
        }
        updates.delivery_date = normalized.toISOString();
      }
    }

    if (Object.keys(updates).length === 0) {
      return { success: false, error: "No delivery fields provided" };
    }

    const { error } = await supabase
      .from("material")
      .update(updates)
      .eq("id", materialId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error("Failed to update material delivery", error);
    let errorMessage = "Failed to update material delivery";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
}
