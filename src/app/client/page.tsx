import type { Metadata } from "next";
import React from "react";
import RecentFormsTable from "@/components/client/RecentFormsTable";
import ScannedOrganizationsTable from "@/components/client/ScannedOrganizationsTable";

export const metadata: Metadata = {
  title: "Client Dashboard | TailClient",
  description: "Dashboard for client",
};

export default function Client() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 xl:col-span-7 space-y-6">
        <RecentFormsTable />
      </div>
      <div className="col-span-12 xl:col-span-5 space-y-6">
        <ScannedOrganizationsTable />
      </div>
    </div>
  );
}
