"use server";

import { createClient } from "@/lib/supabase/server";
import { generateSlug, buildSlugFallback } from "@/lib/preconstruction";

export async function ensureUniqueProjectSlug(
  projectName: string,
  projectId: string,
  currentSlug?: string
) {
  const supabase = await createClient();
  const baseSlug =
    generateSlug(projectName) || currentSlug || buildSlugFallback(projectId);

  const { data, error } = await supabase
    .from("projects")
    .select("project_id, slug")
    .ilike("slug", `${baseSlug}%`);

  if (error) {
    console.error("Error checking slug uniqueness:", error);
    return null;
  }

  const slugRows = (data ?? []) as Array<{
    project_id: string | null;
    slug: string | null;
  }>;

  const conflictingSlugs = slugRows
    .filter(
      (row) => row.project_id !== projectId && typeof row.slug === "string"
    )
    .map((row) => row.slug as string);

  if (!conflictingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  let suffix = 2;
  let candidate = `${baseSlug}-${suffix}`;
  while (conflictingSlugs.includes(candidate)) {
    suffix += 1;
    candidate = `${baseSlug}-${suffix}`;
  }

  return candidate;
}

export async function saveProjectSetup(
  userId: string,
  projectId: string,
  projectUpdates: any
) {
  const supabase = await createClient();

  // Update Project Details
  if (Object.keys(projectUpdates).length > 0) {
    const { data, error: projectError } = await supabase
      .from("projects")
      .update(projectUpdates)
      .eq("project_id", projectId)
      .select("project_id");

    if (projectError) {
      console.error("Failed to update project record:", projectError);
      throw new Error(projectError.message);
    }

    if (!data || data.length === 0) {
      throw new Error("Project not found or access denied.");
    }
  }

  return { success: true, setupId: projectId };
}

export async function submitForApproval(
  userId: string,
  setupId: string,
  updates: any
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .update(updates)
    .eq("project_id", setupId)
    .select("project_id");

  if (error) throw error;
  if (!data || data.length === 0)
    throw new Error("Project not found or access denied.");
  return { success: true };
}
