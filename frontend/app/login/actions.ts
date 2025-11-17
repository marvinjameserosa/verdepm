"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { loginSchema } from "@/types/auth";

export async function Login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const result = loginSchema.safeParse({ email, password });

  if (!result.success) {
    return redirect("/login?message=Invalid email or password");
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  });

  if (error) {
    return redirect(`/login?message=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  return redirect("/dashboard");
}

export async function exchangeCodeForSession(code: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return {
      success: false,
      message: "Invalid or expired password reset link. Please try again.",
    };
  }

  return {
    success: true,
  };
}

export async function resetPassword(email: string) {
  // Validate email format
  if (!email || !email.includes("@")) {
    return {
      success: false,
      message: "Please enter a valid email address",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) {
    console.error("Password reset error:", error);
    return {
      success: false,
      message: "Failed to send reset email. Please try again.",
    };
  }

  return {
    success: true,
    message: "Password reset link sent! Check your email inbox.",
  };
}
