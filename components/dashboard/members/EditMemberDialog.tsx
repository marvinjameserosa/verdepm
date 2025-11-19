"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type User } from "@/types/user";
import { supabase } from "@/lib/supabase/client";
import Image from "next/image";

const AVATAR_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_AVATARS_BUCKET ?? "avatars";

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

interface EditMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  member: User | null;
  onUpdate: (updatedMember: User) => void;
  availableRoles?: User["role"][];
}

export const EditMemberDialog = ({
  isOpen,
  onClose,
  member,
  onUpdate,
  availableRoles,
}: EditMemberDialogProps) => {
  const [formData, setFormData] = useState<Partial<User>>({});
  const [avatarPreview, setAvatarPreview] = useState<string>(
    buildFallbackAvatar(null)
  );
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const roleOptions =
    availableRoles && availableRoles.length > 0
      ? availableRoles
      : (["owner", "manager", "member"] as User["role"][]);

  useEffect(() => {
    if (member) {
      setFormData({
        email: member.email,
        first_name: member.first_name,
        last_name: member.last_name,
        phone: member.phone,
        role: member.role,
        avatar_url: member.avatar_url ?? null,
        avatar_storage_path: member.avatar_storage_path ?? null,
      });
      const initialAvatarUrl = [member.avatar_url, member.avatar].find(
        (value) => isValidUrl(value)
      );
      const initialPreview = initialAvatarUrl
        ? withCacheBuster(initialAvatarUrl)
        : buildFallbackAvatar(member);
      setAvatarPreview(initialPreview);
      setAvatarError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } else {
      setFormData({});
      setAvatarPreview(buildFallbackAvatar(null));
      setAvatarError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [member]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value as User["role"] }));
  };

  const handleChooseAvatar = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!member) return;

    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Please choose an image smaller than 5MB.");
      return;
    }

    setIsUploadingAvatar(true);
    setAvatarError(null);

    const extension = file.name.split(".").pop();
    const uniqueId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}`;
    const filePath = `${member.user_id}/${uniqueId}.${extension ?? "png"}`;

    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Failed to upload avatar", uploadError);
      setAvatarError(
        uploadError.message || "Unable to upload image. Please try again."
      );
      setIsUploadingAvatar(false);
      return;
    }

    const previousPath =
      (formData.avatar_storage_path as string | null | undefined) ||
      member.avatar_storage_path ||
      null;

    if (previousPath && previousPath !== filePath) {
      try {
        await supabase.storage.from(AVATAR_BUCKET).remove([previousPath]);
      } catch (removalError) {
        console.warn("Failed to remove previous avatar", removalError);
      }
    }

    const { data: publicUrlData } = supabase.storage
      .from(AVATAR_BUCKET)
      .getPublicUrl(filePath);

    if (!publicUrlData?.publicUrl) {
      console.error("Failed to get public URL", publicUrlData);
      setAvatarError("Unable to load uploaded image. Please try again.");
      setIsUploadingAvatar(false);
      return;
    }

    const publicUrl = publicUrlData.publicUrl;

    setFormData((prev) => ({
      ...prev,
      avatar_url: publicUrl,
      avatar_storage_path: filePath,
    }));
    setAvatarPreview(withCacheBuster(publicUrl));
    setAvatarError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setIsUploadingAvatar(false);
  };

  const handleAvatarRemove = async () => {
    if (!member) return;

    setIsUploadingAvatar(true);
    setAvatarError(null);

    const currentPath =
      (formData.avatar_storage_path as string | null | undefined) ||
      member.avatar_storage_path ||
      null;

    if (currentPath) {
      try {
        await supabase.storage.from(AVATAR_BUCKET).remove([currentPath]);
      } catch (removalError) {
        console.warn("Failed to remove avatar", removalError);
      }
    }

    setFormData((prev) => ({
      ...prev,
      avatar_url: null,
      avatar_storage_path: null,
    }));
    setAvatarPreview(buildFallbackAvatar(member));
    setAvatarError(null);
    setIsUploadingAvatar(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = () => {
    if (!member || isUploadingAvatar) return;

    const cleanedFormData = Object.fromEntries(
      Object.entries(formData).filter(([, value]) => value !== undefined)
    ) as Partial<User>;

    onUpdate({
      ...member,
      ...cleanedFormData,
      role: (cleanedFormData.role ?? member.role) as User["role"],
    });
  };

  if (!member) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-hidden rounded-2xl border border-emerald-100/70 dark:border-emerald-900/40 bg-gradient-to-br from-sky-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/40 shadow-2xl backdrop-blur p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
            Edit Member
          </DialogTitle>
          <DialogDescription>
            Update the details for {member.first_name} {member.last_name}.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 space-y-4 px-6 py-4 overflow-y-auto">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-emerald-100/70 dark:border-emerald-900/40 bg-white/70 dark:bg-slate-900/40 p-4">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border border-emerald-100/70 dark:border-emerald-900/40 bg-white shadow-sm">
              <Image
                src={avatarPreview}
                alt={
                  member.first_name || member.last_name
                    ? `${member.first_name ?? ""} ${
                        member.last_name ?? ""
                      }`.trim()
                    : member.email || "Member avatar"
                }
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                  Profile photo
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG or JPG up to 5MB. Square images look best.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleChooseAvatar}
                  disabled={isUploadingAvatar}
                  className="rounded-lg bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white shadow-sm"
                >
                  {isUploadingAvatar ? "Uploading..." : "Change photo"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
                {(formData.avatar_url || formData.avatar_storage_path) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleAvatarRemove}
                    disabled={isUploadingAvatar}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                )}
              </div>
              {avatarError && (
                <p className="text-xs text-red-600">{avatarError}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={formData.first_name || ""}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name || ""}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={formData.email || ""}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone || ""}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role ?? member?.role ?? undefined}
              onValueChange={handleRoleChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent className="z-100">
                {roleOptions.map((roleName) => (
                  <SelectItem key={roleName} value={roleName}>
                    {roleName.charAt(0).toUpperCase() + roleName.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="px-6 pb-6 pt-4 border-t border-emerald-100/70 dark:border-emerald-900/40 bg-white/60 dark:bg-slate-950/40 backdrop-blur">
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
