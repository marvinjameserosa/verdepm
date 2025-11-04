"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/dashboard/layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <DashboardLayout
      isSidebarOpen={isSidebarOpen}
      toggleSidebar={toggleSidebar}
    >
      {children}
    </DashboardLayout>
  );
}
