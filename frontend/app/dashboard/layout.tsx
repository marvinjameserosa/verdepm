"use client";

import type { ReactNode } from "react";
import Sidebar from "@/components/dashboard/sidebar";
import TopNav from "@/components/dashboard/top-nav";
import { ThemeProvider } from "@/components/dashboard/theme-provider";

interface LayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: LayoutProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className={`flex h-screen`}>
        <Sidebar />
        <div className="w-full flex flex-1 flex-col">
          <header className="h-16 border-b border-gray-200 dark:border-[#1F1F23]">
            <TopNav />
          </header>
          <main className="flex-1 overflow-auto p-6 bg-white dark:bg-[#0F0F12]">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
