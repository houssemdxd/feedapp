"use client";

import React, { useEffect, useState } from "react";

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
    <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-4">
     <h2 className="text-xl font-bold mb-4">Recently Submitted Forms</h2>
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700 text-left">
            <th className="px-4 py-2">Logo</th>
            <th className="px-4 py-2">Company Name</th>
            <th className="px-4 py-2">Submitted At</th>
          </tr>
        </thead>
        <tbody>
          {forms.map((form) => (
            <tr key={form.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
              <td className="px-4 py-2">
                <img src={form.companyLogo} alt={form.companyName} className="w-12 h-12 object-contain rounded" />
              </td>
              <td className="px-4 py-2 font-medium text-gray-800 dark:text-gray-100">{form.companyName}</td>
              <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{new Date(form.submittedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
