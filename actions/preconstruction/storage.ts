"use server";

import { createClient } from "@/lib/supabase/server";

export async function uploadProjectFile(
  formData: FormData
): Promise<{ path: string; error?: string }> {
  const supabase = await createClient();
  const file = formData.get("file") as File;
  const path = formData.get("path") as string;
  const bucket = (formData.get("bucket") as string) || "projects";

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

export async function verifyProjectFile(
  path: string,
  bucket: string = "projects"
): Promise<{ exists: boolean; url?: string; error?: string }> {
  const supabase = await createClient();
  const folderPath = path.split("/").slice(0, -1).join("/");
  const fileName = path.split("/").pop();

  if (!fileName) return { exists: false, error: "Invalid file path" };

  const { data, error } = await supabase.storage.from(bucket).list(folderPath, {
    search: fileName,
    limit: 1,
  });

  if (error) {
    console.error("Error checking file existence:", error);
    return { exists: false, error: error.message };
  }

  const exists =
    data && data.length > 0 && data.some((f) => f.name === fileName);

  if (exists) {
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
    return { exists: true, url: urlData.publicUrl };
  }

  return { exists: false, error: "File not found in storage" };
}
