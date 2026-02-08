"use server";

import { createClient } from "@/lib/supabase/server";

export async function saveSimplifiedTargets(
  projectId: string,
  targets: {
    scopeOne: string;
    scopeTwo: string;
    scopeThree: string;
    trir: string;
  }
) {
  const supabase = await createClient();

  // Check if record exists
  const { data: existing } = await supabase
    .from("project_targets")
    .select("id")
    .eq("project_id", projectId)
    .maybeSingle();

  const updates = {
    scope_one: parseFloat(targets.scopeOne),
    scope_two: parseFloat(targets.scopeTwo),
    scope_three: parseFloat(targets.scopeThree),
    trir: parseFloat(targets.trir),
  };

  if (existing) {
    const { error } = await supabase
      .from("project_targets")
      .update(updates)
      .eq("id", existing.id);

    if (error) throw new Error(error.message);
    return existing.id;
  } else {
    const { data, error } = await supabase
      .from("project_targets")
      .insert([{ project_id: projectId, ...updates }])
      .select("id")
      .single();

    if (error) throw new Error(error.message);
    return data.id;
  }
}
