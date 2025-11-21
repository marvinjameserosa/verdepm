"use server";

import { createClient } from "@/lib/supabase/server";

export async function uploadProjectFile(
  formData: FormData
): Promise<{ path: string; error?: string }> {
  const supabase = await createClient();
  const file = formData.get("file") as File;
  const path = formData.get("path") as string;
  const bucket = (formData.get("bucket") as string) || "preconstruction-docs";

  if (!file || !path) {
    return { error: "Missing file or path", path: "" };
  }

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type || "application/pdf",
    upsert: true,
  });

  if (error) {
    return { error: error.message, path: "" };
  }

  return { path };
}
