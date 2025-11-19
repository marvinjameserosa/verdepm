"use client";

import { useState } from "react";

/**
 * Custom hook for password visibility toggle
 * Reusable across login, signup, and password reset forms
 */
export function usePasswordVisibility(initialState = false) {
    const [showPassword, setShowPassword] = useState(initialState);

    const togglePassword = () => setShowPassword((prev) => !prev);

    return {
        showPassword,
        togglePassword,
        setShowPassword,
    };
}
