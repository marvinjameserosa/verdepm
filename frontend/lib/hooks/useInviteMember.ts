"use client";

import { useState } from "react";

export function useInviteMember() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any | null>(null);

  const inviteMember = async (
    email: string,
    password: string,
    phone: string,
    firstname: string,
    lastname: string,
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
          phone,
          firstname,
          lastname,
          role,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create user.");
      }

      setData(result);
      return result;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { inviteMember, loading, error, data };
}
