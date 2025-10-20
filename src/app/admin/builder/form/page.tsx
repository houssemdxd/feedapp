/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import PaletteForm from "@/components/palette/Palette";
import FormCanvas from "@/components/sondage/FormCanvas";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { createFormAction } from "@/app/actions/formActions"; // server action

export default function FormBuilderPage() {
  const [formComponents, setFormComponents] = useState<any[]>([]);
  const [formTitle, setFormTitle] = useState(""); // keep the title
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (formComponents.length === 0) {
      alert("Nothing selected!");
      return;
    }
    if (!formTitle.trim()) {
      alert("Please enter a title!");
      return;
    }

    const formattedQuestions = formComponents.map((c: any) => ({
      question: c.label || c.question || "Untitled question",
      type: c.type,
      elements: c.elements || [],
    }));

    try {
      setLoading(true);
      const res = await createFormAction({
        title: formTitle,
        type: "form",
        questions: formattedQuestions,
      });
      setLoading(false);

      if (res.success) {
        alert("✅ Form saved successfully!");
      } else {
        alert("❌ Failed to save: " + res.error);
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
      alert("⚠️ Unexpected error occurred!");
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Form Builder" />
      <div className="mt-4 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Palette */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <PaletteForm
            onAdd={(els) => setFormComponents((prev) => [...prev, ...els])}
          />
        </div>

        {/* Canvas + Title + Submit */}
        <div className="xl:col-span-2 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          {/* Title Input */}
          <input
            type="text"
            placeholder="Enter form title..."
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            className="border p-2 mb-4 rounded-md w-full dark:bg-gray-800 dark:text-white dark:border-gray-700"
          />

          {/* Canvas */}
          <FormCanvas
            components={formComponents}
            setComponents={setFormComponents}
          />

          <div className="p-4">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Saving...." : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
