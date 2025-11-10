"use client";

import React from "react";
import AdminShell from "@/layout/AdminShell";

export default function FormsDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}

