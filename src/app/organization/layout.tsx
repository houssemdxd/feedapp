"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeaderOrganization from "@/layout/AppHeaderOrganization";
import AppSidebarClient from "@/layout/AppSidebarClient";
import Backdrop from "@/layout/Backdrop";
import React from "react";

export default function OrganizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex">
      {/* Sidebar and Backdrop */}
      <AppSidebarClient />
      <Backdrop />
      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin} bg-white dark:bg-gray-900`}
      >
        {/* Header */}
        <AppHeaderOrganization />
        {/* Page Content */}
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div>
      </div>
    </div>
  );
}
