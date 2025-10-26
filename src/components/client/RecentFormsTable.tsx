"use client";

import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Image from "next/image";
import React, { useState, useEffect } from "react";

export type SubmissionRow = {
  id: string; // response id
  formId: string;
  formTitle: string;
  organizationName: string | null;
  organizationLogo: string | null;
  submittedAt: string | Date;
};

export default function RecentFormsTable() {
  const [rows, setRows] = useState<SubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/client/submissions", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load submissions");
        const data = (await res.json()) as SubmissionRow[];
        setRows(data);
      } catch (e: any) {
        setError(e?.message || "Erreur de chargement");
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Recently Submitted Forms
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {loading ? "Loading…" : error ? error : `${rows.length} entr${rows.length > 1 ? "ies" : "y"}`}
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-y border-gray-100 dark:border-gray-800">
            <TableRow>
              <TableCell isHeader className="py-3 text-gray-500 text-xs font-medium text-start dark:text-gray-400">
                Organization
              </TableCell>
              <TableCell isHeader className="py-3 text-gray-500 text-xs font-medium text-start dark:text-gray-400">
                Form Title
              </TableCell>
              <TableCell isHeader className="py-3 text-gray-500 text-xs font-medium text-start dark:text-gray-400">
                Submitted At
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {rows.map((item) => (
              <TableRow key={item.id}>
                {/* Organization */}
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full">
                      <Image
                        width={40}
                        height={40}
                        src={item.organizationLogo || "/images/logo/logo-icon.svg"}
                        alt={item.organizationName || "Organization"}
                        className="object-cover w-full h-full dark:invert-[.02]"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {item.organizationName || "—"}
                      </span>
                    </div>
                  </div>
                </TableCell>

                {/* Form Title */}
                <TableCell className="py-3 text-gray-800 dark:text-white/90 text-sm">
                  {item.formTitle}
                </TableCell>

                {/* Submitted At */}
                <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">
                  {new Date(item.submittedAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
