"use client";

import React, { useState } from "react";
import PaletteForm from "@/components/palette/Palette";
import FormCanvas from "@/components/sondage/FormCanvas";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export default function FormBuilderPage() {
  const [formComponents, setFormComponents] = useState<any[]>([]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Form Builder" />
      <div className="mt-4 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.06]">
          <PaletteForm onAdd={(elements:any[]) => setFormComponents((prev) => [...prev, ...elements])} />
        </div>

        <div className="xl:col-span-2 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.06]">
          <div className="flex flex-col">
            <FormCanvas components={formComponents} setComponents={setFormComponents} />

            <div className="p-4">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => {
                  if (formComponents.length === 0) {
                    alert("Nothing selected!");
                  } else {
                    alert(JSON.stringify(formComponents, null, 2));
                  }
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
