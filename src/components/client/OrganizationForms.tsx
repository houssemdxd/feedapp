"use client";

import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import React, { useEffect, useState } from "react";
import Link from "next/link";

export type OrganizationForm = {
  id: string;
  title: string;
  addedAt: string;
};

export type Preferences = {
  description: string;
  descriptionColor: string;
  backgroundColor: string;
  formTitleColor: string;
  formItemBackgroundColor: string;
  formItemTextColor: string;
  liquidGlassEffect: boolean;
};

export default function OrganizationFormsTable() {
  const [forms, setForms] = useState<OrganizationForm[]>([]);
  const [preferences, setPreferences] = useState<Preferences>({
    description: "Organization description here",
    descriptionColor: "#374151",
    backgroundColor: "#ffffff",
    formTitleColor: "#1f2937",
    formItemBackgroundColor: "transparent",
    formItemTextColor: "#1f2937",
    liquidGlassEffect: false,
  });

  // Fetch forms data from API
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/forms", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch forms");
        const data: { id: string; title: string; createdAt?: string | null }[] = await res.json();
        const mapped: OrganizationForm[] = data.map((f) => ({
          id: f.id,
          title: f.title,
          addedAt: f.createdAt ?? new Date().toISOString(),
        }));
        setForms(mapped);
      } catch (e) {
        console.error(e);
        setForms([]);
      }
    };
    load();
  }, []);

  // Mock preferences fetch (ou remplacer par API fetch)
  useEffect(() => {
    const storedPreferences = localStorage.getItem("organizationPreferences");
    if (storedPreferences) {
      setPreferences(JSON.parse(storedPreferences));
    } else {
      setPreferences({
        description: "Bienvenue sur vos formulaires Esprit",
        descriptionColor: "#1f2937",
        backgroundColor: "#fef3c7",
        formTitleColor: "#b45309",
        formItemBackgroundColor: "transparent",
        formItemTextColor: "#78350f",
        liquidGlassEffect: true,
      });
    }
  }, []);

  // Styles dynamiques
  const containerStyle: React.CSSProperties = {
    backgroundColor: "transparent",
    padding: "1rem",
    borderRadius: "1rem",
    backdropFilter: preferences.liquidGlassEffect ? "blur(10px)" : undefined,
  };

  const descriptionStyle: React.CSSProperties = {
    color: preferences.descriptionColor,
    marginBottom: "1rem",
  };

  const titleStyle: React.CSSProperties = {
    color: preferences.formTitleColor,
  };

  const itemStyle: React.CSSProperties = {
    backgroundColor: preferences.formItemBackgroundColor,
    color: preferences.formItemTextColor,
    borderRadius: "0.5rem",
    padding: "0.25rem 0.5rem",
  };

  return (
    <div style={containerStyle} className="overflow-hidden border border-gray-200 dark:border-gray-800 sm:px-6">
      {/* Description */}
      <p style={descriptionStyle} className="text-sm font-medium">
        {preferences.description}
      </p>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 style={titleStyle} className="text-lg font-semibold">
          Esprit Forms
        </h3>
      </div>

      {/* Table */}
      <div className="max-w-full overflow-x-auto">
        <Table className="bg-transparent">
          <TableHeader className="border-y border-gray-100 dark:border-gray-800 bg-transparent">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 text-gray-500 text-xs font-medium text-start dark:text-gray-400 pr-10 bg-transparent"
              >
                Form Title
              </TableCell>
              <TableCell
                isHeader
                className="py-3 text-gray-500 text-xs font-medium text-start dark:text-gray-400 bg-transparent"
              >
                Date Added
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {forms.map((form) => (
              <TableRow key={form.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                <TableCell className="py-3 pr-10">
                  <Link href={`/organization/forms/${form.id}`} className="block">
                    <div style={itemStyle} className="truncate cursor-pointer">{form.title}</div>
                  </Link>
                </TableCell>
                <TableCell className="py-3">
                  <div style={itemStyle}>
                    {new Date(form.addedAt).toLocaleString()}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
