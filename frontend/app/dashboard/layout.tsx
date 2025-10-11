"use client";

import type { ReactNode } from "react";
import Sidebar from "@/components/dashboard/sidebar";
import TopNav from "@/components/dashboard/top-nav";
import { ThemeProvider } from "@/components/dashboard/theme-provider";
import { Background } from "@/components/ui/background";

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
      <Background variant="subtle" className="h-screen">
        <div className={`flex h-screen relative`}>
          <Sidebar />
          <div className="w-full flex flex-1 flex-col">
            <header className="h-16 border-b border-border/50 backdrop-blur-sm bg-background/80">
              <TopNav />
            </header>
            <main className="flex-1 overflow-auto p-6 bg-transparent">
              {children}
            </main>
          </div>
        </div>
      </Background>
    </ThemeProvider>
  );
}
