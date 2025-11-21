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
    vetting_status: material.status,
  };

  if (material.specSheetPath) {
    updates.spec_sheet_path = material.specSheetPath;
  }
  if (material.specSheetUrl) {
    updates.spec_sheet_url = material.specSheetUrl;
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
