"use server";

import { createClient } from "@/lib/supabase/server";

export async function addMaterial(setupId: string, material: any) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("preconstruction_material")
    .insert([
      {
        project_setup_id: setupId,
        material_category: material.category,
        planned_supplier: material.supplier,
        material_name: material.name,
        warehouse_of_the_supplier:
          material.warehouse && material.warehouse.trim().length > 0
            ? material.warehouse
            : null,
        budgeted_cost: material.cost,
        unit: material.unit,
        sustainability_credentials: material.credentials ?? null,
        supplier_vetting_notes: material.notes,
        spec_sheet_path: material.specSheetPath,
        vetting_status: material.status,
      },
    ])
    .select(
      "id, material_category, planned_supplier, material_name, warehouse_of_the_supplier, budgeted_cost, unit, sustainability_credentials, supplier_vetting_notes, spec_sheet_path, vetting_status"
    )
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteMaterial(materialId: string, setupId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("preconstruction_material")
    .delete()
    .eq("id", materialId)
    .eq("project_setup_id", setupId)
    .select("id");

  if (error) throw new Error(error.message);
  if (!data || data.length === 0)
    throw new Error("Material not found or access denied.");
  return { success: true };
}
