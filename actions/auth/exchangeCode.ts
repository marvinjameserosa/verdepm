"use server";

import { exchangeCodeForSession } from "@/services/auth/authService";
import type { PasswordResetResult } from "@/services/auth/authService";

/**
 * Server action for exchanging code for session
 */
export async function exchangeCode(code: string): Promise<PasswordResetResult> {
    return await exchangeCodeForSession(code);
}
