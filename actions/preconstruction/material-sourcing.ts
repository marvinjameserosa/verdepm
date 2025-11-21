"use server";

import { createClient } from "@/lib/supabase/server";

export async function addMaterialSourcing(projectId: string, material: any) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("material")
    .insert([
      {
        project_id: projectId,
        material_category: material.category,
        supplier: material.supplier,
        material_name: material.name,
        warehouse: material.warehouse,
        estimated_cost: material.cost,
        unit: material.unit,
        sustainability_credentials: material.credentials,
        supplier_vetting_notes: material.notes,
        spec_sheet_path: material.specSheetPath,
        spec_sheet_url: material.specSheetUrl,
        vetting: material.status,
        delivery_status: "Not Delivered",
        submitted_by: user?.id,
      },
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteMaterialSourcing(
  materialId: string,
  projectId: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("material")
    .delete()
    .eq("id", materialId)
    .eq("project_id", projectId)
    .select("id");

  if (error) throw new Error(error.message);
  if (!data || data.length === 0)
    throw new Error("Material not found or access denied.");
  return { success: true };
}
