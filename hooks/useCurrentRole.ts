import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export type OrganizationRole =
  | "owner"
  | "manager"
  | "member"
  | "supplier"
  | string
  | null;

export function useCurrentRole() {
  const [role, setRole] = useState<OrganizationRole>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadRole = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          throw authError;
        }

        if (!user) {
          if (isMounted) {
            setRole(null);
          }
          return;
        }

        const { data, error: membershipError } = await supabase
          .from("organization_member")
          .select("role")
          .eq("user_id", user.id)
          .limit(1)
          .maybeSingle();

        if (membershipError) {
          throw membershipError;
        }

        if (!isMounted) {
          return;
        }

        setRole(
          (data?.role && typeof data.role === "string"
            ? (data.role as OrganizationRole)
            : null) ?? null
        );
      } catch (err) {
        console.error("Failed to load current role", err);
        if (isMounted) {
          setRole(null);
          setError(err instanceof Error ? err.message : "Unable to load role.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadRole();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    role,
    isLoading,
    error,
  } as const;
}

