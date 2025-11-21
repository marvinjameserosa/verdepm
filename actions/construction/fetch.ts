"use server";

import { createClient } from "@/lib/supabase/server";
import { SourcedMaterial } from "@/types/construction";

type PreconstructionMaterialRow = {
  id: string;
  material_category: string | null;
  planned_supplier: string | null;
  material_name: string | null;
  warehouse_of_the_supplier: string | null;
  budgeted_cost: number | string | null;
  unit: string | null;
  sustainability_credentials: string | null;
  supplier_vetting_notes: string | null;
  vetting_status: string | null;
  spec_sheet_path: string | null;
};

export async function getSourcingMaterials(
  projectId: string
): Promise<{ data: SourcedMaterial[]; error: string | null }> {
  const supabase = await createClient();

  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      return {
        data: [],
        error: "You must be signed in to view sourcing materials.",
      };
    }

    const userId = authData.user.id;

    const { data: setupRecord, error: setupError } = await supabase
      .from("preconstruction_project_setup")
      .select("id")
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .maybeSingle();

    if (setupError) {
      throw setupError;
    }

    if (!setupRecord) {
      return {
        data: [],
        error: "No pre-construction setup found for this project.",
      };
    }

    const { data: materialsData, error: materialsError } = await supabase
      .from("preconstruction_material")
      .select(
        "id, material_category, planned_supplier, material_name, warehouse_of_the_supplier, budgeted_cost, unit, sustainability_credentials, supplier_vetting_notes, vetting_status, spec_sheet_path"
      )
      .eq("project_setup_id", setupRecord.id)
      .order("created_at", { ascending: true });

    if (materialsError) {
      throw materialsError;
    }

    const materialRows = Array.isArray(materialsData)
      ? (materialsData as PreconstructionMaterialRow[])
      : [];

    const data = materialRows.map((material) => ({
      id: material.id,
      category: material.material_category ?? "",
      name: material.material_name ?? "",
      supplier: material.planned_supplier ?? "",
      warehouse: material.warehouse_of_the_supplier ?? undefined,
      cost:
        material.budgeted_cost !== null && material.budgeted_cost !== undefined
          ? String(material.budgeted_cost)
          : "",
      unit: material.unit ?? undefined,
      credentials: material.sustainability_credentials ?? undefined,
      notes: material.supplier_vetting_notes ?? "",
      status: material.vetting_status ?? "Identified",
      specSheetPath: material.spec_sheet_path ?? undefined,
    }));

    return { data, error: null };
  } catch (error) {
    console.error("Failed to load sourcing materials", error);
    return {
      data: [],
      error:
        error instanceof Error
          ? error.message
          : "Failed to load sourcing materials.",
    };
  }
}
