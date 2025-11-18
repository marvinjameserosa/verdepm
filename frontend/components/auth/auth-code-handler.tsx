"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { exchangeCodeForSession } from "@/app/login/actions";

export function AuthCodeHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = searchParams.get("code");

    async function handleCode() {
      if (code) {
        const result = await exchangeCodeForSession(code);
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
