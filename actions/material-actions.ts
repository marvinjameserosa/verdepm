"use server";

import { createClient } from "@/lib/supabase/server";

export async function updateMaterialDelivery(
  materialId: string,
  data: {
    delivery_distance: number;
    vehicle_fuel_efficiency: number;
    combustion_emission_factor: number;
    delivery_date: Date;
    delivery_status: string;
  }
) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("material")
      .update({
        delivery_distance: data.delivery_distance,
        vehicle_fuel_efficiency: data.vehicle_fuel_efficiency,
        combustion_emission_factor: data.combustion_emission_factor,
        delivery_date: data.delivery_date.toISOString(),
        delivery_status: data.delivery_status,
      })
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
