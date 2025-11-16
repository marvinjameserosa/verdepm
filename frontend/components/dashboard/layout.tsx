"use client";

import type { ReactNode } from "react";
import Sidebar from "./sidebar";
import TopNav from "./top-nav";

interface LayoutProps {
  children: ReactNode;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export default function Layout({
  children,
  isSidebarOpen,
  toggleSidebar,
}: LayoutProps) {
  return (
    <div className={`flex h-screen`}>
      <Sidebar isSidebarOpen={isSidebarOpen} />
      <div className="w-full flex flex-1 flex-col">
        <header className="h-16 border-b border-gray-200 dark:border-[#1F1F23]">
          <TopNav toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        </header>
        <main className="flex-1 overflow-auto p-6 bg-white dark:bg-[#050813]">
          {children}
        </main>
      </div>
    </div>
  );
}
