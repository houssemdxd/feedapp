"use client";
import React from "react";

interface NavbarProps {
  activeTab: "form" | "sondage" | "post";
  setActiveTab: (tab: "form" | "sondage" | "post") => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  return (
    <nav className="w-full flex justify-center gap-3 rounded-2xl border border-gray-200 bg-white py-4 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
      <button
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          activeTab === "form"
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/[0.06] dark:text-white/80 dark:hover:bg-white/[0.1]"
        }`}
        onClick={() => setActiveTab("form")}
      >
        Form
      </button>
      <button
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          activeTab === "sondage"
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/[0.06] dark:text-white/80 dark:hover:bg-white/[0.1]"
        }`}
        onClick={() => setActiveTab("sondage")}
      >
        Surveys
      </button>
      <button
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          activeTab === "post"
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/[0.06] dark:text-white/80 dark:hover:bg-white/[0.1]"
        }`}
        onClick={() => setActiveTab("post")}
      >
        Post
      </button>
    </nav>
  );
}