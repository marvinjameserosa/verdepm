import { useCallback, useEffect, useState } from "react";
import type { User } from "@/types/user";
import { fetchMembers } from "@/actions/members/members";

export const useMembers = () => {
  const [members, setMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchMembers();
      setMembers(data);
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshMembers();
  }, [refreshMembers]);

  return {
    members,
    setMembers,
    refreshMembers,
    isLoading,
  } as const;
};
