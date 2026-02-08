"use client";

import React, { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import {
  Bell,
  ChevronRight,
  PanelLeftClose,
  PanelRightClose,
} from "lucide-react";
import Profile01 from "./profile";
import Link from "next/link";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import NotificationModalContainer from "./notification-modal-container";
import { useUserNotifications } from "@/hooks/useUserNotifications";

interface BreadcrumbItem {
  label: string;
  href?: string;
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

const createAvatarUrl = (seed: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    seed || "Verde User"
  )}&background=0D8ABC&color=ffffff&size=128`;

interface TopNavProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function TopNav({ toggleSidebar, isSidebarOpen }: TopNavProps) {
  const pathname = usePathname();
  const [projectName, setProjectName] = useState<string | null>(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [avatarVersion, setAvatarVersion] = useState<number>(Date.now());
  // ...existing code...
  const breadcrumbs: BreadcrumbItem[] = [];
  const pathParts = pathname.split("/").filter((part) => part);
  const mainCategory = pathParts[1];
  const slug = pathParts[2];

  const [userId, setUserId] = useState<string | null>(null);

  // Remove direct useUserNotifications, let NotificationModalContainer handle fetching
  // unreadCount will be handled inside NotificationModalContainer/modal

  // Placeholder handlers (implement Supabase update logic if needed)
  const handleMarkAsRead = (id: string) => {
    // TODO: Implement Supabase update for marking as read
  };

  const handleMarkAllAsRead = () => {
    // TODO: Implement Supabase update for marking all as read
  };

  const handleClearNotification = (id: string) => {
    // TODO: Implement Supabase delete for notification
  };

  useEffect(() => {
    let isMounted = true;

    const loadAvatar = async () => {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      if (authError || !authData?.user) {
        setProfileAvatarUrl(null);
        return;
      }

      const authUser = authData.user;

      const { data: userProfile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", authUser.id)
        .maybeSingle();

      if (!isMounted) {
        return;
      }

      if (profileError) {
        console.error("Failed to load user avatar", profileError);
      }

      const fullName = [
        userProfile?.first_name?.trim(),
        userProfile?.last_name?.trim(),
      ]
        .filter(Boolean)
        .join(" ");

      const displayName =
        fullName || authUser.user_metadata?.display_name || authUser.email;

      const profileAvatarCandidate = [
        userProfile?.avatar_url,
        userProfile?.avatar,
        userProfile?.profile_image_url,
        userProfile?.image_url,
      ].find((value) => isValidUrl(value));

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
        createAvatarUrl(displayName || authUser.id);

      setProfileName(displayName ?? null);
      setProfileAvatarUrl(avatarUrl);
      setAvatarVersion(Date.now());
    };

    loadAvatar();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (mainCategory !== "projects" || !slug) {
      setProjectName(null);
      return;
    }

    let isMounted = true;

    const fetchProjectName = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("project_name")
        .eq("slug", slug)
        .maybeSingle();

      if (!isMounted) {
        return;
      }

      if (error) {
        console.error("Failed to load project breadcrumb", error);
        setProjectName(null);
        return;
      }

      setProjectName(data?.project_name ?? null);
    };

    fetchProjectName();

    return () => {
      isMounted = false;
    };
  }, [mainCategory, slug]);

  useEffect(() => {
    const fetchUserId = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        setUserId(null);
      } else {
        setUserId(data.user.id);
      }
    };
    fetchUserId();
  }, []);

  // ...existing code...

  const formatFromSlug = (value: string) =>
    value
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

  if (pathParts.length === 1 && pathParts[0] === "dashboard") {
    breadcrumbs.push({ label: "Overview" });
    breadcrumbs.push({ label: "Dashboard", href: "/dashboard" });
  } else if (pathParts.length > 1) {
    switch (mainCategory) {
      case "projects":
        breadcrumbs.push({ label: "Overview" });
        breadcrumbs.push({ label: "Projects", href: "/dashboard/projects" });
        if (slug) {
          breadcrumbs.push({
            label: projectName ?? formatFromSlug(slug),
          });
        }
        break;
      case "approval":
        breadcrumbs.push({ label: "Overview" });
        breadcrumbs.push({ label: "Approval", href: "/dashboard/approval" });
        break;
      case "reports":
        breadcrumbs.push({ label: "Overview" });
        breadcrumbs.push({ label: "Reports", href: "/dashboard/reports" });
        break;
      case "members":
        breadcrumbs.push({ label: "Team" });
        breadcrumbs.push({ label: "Members", href: "/dashboard/members" });
        break;
      case "organization":
        breadcrumbs.push({ label: "Team" });
        breadcrumbs.push({
          label: "Organization",
          href: "/dashboard/organization",
        });
        break;
      case "permissions":
        breadcrumbs.push({ label: "Team" });
        breadcrumbs.push({
          label: "Permissions",
          href: "/dashboard/permissions",
        });
        break;
      default:
        // Fallback for any other pages under dashboard
        breadcrumbs.push({ label: "Overview" });
        breadcrumbs.push({
          label: mainCategory.charAt(0).toUpperCase() + mainCategory.slice(1),
        });
        break;
    }
  }

  if (breadcrumbs.length > 0) {
    // The last breadcrumb should not be a link
    breadcrumbs[breadcrumbs.length - 1].href = undefined;
  }

  const fallbackAvatar = createAvatarUrl(profileName ?? "Verde User");
  const resolvedAvatar = profileAvatarUrl ?? fallbackAvatar;
  const displayAvatarSrc = `${resolvedAvatar}${
    resolvedAvatar.includes("?") ? "&" : "?"
  }v=${avatarVersion}`;

  return (
    <nav className="px-3 sm:px-6 flex items-center justify-between bg-background dark:bg-gray-900 h-full">
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="p-1.5 sm:p-2 hover:bg-muted rounded-full transition-colors"
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="h-5 w-5 text-muted-foreground" />
          ) : (
            <PanelRightClose className="h-5 w-5 text-muted-foreground" />
          )}
        </button>
        <div className="font-medium text-sm hidden lg:flex items-center space-x-1 max-w-[300px] overflow-hidden whitespace-nowrap">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
              )}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className="text-foreground font-medium"
                  style={
                    index === breadcrumbs.length - 1 &&
                    mainCategory === "projects" &&
                    slug
                      ? {
                          maxWidth: "180px",
                          display: "inline-block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          WebkitMaskImage:
                            "linear-gradient(90deg, #000 80%, transparent)",
                          maskImage:
                            "linear-gradient(90deg, #000 80%, transparent)",
                        }
                      : undefined
                  }
                >
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 ml-auto">
        <button
          type="button"
          className="p-1.5 sm:p-2 hover:bg-muted rounded-full transition-colors relative"
          onClick={() => setNotificationOpen(true)}
          aria-label="Open notifications"
        >
          <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          {/* NotificationModalContainer will handle unread count badge */}
        </button>

        {userId && (
          <NotificationModalContainer
            open={notificationOpen}
            onOpenChange={setNotificationOpen}
            userId={userId}
          />
        )}

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden ring-2 ring-border cursor-pointer">
              {profileAvatarUrl || profileName ? (
                <Image
                  src={displayAvatarSrc}
                  alt={profileName ? `${profileName} avatar` : "User avatar"}
                  fill
                  sizes="36px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 bg-muted" />
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-[280px] sm:w-80 overflow-hidden rounded-2xl border border-emerald-100/70 dark:border-emerald-900/40 bg-gradient-to-br from-sky-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/40 shadow-2xl backdrop-blur"
          >
            <Profile01
              onAvatarChange={(url) => {
                setProfileAvatarUrl(url);
                setAvatarVersion(Date.now());
              }}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
