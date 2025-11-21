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
    const { error } = await supabase
      .from(table)
      .update(dbPayload)
      .eq("id", existingId);

    if (error) throw new Error(error.message);
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
