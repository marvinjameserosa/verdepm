"use client";

import { useState } from "react";

export function usePasswordVisibility(initialState = false) {
    const [showPassword, setShowPassword] = useState(initialState);

    const togglePassword = () => setShowPassword((prev) => !prev);

    return {
        showPassword,
        togglePassword,
        setShowPassword,
    };
}
