"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { signInWithPassword } from "@/services/auth/authService";
import { validateLoginInput } from "@/lib/validators/auth";

type LoginResult = {
  error?: string;
};

/**
 * Server action for user login
 */
export async function login(formData: FormData): Promise<LoginResult | void> {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = validateLoginInput({ email, password });

    if (!result.success) {
      return { error: "Invalid email or password" };
    }

    const authResult = await signInWithPassword(
      result.data.email,
      result.data.password
    );

    if (!authResult.success) {
      return { error: authResult.error || "Authentication failed" };
    }
    revalidatePath("/", "layout");
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      ((error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT") ||
        (error as Error).message === "NEXT_REDIRECT" ||
        (error as Error).name === "NEXT_REDIRECT")
    ) {
      throw error;
    }

    console.error("Login action error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }

  return redirect("/dashboard");
}
