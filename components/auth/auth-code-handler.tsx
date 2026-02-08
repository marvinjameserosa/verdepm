"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { exchangeCode } from "@/actions/auth/exchangeCode";

export function AuthCodeHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = searchParams.get("code");

    async function handleCode() {
      if (code) {
        const result = await exchangeCode(code);
        if (result.success) {
          // Redirect to the password reset page on success
          router.replace("/reset-password");
        } else {
          // Redirect to login with an error message on failure
          router.replace(
            `/login?message=${encodeURIComponent(
              result.message || "An unexpected error occurred"
            )}`
          );
        }
      }
    }

    handleCode();
  }, [searchParams, router]);

  // This component does not render anything
  return null;
}
