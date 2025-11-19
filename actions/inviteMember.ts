import {
  normalizeInviteMemberPayload,
  type InviteMemberPayload,
} from "@/types/actions";
import { inviteMemberSchema } from "@/types/auth";
import { ZodError } from "zod";

export async function inviteMember(
  payload: InviteMemberPayload
): Promise<unknown> {
  const normalizedPayload = normalizeInviteMemberPayload(payload);

  let validatedPayload: InviteMemberPayload;

  try {
    validatedPayload = inviteMemberSchema.parse(normalizedPayload);
  } catch (error) {
    if (error instanceof ZodError) {
      const firstIssue = error.issues[0];
      throw new Error(firstIssue?.message ?? "Invalid invite payload.");
    }
    throw error;
  }

  const requestBody = {
    ...validatedPayload,
    phone:
      validatedPayload.phone && validatedPayload.phone.length > 0
        ? validatedPayload.phone
        : undefined,
  } satisfies Partial<InviteMemberPayload> &
    Pick<InviteMemberPayload, "email" | "password" | "firstname" | "lastname" | "role">;

  const response = await fetch("/api/admin/create-user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
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
