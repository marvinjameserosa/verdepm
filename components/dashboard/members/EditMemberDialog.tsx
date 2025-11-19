"use client";

import { type ChangeEvent } from "react";
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
import Image from "next/image";
import { type User } from "@/types/user";
import {
  useEditMemberForm,
  type EditMemberFormState,
} from "@/hooks/useEditMemberForm";

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
  const {
    formData,
    avatarPreview,
    isUploadingAvatar,
    avatarError,
    fileInputRef,
    handleFieldChange,
    handleRoleChange,
    handleAvatarUpload,
    handleAvatarRemove,
  } = useEditMemberForm(member);

  const roleOptions =
    availableRoles && availableRoles.length > 0
      ? availableRoles
      : (["owner", "manager", "member"] as User["role"][]);

  const handleAvatarFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    handleAvatarUpload(file);
    event.target.value = "";
  };

  const handleSubmit = () => {
    if (!member || isUploadingAvatar) return;

    const entries = Object.entries(formData).filter(
      ([, value]) => value !== undefined
    );

    const cleanedFormData = Object.fromEntries(entries) as EditMemberFormState;

    const {
      avatar_url,
      avatar_storage_path,
      role,
      ...rest
    } = cleanedFormData;

    const nextMember: User = {
      ...member,
      ...(rest as Partial<User>),
      role: (role ?? member.role) as User["role"],
    };

    if (avatar_url !== undefined) {
      nextMember.avatar_url = avatar_url === null ? undefined : avatar_url;
    }

    if (avatar_storage_path !== undefined) {
      nextMember.avatar_storage_path =
        avatar_storage_path === null ? undefined : avatar_storage_path;
    }

    onUpdate(nextMember);
  };

  if (!member) return null;

  const displayName = `${member.first_name ?? ""} ${member.last_name ?? ""}`
    .trim()
    .replace(/\s+/g, " ");
  const avatarAlt = displayName || member.email || "Member avatar";

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
                alt={avatarAlt}
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
                  onClick={() => fileInputRef.current?.click()}
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
                  onChange={handleAvatarFileChange}
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
                value={formData.first_name ?? ""}
                onChange={(event) =>
                  handleFieldChange("first_name", event.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name ?? ""}
                onChange={(event) =>
                  handleFieldChange("last_name", event.target.value)
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={formData.email ?? ""}
              onChange={(event) =>
                handleFieldChange("email", event.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone ?? ""}
              onChange={(event) =>
                handleFieldChange("phone", event.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role ?? member?.role ?? undefined}
              onValueChange={(value) =>
                handleRoleChange(value as User["role"])
              }
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

