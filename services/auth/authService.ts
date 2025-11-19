import { createClient } from "@/lib/supabase/server";

/**
 * Authentication service layer
 * Abstracts Supabase authentication API calls
 */

export interface AuthResult {
    success: boolean;
    error?: string;
}

export interface PasswordResetResult {
    success: boolean;
    message: string;
}

/**
 * Sign in user with email and password
 */
export async function signInWithPassword(
    email: string,
    password: string
): Promise<AuthResult> {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return {
            success: false,
            error: error.message,
        };
    }

    return {
        success: true,
    };
}

/**
 * Send password reset email
 */
export async function resetPasswordForEmail(
    email: string
): Promise<PasswordResetResult> {
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

/**
 * Exchange code for session (password reset flow)
 */
export async function exchangeCodeForSession(
    code: string
): Promise<PasswordResetResult> {
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
        message: "Session established successfully.",
    };
}
