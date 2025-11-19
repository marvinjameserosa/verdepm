export interface InviteMemberPayload {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  phone: string;
  role: string;
}

export async function inviteMember(
  payload: InviteMemberPayload
): Promise<unknown> {
  const response = await fetch("/api/admin/create-user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      (result && typeof result === "object" && "error" in result
        ? String((result as { error?: string }).error)
        : null) ?? "Failed to create user.";
    throw new Error(message);
  }

  return result;
}
