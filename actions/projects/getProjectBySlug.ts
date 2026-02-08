import { createClient } from "@/lib/supabase/server";
import { mapProjectFromSupabase } from "@/components/dashboard/projects/project-helpers";
import type { Project } from "@/types/project";

const PROJECT_FIELDS =
  "project_id, organization_id, project_name, slug, description, status, priority, category, client_name, location, budget, start_date, end_date, created_at, updated_at";

export async function getProjectBySlug(slug: string): Promise<Project> {
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
    throw new Error(`No project with slug '${slug}' was found.`);
  }

  return mapProjectFromSupabase(data);
}
