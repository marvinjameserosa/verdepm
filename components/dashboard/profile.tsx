"use client";

import React, { useEffect, useRef, useState } from "react";
import { LogOut, MoveUpRight, Settings, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface MenuItem {
  label: string;
  value?: string;
  href: string;
  icon?: React.ReactNode;
  external?: boolean;
}

const isValidUrl = (value?: string | null) => {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const AVATAR_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_AVATARS_BUCKET ?? "avatars";

const createAvatarUrl = (seed: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    seed || "Verde User"
  )}&background=0D8ABC&color=ffffff&size=128`;

interface ProfileState {
  userId: string | null;
  email: string | null;
  name: string;
  role: string;
  avatarUrl: string;
  avatarStoragePath: string | null;
}

const defaultProfile: ProfileState = {
  userId: null,
  email: null,
  name: "Eugene An",
  role: "Prompt Engineer",
  avatarUrl: createAvatarUrl("Eugene An"),
  avatarStoragePath: null,
};

interface Profile01Props {
  onAvatarChange?: (url: string) => void;
}

export default function Profile01({ onAvatarChange }: Profile01Props) {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileState>(defaultProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarVersion, setAvatarVersion] = useState<number>(Date.now());
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      const { data: userResponse, error: authError } =
        await supabase.auth.getUser();

      if (!isMounted) return;

      if (authError || !userResponse?.user) {
        setErrorMessage(authError?.message ?? "You are not signed in.");
        setIsLoading(false);
        return;
      }

      const authUser = userResponse.user;
      const { data: userProfile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", authUser.id)
        .maybeSingle();

      if (!isMounted) return;

      if (profileError) {
        console.error("Failed to load profile", profileError);
        setErrorMessage("Unable to load profile details.");
      }

      const {
        data: membership,
        error: membershipError,
      } = await supabase
        .from("organization_member")
        .select("role")
        .eq("user_id", authUser.id)
        .maybeSingle();

      if (membershipError && membershipError.code !== "PGRST116") {
        console.warn("Failed to load membership role", membershipError);
      }

      const firstName = userProfile?.first_name?.trim();
      const lastName = userProfile?.last_name?.trim();
      const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

      const resolvedName =
        fullName ||
        authUser.user_metadata?.display_name ||
        authUser.email ||
        defaultProfile.name;

      const profileAvatarCandidate = isValidUrl(userProfile?.avatar_url)
        ? userProfile?.avatar_url
        : isValidUrl(userProfile?.avatar)
        ? userProfile?.avatar
        : null;

      const metadataAvatarCandidate = [
        authUser.user_metadata?.avatar_url,
        authUser.user_metadata?.avatar,
        authUser.user_metadata?.picture,
        authUser.user_metadata?.image_url,
        authUser.user_metadata?.profile_image_url,
      ].find((value) => isValidUrl(value));

      const avatarUrl =
        profileAvatarCandidate ||
        metadataAvatarCandidate ||
        createAvatarUrl(resolvedName || authUser.email || "Verde User");

      setProfile({
        userId: authUser.id,
        email: authUser.email ?? null,
        name: resolvedName,
        role:
          (membership?.role &&
            typeof membership.role === "string" &&
            membership.role) ||
          userProfile?.role ||
          authUser.user_metadata?.role ||
          defaultProfile.role,
        avatarUrl,
        avatarStoragePath: userProfile?.avatar_storage_path ?? null,
      });
      setAvatarVersion(Date.now());

      setIsLoading(false);
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    setIsSigningOut(true);
    setErrorMessage(null);

    const { error } = await supabase.auth.signOut();

    if (error) {
      setErrorMessage(error.message);
    } else {
      router.push("/");
    }

    setIsSigningOut(false);
  };

  const menuItems: MenuItem[] = [
    {
      label: "Settings",
      href: "#",
      icon: <Settings className="w-4 h-4" />,
    },
    {
      label: "Terms & Policies",
      href: "#",
      icon: <FileText className="w-4 h-4" />,
      external: true,
    },
  ];
  const handleChooseAvatar = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !profile.userId) {
      return;
    }

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
    const filePath = `${profile.userId}/${uniqueId}.${extension ?? "png"}`;

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

    const { data: publicUrlData } = supabase.storage
      .from(AVATAR_BUCKET)
      .getPublicUrl(filePath);

    if (!publicUrlData?.publicUrl) {
      console.error("Failed to obtain public avatar URL");
      setAvatarError("Unable to load uploaded image. Please try again.");
      setIsUploadingAvatar(false);
      return;
    }

    const publicUrl = publicUrlData.publicUrl;

    try {
      const response = await fetch("/api/admin/update-user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: profile.userId,
          avatarUrl: publicUrl,
          avatarStoragePath: filePath,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const message = payload?.error ?? "Failed to update profile image.";
        throw new Error(message);
      }

      const previousPath = profile.avatarStoragePath;
      if (previousPath && previousPath !== filePath) {
        try {
          await supabase.storage.from(AVATAR_BUCKET).remove([previousPath]);
        } catch (removalError) {
          console.warn("Failed to remove previous avatar", removalError);
        }
      }

      setProfile((prev) => ({
        ...prev,
        avatarUrl: publicUrl,
        avatarStoragePath: filePath,
      }));
      setAvatarVersion(Date.now());
      onAvatarChange?.(publicUrl);
    } catch (error) {
      console.error("Failed to set profile avatar", error);
      try {
        await supabase.storage.from(AVATAR_BUCKET).remove([filePath]);
      } catch (removalError) {
        console.warn("Failed to roll back uploaded avatar", removalError);
      }
      setAvatarError(
        error instanceof Error
          ? error.message
          : "Unable to update profile image."
      );
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAvatarRemove = async () => {
    if (!profile.userId) {
      return;
    }

    setIsUploadingAvatar(true);
    setAvatarError(null);

    const fallbackAvatar = createAvatarUrl(
      profile.name || profile.email || "Verde User"
    );

    try {
      const response = await fetch("/api/admin/update-user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: profile.userId,
          avatarUrl: null,
          avatarStoragePath: null,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const message = payload?.error ?? "Failed to remove profile image.";
        throw new Error(message);
      }

      if (profile.avatarStoragePath) {
        try {
          await supabase.storage
            .from(AVATAR_BUCKET)
            .remove([profile.avatarStoragePath]);
        } catch (removalError) {
          console.warn("Failed to remove stored avatar", removalError);
        }
      }

      setProfile((prev) => ({
        ...prev,
        avatarUrl: fallbackAvatar,
        avatarStoragePath: null,
      }));
      setAvatarVersion(Date.now());
      onAvatarChange?.(fallbackAvatar);
    } catch (error) {
      console.error("Failed to clear avatar", error);
      setAvatarError(
        error instanceof Error
          ? error.message
          : "Unable to remove profile image."
      );
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const resolvedAvatarUrl =
    profile.avatarUrl ||
    createAvatarUrl(profile.name || profile.email || "Verde User");
  const displayAvatarUrl = `${resolvedAvatarUrl}${
    resolvedAvatarUrl.includes("?") ? "&" : "?"
  }v=${avatarVersion}`;

  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/40 shadow-2xl">
        <div className="relative px-6 pt-12 pb-6">
          <div className="flex flex-col items-center text-center mb-8 gap-3">
            <div className="relative w-20 h-20 rounded-full overflow-hidden border border-emerald-100/70 dark:border-emerald-900/40 bg-white shadow-sm">
              {isLoading ? (
                <div className="absolute inset-0 animate-pulse bg-muted" />
              ) : (
                <Image
                  src={displayAvatarUrl}
                  alt={`${profile.name}'s avatar`}
                  fill
                  sizes="80px"
                  className="object-cover"
                  priority
                />
              )}
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleChooseAvatar}
                  disabled={isUploadingAvatar || isLoading}
                  className="rounded-lg bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white shadow-sm"
                >
                  {isUploadingAvatar ? "Uploading..." : "Change photo"}
                </Button>
                {profile.avatarStoragePath && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleAvatarRemove}
                    disabled={isUploadingAvatar || isLoading}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
              {avatarError && (
                <p className="text-xs text-red-600 max-w-[220px]">
                  {avatarError}
                </p>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
                {isLoading ? (
                  <span className="inline-block h-4 w-32 animate-pulse rounded bg-muted" />
                ) : (
                  profile.name
                )}
              </h2>
              <p className="text-gray-600 dark:text-slate-400">
                {isLoading ? (
                  <span className="inline-block h-3 w-24 animate-pulse rounded bg-muted" />
                ) : (
                  profile.role
                )}
              </p>
            </div>
          </div>

          {errorMessage && (
            <p className="mb-4 text-sm text-destructive" role="status">
              {errorMessage}
            </p>
          )}
          <div className="h-px bg-emerald-100/70 dark:bg-emerald-900/30 my-6" />
          <div className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center justify-between p-2 
                                    hover:bg-sky-50/80 dark:hover:bg-emerald-900/40 
                                    rounded-lg transition-colors duration-200"
              >
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center">
                  {item.value && (
                    <span className="text-sm text-gray-500 dark:text-slate-400 mr-2">
                      {item.value}
                    </span>
                  )}
                  {item.external && <MoveUpRight className="w-4 h-4" />}
                </div>
              </Link>
            ))}

            <button
              type="button"
              onClick={handleLogout}
              disabled={isSigningOut}
              className="w-full flex items-center justify-between p-2 
                                hover:bg-sky-50/80 dark:hover:bg-emerald-900/40 
                                rounded-lg transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                  {isSigningOut ? "Signing out..." : "Logout"}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
