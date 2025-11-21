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

    const { data: materialsData, error: materialsError } = await supabase
      .from("material")
      .select(
        "id, material_category, supplier, material_name, warehouse, estimated_cost, unit, sustainability_credentials, supplier_vetting_notes, vetting_status, spec_sheet_path, approval_status, spec_sheet_url, fuel_summary"
      )
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });

    if (materialsError) {
      throw materialsError;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const materialRows = (materialsData || []) as any[];

    const data = materialRows.map((material) => ({
      id: material.id,
      category: material.material_category ?? "",
      name: material.material_name ?? "",
      supplier: material.supplier ?? "",
      warehouse: material.warehouse ?? undefined,
      cost:
        material.estimated_cost !== null &&
        material.estimated_cost !== undefined
          ? String(material.estimated_cost)
          : "",
      unit: material.unit ?? undefined,
      credentials: material.sustainability_credentials ?? undefined,
      notes: material.supplier_vetting_notes ?? "",
      status: material.vetting_status ?? "Identified",
      specSheetPath: material.spec_sheet_path ?? undefined,
      approvalStatus: material.approval_status ?? undefined,
      specSheetUrl: material.spec_sheet_url ?? undefined,
      fuelSummary: material.fuel_summary ?? 0,
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
