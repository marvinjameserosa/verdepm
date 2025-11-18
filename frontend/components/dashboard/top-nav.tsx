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
import Profile01 from "./profile-01";
import Link from "next/link";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { usePathname } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { NotificationModal } from "./notification-modal";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface TopNavProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function TopNav({ toggleSidebar, isSidebarOpen }: TopNavProps) {
  const pathname = usePathname();
  const [projectName, setProjectName] = useState<string | null>(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "New member added",
      message: "John Doe has been added to the Verde Project Management team",
      timestamp: new Date(Date.now() - 5 * 60000), // 5 minutes ago
      read: false,
      type: "info" as const,
    },
    {
      id: "2",
      title: "Project update",
      message: "Construction phase completed for Project Alpha",
      timestamp: new Date(Date.now() - 2 * 3600000), // 2 hours ago
      read: false,
      type: "success" as const,
    },
    {
      id: "3",
      title: "Report generated",
      message: "Monthly ESG report is ready for review",
      timestamp: new Date(Date.now() - 24 * 3600000), // 1 day ago
      read: true,
      type: "info" as const,
    },
  ]);
  const breadcrumbs: BreadcrumbItem[] = [];
  const pathParts = pathname.split("/").filter((part) => part);
  const mainCategory = pathParts[1];
  const slug = pathParts[2];

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  useEffect(() => {
    if (mainCategory !== "projects" || !slug) {
      setProjectName(null);
      return;
    }

    let isMounted = true;

    const fetchProjectName = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("name")
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

      setProjectName(data?.name ?? null);
    };

    fetchProjectName();

    return () => {
      isMounted = false;
    };
  }, [mainCategory, slug]);

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
      case "reports":
        breadcrumbs.push({ label: "Overview" });
        breadcrumbs.push({ label: "Reports", href: "/dashboard/reports" });
        break;
      case "members":
        breadcrumbs.push({ label: "Team" });
        breadcrumbs.push({ label: "Members", href: "/dashboard/members" });
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
        <div className="font-medium text-sm hidden lg:flex items-center space-x-1 truncate max-w-[300px]">
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
                <span className="text-foreground font-medium">
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
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 h-2 w-2 bg-red-500 rounded-full ring-2 ring-background" />
          )}
        </button>

        <NotificationModal
          open={notificationOpen}
          onOpenChange={setNotificationOpen}
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onClearNotification={handleClearNotification}
        />

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <Image
              src="https://ferf1mheo22r9ira.public.blob.vercel-storage.com/avatar-01-n0x8HFv8EUetf9z6ht0wScJKoTHqf8.png"
              alt="User avatar"
              width={28}
              height={28}
              className="rounded-full ring-2 ring-border sm:w-8 sm:h-8 cursor-pointer"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-[280px] sm:w-80 bg-background border-border rounded-lg shadow-lg"
          >
            <Profile01 avatar="https://ferf1mheo22r9ira.public.blob.vercel-storage.com/avatar-01-n0x8HFv8EUetf9z6ht0wScJKoTHqf8.png" />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
