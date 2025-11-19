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
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Validate input
    const result = validateLoginInput({ email, password });

    if (!result.success) {
        return { error: "Invalid email or password" };
    }

    // Attempt sign in
    const authResult = await signInWithPassword(
        result.data.email,
        result.data.password
    );

    if (!authResult.success) {
        return { error: authResult.error || "Authentication failed" };
    }

    // Revalidate and redirect on success
    revalidatePath("/", "layout");
    return redirect("/dashboard");
}
