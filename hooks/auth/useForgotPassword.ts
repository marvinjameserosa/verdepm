"use client";

import { useState } from "react";
import { resetPassword } from "@/actions/auth/resetPassword";

type Status = "idle" | "success" | "error";

/**
 * Custom hook for forgot password functionality
 * Encapsulates password reset form state and submission
 */
export function useForgotPassword(onSuccess?: () => void) {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<Status>("idle");
    const [message, setMessage] = useState("");

    /**
     * Handle form submission
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus("idle");
        setMessage("");

        const result = await resetPassword(email);

        setIsLoading(false);

        if (result.success) {
            setStatus("success");
            setMessage(result.message);
            setEmail("");

            // Auto-close after 3 seconds
            setTimeout(() => {
                onSuccess?.();
                reset();
            }, 3000);
        } else {
            setStatus("error");
            setMessage(result.message);
        }
    };

    /**
     * Reset form state
     */
    const reset = () => {
        setEmail("");
        setStatus("idle");
        setMessage("");
    };

    return {
        email,
        setEmail,
        isLoading,
        status,
        message,
        handleSubmit,
        reset,
    };
}
