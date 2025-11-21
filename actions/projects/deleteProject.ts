"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteProject(
  projectId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("Auth error in deleteProject:", authError);
      return { success: false, error: "Authentication failed" };
    }

    if (!user) {
      console.error("No user found in deleteProject");
      return { success: false, error: "Unauthorized" };
    }

    console.log(`Attempting to delete project with ID: ${projectId}`);

    const { error: deleteError } = await supabase
      .from("projects")
      .delete()
      .eq("project_id", projectId);

    if (deleteError) {
      console.error("Supabase delete error:", deleteError);
      return { success: false, error: deleteError.message };
    }

    revalidatePath("/dashboard/projects");
    return { success: true, error: null };
  } catch (error) {
    console.error("Unexpected error in deleteProject:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
