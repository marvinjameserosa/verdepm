import type { User } from "@/types/user";

type MembersResponse = {
  members?: User[];
  error?: string;
};

export async function fetchMembers(): Promise<User[]> {
  const response = await fetch("/api/admin/members", {
    method: "GET",
  });

  const payload = (await response.json().catch(() => ({}))) as MembersResponse;

  if (!response.ok) {
    throw new Error(
      payload?.error ?? "Failed to fetch members for this organization."
    );
  }

  return payload.members ?? [];
}
