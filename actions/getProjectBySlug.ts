import { createClient } from "@/lib/supabase/server";
import { mapProjectFromSupabase } from "@/components/dashboard/projects/project-helpers";
import type { Project } from "@/types/project";

const PROJECT_FIELDS =
  "id, owner_id, name, slug, description, status, priority, category, project_manager, client_name, location, budget, start_date, end_date, created_at, updated_at";

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_FIELDS)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapProjectFromSupabase(data);
}
