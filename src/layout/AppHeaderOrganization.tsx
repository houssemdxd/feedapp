"use client";

import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
// import NotificationDropdown from "@/components/header/NotificationDropdown";
import UserDropdown from "@/components/header/UserDropdown";
import { useSidebar } from "@/context/SidebarContext";
import Image from "next/image";
import React, { useState, useEffect } from "react";

interface Preferences {
  logo: string | null;
  name: string;
  appBarBackgroundColor: string;
  organizationNameColor: string;
}

export default function AppHeaderOrganization() {
  const [preferences, setPreferences] = useState<Preferences>({
    logo: null,
    name: "Organization Name",
    appBarBackgroundColor: "#f9fafb",
    organizationNameColor: "#1f2937",
  });

  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();

  useEffect(() => {
    // Récupère les préférences stockées après validation du code
    const storedPreferences = localStorage.getItem("organizationPreferences");
    if (storedPreferences) {
      setPreferences(JSON.parse(storedPreferences));
    }
  }, []);

  const handleToggle = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const toggleApplicationMenu = () => setApplicationMenuOpen((v) => !v);

  return (
    <header
      className="sticky top-0 flex w-full border-gray-200 z-50 lg:border-b"
      style={{ backgroundColor: preferences.appBarBackgroundColor }}
    >
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
        {/* Left: Sidebar toggle & Mobile Logo */}
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          <button
            className="items-center justify-center w-10 h-10 text-gray-500 border-gray-200 rounded-lg dark:border-gray-800 lg:flex dark:text-gray-400 lg:h-11 lg:w-11 lg:border"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0.583 1c0-.414.336-.75.75-.75h13.333c.414 0 .75.336.75.75s-.336.75-.75.75H1.333A.75.75 0 0 1 .583 1Zm0 10c0-.414.336-.75.75-.75h13.333c.414 0 .75.336.75.75s-.336.75-.75.75H1.333a.75.75 0 0 1-.75-.75ZM1.333 5.25c-.414 0-.75.336-.75.75s.336.75.75.75H8a.75.75 0 0 0 0-1.5H1.333Z"
                  fill="currentColor"
                />
              </svg>
            )}
          </button>

          {/* Logo et Nom Organisation */}
          <div className="flex items-center gap-2">
            {preferences.logo && (
              <Image
                width={70}
                height={70}
                src={preferences.logo}
                alt="Organization Logo"
              />
            )}
            <span
              className="text-lg font-semibold"
              style={{ color: preferences.organizationNameColor }}
            >
              {preferences.name}
            </span>
          </div>

          <button
            onClick={toggleApplicationMenu}
            className="flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg lg:hidden"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6 10.495a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm12 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm-6 1.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        {/* Right: Theme, Notifications, User */}
        <div
          className={`${
            isApplicationMenuOpen ? "flex" : "hidden"
          } items-center justify-between w-full gap-4 px-5 py-4 lg:flex lg:justify-end lg:px-0`}
        >
          <div className="flex items-center gap-2 2xsm:gap-3">
            <ThemeToggleButton />
            {/* <NotificationDropdown /> */}
          </div>

          <UserDropdown />
        </div>
      </div>
    </header>
  );
}
