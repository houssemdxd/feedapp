"use client";

import React, { useState } from "react";
import PaletteSondage from "@/components/palette/SondagePalette";
import SondageCanvas from "@/components/sondage/SondageCanvas";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { createFormAction } from "@/app/actions/formActions"; // server action

export default function SurveyBuilderPage() {
  const [sondageComponents, setSondageComponents] = useState<any[]>([]);
  const [surveyTitle, setSurveyTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (sondageComponents.length === 0) return alert("Nothing selected!");
    if (!surveyTitle.trim()) return alert("Please enter a title!");

    const formattedElements = sondageComponents.map((c: any) => ({
      question: c.label || c.question || "Untitled question",
      type: c.type,
      elements: c.type === "checkbox" || c.type === "radio" ? c.options : c.elements || [],
    }));

    const payload = {
      title: surveyTitle,
      type: "survey",
      questions: formattedElements,
    };

    console.log("🧩 Sending payload:", payload);

    setLoading(true);
    try {
      const res = await createFormAction(payload);
      setLoading(false);

      if (res.success) {
        alert("✅ Survey saved successfully!");
        console.log("Saved survey:", res.form);
      } else {
        alert("❌ Failed to save survey: " + res.error);
        console.error(res);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error submitting survey:", error);
      alert("⚠️ Error submitting survey.");
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Survey Builder" />
      <div className="mt-4 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Palette */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.06]">
          <PaletteSondage
            onAdd={(elements: any[]) => setSondageComponents((prev) => [...prev, ...elements])}
          />
        </div>

        {/* Canvas + Submit */}
        <div className="xl:col-span-2 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.06]">
          <div className="flex flex-col">
            <input
              type="text"
              placeholder="Enter survey title..."
              value={surveyTitle}
              onChange={(e) => setSurveyTitle(e.target.value)}
              className="border p-2 mb-4 rounded-md"
            />

            <SondageCanvas
              components={sondageComponents}
              setComponents={setSondageComponents}
            />

            <div className="p-4">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Saving..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
