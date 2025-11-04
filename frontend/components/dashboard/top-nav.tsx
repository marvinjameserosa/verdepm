"use client";

import React from "react";
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
import { projects } from "@/lib/data";
import { usePathname } from "next/navigation";

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
  const breadcrumbs: BreadcrumbItem[] = [];
  const pathParts = pathname.split("/").filter((part) => part);

  if (pathParts.length === 1 && pathParts[0] === "dashboard") {
    breadcrumbs.push({ label: "Overview" });
    breadcrumbs.push({ label: "Dashboard", href: "/dashboard" });
  } else if (pathParts.length > 1) {
    const mainCategory = pathParts[1];
    const slug = pathParts[2];

    switch (mainCategory) {
      case "projects":
        breadcrumbs.push({ label: "Overview" });
        breadcrumbs.push({ label: "Projects", href: "/dashboard/projects" });
        if (slug) {
          const project = projects.find((p) => p.slug === slug);
          if (project) {
            breadcrumbs.push({ label: project.name });
          }
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
    <nav className="px-3 sm:px-6 flex items-center justify-between bg-background h-full">
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="p-1.5 sm:p-2 hover:bg-muted rounded-full transition-colors"
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
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
          className="p-1.5 sm:p-2 hover:bg-muted rounded-full transition-colors"
        >
          <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
        </button>

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
