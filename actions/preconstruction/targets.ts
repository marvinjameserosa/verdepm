"use server";

import { createClient } from "@/lib/supabase/server";
import { TARGET_SECTION_CONFIG } from "@/lib/preconstruction";
import type { TargetSectionKey } from "@/types/preconstruction";

export async function saveTarget(
  section: TargetSectionKey,
  projectId: string,
  payload: any,
  existingId: string | null
) {
  const supabase = await createClient();
  const config = TARGET_SECTION_CONFIG[section];
  const { table } = config;

  const dbPayload = {
    project_id: projectId,
    ...payload,
  };

  if (existingId) {
    const { data, error } = await supabase
      .from(table)
      .update(dbPayload)
      .eq("id", existingId)
      .select("id");

    if (error) throw new Error(error.message);
    if (!data || data.length === 0)
      throw new Error("Target not found or access denied.");
    return existingId;
  } else {
    const { data, error } = await supabase
      .from(table)
      .insert([dbPayload])
      .select("id")
      .single();

    if (error) throw new Error(error.message);
    return data && data.id != null ? String(data.id) : null;
  }
}
