"use client";

import type { ReactNode } from "react";
import {
  BarChart2,
  Folder,
  Users2,
  Shield,
  Settings,
  HelpCircle,
  Menu,
  Home,
} from "lucide-react";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/ui/logo";

export default function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  function handleNavigation() {
    setIsMobileMenuOpen(false);
  }

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
        onClick={handleNavigation}
        className="flex items-center px-3 py-2 text-sm rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
      >
        <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
        {children}
      </Link>
    );
  }

  return (
    <>
      {/* Mobile trigger */}
      <button
        type="button"
        className="lg:hidden fixed top-4 left-4 z-[70] p-2 rounded-lg bg-background/80 backdrop-blur-sm shadow-md border border-border/50"
        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
      >
        <Menu className="h-5 w-5 text-muted-foreground" />
      </button>

      {/* Sidebar */}
      <nav
        className={`fixed inset-y-0 left-0 z-[70] w-64 bg-background/80 backdrop-blur-xl transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:w-64 border-r border-border/50 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <Link
            href="/"
            className="flex h-16 items-center gap-2 border-b border-border px-6"
          >
            <Logo className="h-2" />
          </Link>

          {/* Navigation groups */}
          <div className="flex-grow overflow-y-auto p-4">
            <div className="space-y-6">
              {/* Overview */}
              <div>
                <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Overview
                </p>
                <div className="space-y-1">
                  <NavItem href="/dashboard" icon={Home}>
                    Dashboard
                  </NavItem>
                  <NavItem href="/dashboard/projects" icon={Folder}>
                    Projects
                  </NavItem>
                  <NavItem href="/dashboard/reports" icon={BarChart2}>
                    Reports
                  </NavItem>
                </div>
              </div>

              {/* Team */}
              <div>
                <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Team
                </p>
                <div className="space-y-1">
                  <NavItem href="/dashboard/members" icon={Users2}>
                    Members
                  </NavItem>
                  <NavItem href="/dashboard/permissions" icon={Shield}>
                    Permissions
                  </NavItem>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border px-4 py-4">
            <div className="space-y-1">
              <NavItem href="/dashboard/settings" icon={Settings}>
                Settings
              </NavItem>
              <NavItem href="#" icon={HelpCircle}>
                Help
              </NavItem>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          role="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-[65] bg-[color:var(--blackish)]/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
