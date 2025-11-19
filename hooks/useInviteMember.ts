"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
  inviteMember as inviteMemberAction,
} from "@/actions/members/inviteMember";
import type { InviteMemberPayload } from "@/types/actions";

export function useInviteMember() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<unknown | null>(null);

  const inviteMember = useCallback(
    async (payload: InviteMemberPayload) => {
      setLoading(true);
      setError(null);
      setData(null);

      try {
        const result = await inviteMemberAction(payload);
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

  return { inviteMember, loading, error, data } as const;
}
