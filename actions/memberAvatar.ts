import { supabase } from "@/lib/supabase/client";
import type {
  UploadMemberAvatarParams,
  UploadMemberAvatarResult,
} from "@/types/actions";

const AVATAR_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_AVATARS_BUCKET ?? "avatars";

export async function uploadMemberAvatar({
  userId,
  file,
  previousPath,
}: UploadMemberAvatarParams): Promise<UploadMemberAvatarResult> {
  const extension = file.name.split(".").pop() || "png";
  const uniqueId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}`;
  const filePath = `${userId}/${uniqueId}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    throw new Error(uploadError.message || "Unable to upload avatar.");
  }

  if (previousPath && previousPath !== filePath) {
    try {
      await supabase.storage.from(AVATAR_BUCKET).remove([previousPath]);
    } catch (removalError) {
      console.warn("Failed to remove previous avatar", removalError);
    }
  }

  const { data: publicUrlData } = supabase.storage
    .from(AVATAR_BUCKET)
    .getPublicUrl(filePath);

  const publicUrl = publicUrlData?.publicUrl;

  if (!publicUrl) {
    throw new Error("Unable to resolve uploaded avatar URL.");
  }

  return {
    publicUrl,
    filePath,
  };
}

export async function removeMemberAvatar(path: string): Promise<void> {
  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .remove([path]);

  if (error) {
    throw new Error(error.message || "Unable to remove avatar.");
  }
}
