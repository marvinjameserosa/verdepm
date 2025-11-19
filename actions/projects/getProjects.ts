"use server";

import { createClient } from "@/lib/supabase/server";
import { safeAsyncOperation } from "@/lib/errors";
import { Project } from "@/types/project";
import { mapProjectFromSupabase } from "@/components/dashboard/projects/project-helpers";

export async function getProjects(): Promise<{
  data: Project[] | null;
  error: string | null;
}> {
  return safeAsyncOperation(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select(
        "project_id, owner_id, name, slug, description, status, priority, category, project_manager, client_name, location, budget, start_date, end_date, created_at, updated_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map(mapProjectFromSupabase);
  });
}
