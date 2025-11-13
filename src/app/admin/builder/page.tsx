"use client";

import React, { useState } from "react";
import PaletteForm from "@/components/palette/Palette";
import FormCanvas from "@/components/sondage/FormCanvas";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { saveBuilderAction } from "./actions";

export default function BuilderPage() {
  const [formComponents, setFormComponents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (formComponents.length === 0) {
      alert("Nothing to submit!");
      return;
    }

    const payload = {
      title: "Form Builder", // you can make it dynamic
      type: "form",
      questions: formComponents.map((el: any) => ({
        question: el.label || el.question || "Untitled",
        type: el.type,
        elements: el.elements || el.options || [],
      })),
    };

    setLoading(true);
    const res = await saveBuilderAction(payload);
    setLoading(false);

    if (res.success) {
      alert("✅ Form saved successfully!");
    } else {
      alert("❌ Failed to save: " + res.error);
      console.error(res);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Form Builder" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Palette */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <PaletteForm onAdd={(els) => setFormComponents((prev) => [...prev, ...els])} />
        </div>

        {/* Canvas */}
        <div className="xl:col-span-2 rounded-2xl border border-gray-200 bg-white p-5">
          <FormCanvas components={formComponents} setComponents={setFormComponents} />

          <div className="p-4">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading ? "Saving..." : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
