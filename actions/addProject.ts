"use server";

import { createClient } from "@/lib/supabase/server";
import { safeAsyncOperation } from "@/lib/errors";
import { type Project } from "@/types/project";
import { mapProjectFromSupabase } from "@/components/dashboard/projects/project-helpers";
import type { AddProjectData } from "@/types/forms";

const slugify = (input: string) =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export async function addProject(
  projectData: AddProjectData
): Promise<{ data: Project | null; error: string | null }> {
  return safeAsyncOperation(async () => {
    const supabase = await createClient();

    const slug = slugify(projectData.name);
    if (!slug) {
      throw new Error(
        "Project name must contain at least one alphanumeric character."
      );
    }

    const budgetValue = projectData.budget ? Number(projectData.budget) : null;
    if (budgetValue !== null && Number.isNaN(budgetValue)) {
      throw new Error("Budget must be a number.");
    }

    const { data, error } = await supabase
      .from("projects")
      .insert([
        {
          name: projectData.name.trim(),
          slug,
          description: (projectData.description || "").trim() || null,
          status: projectData.status,
          priority: projectData.priority,
          project_manager: (projectData.projectManager || "").trim() || null,
          start_date: projectData.startDate || null,
          end_date: projectData.endDate || null,
          client_name: (projectData.clientName || "").trim() || null,
          category: projectData.category || null,
          budget: budgetValue,
          location: (projectData.location || "").trim() || null,
        },
      ])
      .select(
        "project_id, owner_id, name, slug, description, status, priority, category, project_manager, client_name, location, budget, start_date, end_date, created_at, updated_at"
      )
      .single();

    if (error) {
      throw error;
    }

    return mapProjectFromSupabase(data);
  });
}
