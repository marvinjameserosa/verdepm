import { loginSchema } from "@/types/auth";

/**
 * Validation utilities for authentication
 */

/**
 * Validate login input data
 */
export function validateLoginInput(data: { email: string; password: string }) {
    return loginSchema.safeParse(data);
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Re-export schemas for convenience
export { loginSchema } from "@/types/auth";
