"use client";

import type { ReactNode } from "react";
import {
  BarChart2,
  Folder,
  Users2,
  Settings,
  HelpCircle,
  Home,
  Flag,
  Building,
  Truck,
} from "lucide-react";

import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { SettingsModal } from "./settings-modal";
import { HelpModal } from "./help-modal";
import { useMemo, useState } from "react";
import { useCurrentRole } from "@/hooks/useCurrentRole";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/dashboard/projects", icon: Folder, label: "Projects" },
  { href: "/dashboard/approval", icon: Flag, label: "Approval" },
  { href: "/dashboard/members", icon: Users2, label: "Members" },
  { href: "/dashboard/organization", icon: Building, label: "Organization" },
  { href: "/dashboard/reports", icon: BarChart2, label: "Reports" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

interface SidebarProps {
  isSidebarOpen: boolean;
}

export default function Sidebar({ isSidebarOpen }: SidebarProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const { role } = useCurrentRole();

  const canAccessSupplierWorkspace = useMemo(() => {
    if (!role || typeof role !== "string") {
      return false;
    }
    const normalized = role.toLowerCase();
    return (
      normalized === "owner" ||
      normalized === "manager" ||
      normalized === "supplier"
    );
  }, [role]);

  function NavItem({
    href,
    icon: Icon,
    children,
  }: {
    href: string;
    icon: typeof Home;
    children: ReactNode;
  }) {
    return (
      <Link
        href={href}
        className="flex items-center px-3 py-2 text-sm rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
      >
        <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
        <span
          className={`transition-opacity duration-200 ${
            isSidebarOpen ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={!isSidebarOpen}
        >
          {children}
        </span>
      </Link>
    );
  }

  return (
    <nav
      className={`relative z-10 bg-sidebar/80 dark:bg-gray-800/80 backdrop-blur-xl border-r border-border/50 transition-all duration-300 ease-in-out ${
        isSidebarOpen ? "w-64" : "w-20"
      }`}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <Link
          href="/"
          className="flex h-16 items-center justify-center border-b border-border px-6"
        >
          <Logo
            className={`transition-all duration-300 ${
              isSidebarOpen ? "h-6" : "h-8"
            }`}
          />
        </Link>

        {/* Navigation groups */}
        <div className="flex-grow overflow-y-auto p-4">
          <div className="space-y-6">
            {/* Overview */}
            <div>
              <p
                className={`px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-opacity duration-200 ${
                  isSidebarOpen ? "opacity-100" : "opacity-0"
                }`}
              >
                Overview
              </p>
              <div className="space-y-1">
                <NavItem href="/dashboard" icon={Home}>
                  Dashboard
                </NavItem>
                <NavItem href="/dashboard/projects" icon={Folder}>
                  Projects
                </NavItem>
                <NavItem href="/dashboard/approval" icon={Flag}>
                  Approval
                </NavItem>
                <NavItem href="/dashboard/reports" icon={BarChart2}>
                  Reports
                </NavItem>
              </div>
            </div>

            {/* Team */}
            <div>
              <p
                className={`px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-opacity duration-200 ${
                  isSidebarOpen ? "opacity-100" : "opacity-0"
                }`}
              >
                Team
              </p>
              <div className="space-y-1">
                <NavItem href="/dashboard/members" icon={Users2}>
                  Members
                </NavItem>
                <NavItem href="/dashboard/organization" icon={Building}>
                  Organization
                </NavItem>
                {canAccessSupplierWorkspace ? (
                  <NavItem href="/dashboard/suppliers" icon={Truck}>
                    Supplier Workspace
                  </NavItem>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-4 py-4">
          <div className="space-y-1">
            <button
              onClick={() => setSettingsOpen(true)}
              className="w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <Settings className="h-4 w-4 mr-3 flex-shrink-0" />
              <span
                className={`transition-opacity duration-200 ${
                  isSidebarOpen ? "opacity-100" : "opacity-0"
                }`}
                aria-hidden={!isSidebarOpen}
              >
                Settings
              </span>
            </button>
            <button
              onClick={() => setHelpOpen(true)}
              className="w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <HelpCircle className="h-4 w-4 mr-3 flex-shrink-0" />
              <span
                className={`transition-opacity duration-200 ${
                  isSidebarOpen ? "opacity-100" : "opacity-0"
                }`}
                aria-hidden={!isSidebarOpen}
              >
                Help
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      <HelpModal open={helpOpen} onOpenChange={setHelpOpen} />
    </nav>
  );
}
