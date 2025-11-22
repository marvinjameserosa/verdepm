"use server";

import { createClient } from "@/lib/supabase/server";

export async function updateMaterialSourcing(
  materialId: string,
  projectId: string,
  material: any
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const updates: any = {
    material_category: material.category,
    supplier: material.supplier,
    material_name: material.name,
    warehouse: material.warehouse,
    estimated_cost: material.cost,
    unit: material.unit,
    sustainability_credentials: material.credentials,
    supplier_vetting_notes: material.notes,
    vetting: material.status,
  };

  if (material.specSheetPath) {
    updates.spec_sheet_path = material.specSheetPath;
  }
  if (material.specSheetUrl) {
    updates.spec_sheet_url = material.specSheetUrl;
  }
  if (material.approvalStatus) {
    updates.approval_status = material.approvalStatus;
  }
  if (material.receiptUrl) {
    updates.receipt_url = material.receiptUrl;
  }
  if (material.receiptPath) {
    updates.receipt_path = material.receiptPath;
  }
  if (material.deliveryDate) {
    updates.delivery_date = material.deliveryDate;
  }

  const { data, error } = await supabase
    .from("material")
    .update(updates)
    .eq("id", materialId)
    .eq("project_id", projectId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function addMaterialFuel(materialId: string, fuelToAdd: number) {
  const supabase = await createClient();

  // First get current fuel summary
  const { data: currentData, error: fetchError } = await supabase
    .from("material")
    .select("fuel_summary")
    .eq("id", materialId)
    .single();

  if (fetchError) throw new Error(fetchError.message);

  const currentFuel = currentData.fuel_summary || 0;
  const newFuel = currentFuel + fuelToAdd;

  const { data, error } = await supabase
    .from("material")
    .update({ fuel_summary: newFuel })
    .eq("id", materialId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}
