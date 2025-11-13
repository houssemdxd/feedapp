"use client";

import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type ScannedOrg = {
  orgUserId: string;
  name: string | null;
  logo: string | null;
  lastScannedAt: string; // ISO
};

export default function ScannedOrganizationsTable() {
  const router = useRouter();
  const [items, setItems] = useState<ScannedOrg[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("scannedOrganizations");
      const list: ScannedOrg[] = raw ? JSON.parse(raw) : [];
      setItems(Array.isArray(list) ? list : []);
    } catch {
      setItems([]);
    }
  }, []);

  const onOpenOrg = async (orgUserId: string) => {
    try {
      const res = await fetch("/api/organization/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgUserId }),
      });
      // even if not used, ensuring cookie is set server-side
      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data?.preferences) {
          localStorage.setItem("organizationPreferences", JSON.stringify(data.preferences));
        }
        router.push("/organization");
      }
    } catch {
      router.push("/organization");
    }
  };

  const count = items.length;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Scanned Organizations</h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">{count} scanned</div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-y border-gray-100 dark:border-gray-800">
            <TableRow>
              <TableCell isHeader className="py-3 text-gray-500 text-xs font-medium text-start dark:text-gray-400">
                Organization
              </TableCell>
              <TableCell isHeader className="py-3 text-gray-500 text-xs font-medium text-start dark:text-gray-400">
                Last Scanned
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {items.map((org) => (
              <TableRow key={org.orgUserId} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                <TableCell className="py-3">
                  <button onClick={() => onOpenOrg(org.orgUserId)} className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full">
                      <Image
                        width={40}
                        height={40}
                        src={org.logo || "/images/logo/logo-icon.svg"}
                        alt={org.name || "Organization"}
                        className="object-cover w-full h-full dark:invert-[.02]"
                      />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-medium text-gray-800 dark:text-white/90">{org.name || "—"}</span>
                    </div>
                  </button>
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">
                  {new Date(org.lastScannedAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell className="py-3 text-gray-500 dark:text-gray-400">
                  No scanned organizations yet.
                </TableCell>
                <TableCell className="py-3">&nbsp;</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
