"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { login } from "@/actions/auth/login";
import { validateLoginInput } from "@/lib/validators/auth";

/**
 * Custom hook for login form logic
 * Encapsulates form state, validation, and submission
 */
export function useLogin() {
    const searchParams = useSearchParams();
    const queryMessage = searchParams.get("message");

    const [authError, setAuthError] = useState<string | null>(queryMessage);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{
        email?: string[];
        password?: string[];
    }>({});

    const isMountedRef = useRef(true);

    // Update error when query message changes
    useEffect(() => {
        setAuthError(queryMessage);
    }, [queryMessage]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    /**
     * Handle form submission
     */
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setErrors({});
        setAuthError(null);

        const formData = new FormData(event.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        // Validate input
        const result = validateLoginInput({ email, password });
        if (!result.success) {
            setIsLoading(false);
            setErrors(result.error.flatten().fieldErrors);
            return;
        }

        try {
            const result = await login(formData);

            if (result && "error" in result && result.error) {
                if (isMountedRef.current) {
                    setAuthError(result.error);
                }
                return;
            }
        } catch (error) {
            if (error instanceof Error && error.name === "NEXT_REDIRECT") {
                throw error;
            }
            console.error("Login failed", error);
            if (isMountedRef.current) {
                setAuthError("Unexpected error. Please try again.");
            }
        } finally {
            if (isMountedRef.current) {
                setIsLoading(false);
            }
        }
    };

    return {
        authError,
        isLoading,
        errors,
        handleSubmit,
    };
}
