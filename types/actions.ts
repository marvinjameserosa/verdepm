import type { z } from "zod";
import { inviteMemberSchema } from "./auth";

export type InviteMemberPayload = z.infer<typeof inviteMemberSchema>;

export const normalizeInviteMemberPayload = (
  payload: InviteMemberPayload
): InviteMemberPayload => ({
  email: payload.email.trim(),
  password: payload.password,
  firstname: payload.firstname.trim(),
  lastname: payload.lastname.trim(),
  phone: payload.phone ? payload.phone.trim() : "",
  role: payload.role,
});

export interface UploadMemberAvatarParams {
  userId: string;
  file: File;
  previousPath?: string | null;
}

export interface UploadMemberAvatarResult {
  publicUrl: string;
  filePath: string;
}
