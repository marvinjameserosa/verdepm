"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { User } from "@/types/user";
import {
  removeMemberAvatar,
  uploadMemberAvatar,
} from "@/actions/members/memberAvatar";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB

export type EditMemberFormState = Partial<
  Omit<User, "avatar_url" | "avatar_storage_path">
> & {
  avatar_url?: string | null;
  avatar_storage_path?: string | null;
};

const isValidUrl = (value?: string | null) => {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const buildFallbackAvatar = (member: User | null) => {
  if (!member) {
    return "https://ui-avatars.com/api/?name=Verde+Member&background=0D8ABC&color=ffffff&size=128";
  }

  const displayName = `${member.first_name ?? ""} ${member.last_name ?? ""}`
    .trim()
    .replace(/\s+/g, " ");

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    displayName || member.email || "Verde Member"
  )}&background=0D8ABC&color=ffffff&size=128`;
};

const withCacheBuster = (url: string) =>
  `${url}${url.includes("?") ? "&" : "?"}v=${Date.now()}`;

type EditableMemberField =
  | "email"
  | "first_name"
  | "last_name"
  | "phone"
  | "role"
  | "avatar_url"
  | "avatar_storage_path";

export const useEditMemberForm = (member: User | null) => {
  const [formData, setFormData] = useState<EditMemberFormState>({});
  const [avatarPreview, setAvatarPreview] = useState<string>(
    buildFallbackAvatar(null)
  );
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!member) {
      setFormData({});
      setAvatarPreview(buildFallbackAvatar(null));
      setAvatarError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setFormData({
      email: member.email,
      first_name: member.first_name,
      last_name: member.last_name,
      phone: member.phone,
      role: member.role,
      avatar_url: member.avatar_url ?? null,
      avatar_storage_path: member.avatar_storage_path ?? null,
    });

    const initialAvatarUrl = [member.avatar_url, member.avatar].find((value) =>
      isValidUrl(value)
    );
    const initialPreview = initialAvatarUrl
      ? withCacheBuster(initialAvatarUrl)
      : buildFallbackAvatar(member);

    setAvatarPreview(initialPreview);
    setAvatarError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [member]);

  const handleFieldChange = useCallback(
    (field: EditableMemberField, value: string | null) => {
      setFormData((prev) => ({ ...prev, [field]: value ?? null }));
    },
    []
  );

  const handleRoleChange = useCallback((role: User["role"]) => {
    setFormData((prev) => ({ ...prev, role }));
  }, []);

  const resetAvatarInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleAvatarUpload = useCallback(
    async (file: File | null) => {
      if (!member || !file) return;

      if (file.size > MAX_AVATAR_SIZE) {
        setAvatarError("Please choose an image smaller than 5MB.");
        resetAvatarInput();
        return;
      }

      setIsUploadingAvatar(true);
      setAvatarError(null);

      const currentPath =
        formData.avatar_storage_path ?? member.avatar_storage_path ?? null;

      try {
        const result = await uploadMemberAvatar({
          userId: member.user_id,
          file,
          previousPath: currentPath,
        });

        setFormData((prev) => ({
          ...prev,
          avatar_url: result.publicUrl,
          avatar_storage_path: result.filePath,
        }));
        setAvatarPreview(withCacheBuster(result.publicUrl));
        setAvatarError(null);
      } catch (error) {
        console.error("Failed to upload avatar", error);
        setAvatarError(
          error instanceof Error
            ? error.message
            : "Unable to upload image. Please try again."
        );
      } finally {
        setIsUploadingAvatar(false);
        resetAvatarInput();
      }
    },
    [formData.avatar_storage_path, member, resetAvatarInput]
  );

  const handleAvatarRemove = useCallback(async () => {
    if (!member) return;

    setIsUploadingAvatar(true);
    setAvatarError(null);

    const currentPath =
      formData.avatar_storage_path ?? member.avatar_storage_path ?? null;

    try {
      if (currentPath) {
        await removeMemberAvatar(currentPath);
      }

      setFormData((prev) => ({
        ...prev,
        avatar_url: null,
        avatar_storage_path: null,
      }));
      setAvatarPreview(buildFallbackAvatar(member));
      setAvatarError(null);
    } catch (error) {
      console.error("Failed to remove avatar", error);
      setAvatarError(
        error instanceof Error
          ? error.message
          : "Unable to remove image. Please try again."
      );
    } finally {
      setIsUploadingAvatar(false);
      resetAvatarInput();
    }
  }, [formData.avatar_storage_path, member, resetAvatarInput]);

  return {
    formData,
    avatarPreview,
    isUploadingAvatar,
    avatarError,
    fileInputRef,
    handleFieldChange,
    handleRoleChange,
    handleAvatarUpload,
    handleAvatarRemove,
  } as const;
};
