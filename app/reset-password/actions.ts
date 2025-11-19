"use server";

import { createClient } from "@/lib/supabase/server";

export async function updatePassword(newPassword: string) {
  if (!newPassword || newPassword.length < 6) {
    return {
      success: false,
      message: "Password must be at least 6 characters long",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.error("Password update error:", error);
    return {
      success: false,
      message: error.message || "Failed to update password. Please try again.",
    };
  }

  return {
    success: true,
    message: "Password updated successfully!",
  };
}
