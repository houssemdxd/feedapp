"use client";

import React, { useState } from "react";
import PaletteSondage from "@/components/palette/SondagePalette";
import SondageCanvas from "@/components/sondage/SondageCanvas";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export default function SurveyBuilderPage() {
  const [sondageComponents, setSondageComponents] = useState<any[]>([]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Survey Builder" />
      <div className="mt-4 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.06]">
          <PaletteSondage onAdd={(elements:any[]) => setSondageComponents(elements)} />
        </div>

        <div className="xl:col-span-2 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.06]">
          <div className="flex flex-col">
            <SondageCanvas components={sondageComponents} setComponents={setSondageComponents} />

            <div className="p-4">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => {
                  if (sondageComponents.length === 0) {
                    alert("Nothing selected!");
                  } else {
                    alert(JSON.stringify(sondageComponents, null, 2));
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
