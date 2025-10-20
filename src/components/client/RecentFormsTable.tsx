"use client";

import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Image from "next/image";
import React, { useState, useEffect } from "react";

export type FormData = {
  id: string;
  companyName: string;
  companyLogo: string;
  submittedAt: string;
};

export default function RecentFormsTable() {
  const [forms, setForms] = useState<FormData[]>([]);

  useEffect(() => {
    const mockForms: FormData[] = [
      {
        id: "1",
        companyName: "Acme Corp",
        companyLogo: "/images/user/user-01.jpg",
        submittedAt: "2025-10-18T12:34:56Z",
      },
      {
        id: "2",
        companyName: "Globex",
        companyLogo: "/images/user/user-02.jpg",
        submittedAt: "2025-10-17T09:20:00Z",
      },
      {
        id: "3",
        companyName: "Initech",
        companyLogo: "/images/user/user-03.jpg",
        submittedAt: "2025-10-16T15:45:00Z",
      },
    ];
    setForms(mockForms);
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Recently Submitted Forms
        </h3>
        <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]">
          See all
        </button>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-y border-gray-100 dark:border-gray-800">
            <TableRow>
              <TableCell isHeader className="py-3 text-gray-500 text-xs font-medium text-start dark:text-gray-400">
                Company
              </TableCell>
              <TableCell isHeader className="py-3 text-gray-500 text-xs font-medium text-start dark:text-gray-400">
                Submitted At
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {forms.map((form) => (
              <TableRow key={form.id}>
                {/* Company */}
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full">
                      <Image
                        width={40}
                        height={40}
                        src={form.companyLogo}
                        alt={form.companyName}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {form.companyName}
                      </span>
                    </div>
                  </div>
                </TableCell>

                {/* Submitted At */}
                <TableCell className="py-3 text-gray-500 text-sm dark:text-gray-400">
                  {new Date(form.submittedAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
