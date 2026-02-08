"use server";

import { resetPasswordForEmail } from "@/services/auth/authService";
import type { PasswordResetResult } from "@/services/auth/authService";

/**
 * Server action for password reset
 */
export async function resetPassword(
    email: string
): Promise<PasswordResetResult> {
    return await resetPasswordForEmail(email);
}
