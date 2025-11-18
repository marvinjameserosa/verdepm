"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function useInviteMember() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<unknown | null>(null);

  const inviteMember = async (
    email: string,
    password: string,
    firstname: string,
    lastname: string,
    phone: string,
    role: string
  ) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          firstname,
          lastname,
          phone,
          role,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create user.");
      }

      setData(result);
      await router.refresh();
      return result;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create user.");
      }
    } finally {
      setLoading(false);
    }
  };

  return { inviteMember, loading, error, data };
}
