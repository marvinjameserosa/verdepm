"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { inviteMember } from "@/actions/inviteMember";
import type { InviteMemberPayload } from "@/actions/inviteMember";

export function useInviteMember() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<unknown | null>(null);

  const handleInviteMember = useCallback(
    async (payload: InviteMemberPayload) => {
      setLoading(true);
      setError(null);
      setData(null);

      try {
        const result = await inviteMember(payload);
        setData(result);
        await router.refresh();
        return result;
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to create user.");
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  return { inviteMember: handleInviteMember, loading, error, data } as const;
}
