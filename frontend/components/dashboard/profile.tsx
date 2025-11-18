"use client";

import React, { useEffect, useState } from "react";
import {
  LogOut,
  MoveUpRight,
  Settings,
  CreditCard,
  FileText,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";

interface MenuItem {
  label: string;
  value?: string;
  href: string;
  icon?: React.ReactNode;
  external?: boolean;
}

const defaultProfile = {
  name: "Eugene An",
  role: "Prompt Engineer",
  avatar:
    "https://ferf1mheo22r9ira.public.blob.vercel-storage.com/avatar-02-albo9B0tWOSLXCVZh9rX9KFxXIVWMr.png",
  subscription: "Free Trial",
};

type ProfileState = typeof defaultProfile;

export default function Profile01() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileState>(defaultProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

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
        .select("first_name, last_name, role, avatar")
        .eq("user_id", authUser.id)
        .maybeSingle();

      if (!isMounted) return;

      if (profileError) {
        console.error("Failed to load profile", profileError);
        setErrorMessage("Unable to load profile details.");
      }

      const firstName = userProfile?.first_name?.trim();
      const lastName = userProfile?.last_name?.trim();
      const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

      setProfile({
        name:
          fullName ||
          authUser.user_metadata?.display_name ||
          authUser.email ||
          defaultProfile.name,
        role:
          userProfile?.role ||
          authUser.user_metadata?.role ||
          defaultProfile.role,
        avatar:
          userProfile?.avatar ||
          authUser.user_metadata?.avatar_url ||
          defaultProfile.avatar,
        subscription:
          (authUser.user_metadata?.subscription as string | undefined) ||
          defaultProfile.subscription,
      });

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
      label: "Subscription",
      value: profile.subscription,
      href: "#",
      icon: <CreditCard className="w-4 h-4" />,
      external: false,
    },
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

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <div className="relative px-6 pt-12 pb-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="relative shrink-0">
              <Image
                src={profile.avatar}
                alt={profile.name}
                width={72}
                height={72}
                className="rounded-full ring-4 ring-white dark:ring-zinc-900 object-cover"
              />
              <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                {isLoading ? (
                  <span className="inline-block h-4 w-32 animate-pulse rounded bg-muted" />
                ) : (
                  profile.name
                )}
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400">
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
          <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-6" />
          <div className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center justify-between p-2 
                                    hover:bg-zinc-50 dark:hover:bg-zinc-800/50 
                                    rounded-lg transition-colors duration-200"
              >
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center">
                  {item.value && (
                    <span className="text-sm text-zinc-500 dark:text-zinc-400 mr-2">
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
                                hover:bg-zinc-50 dark:hover:bg-zinc-800/50 
                                rounded-lg transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
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
