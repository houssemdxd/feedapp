/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import Navbar from "@/components/navbar-form/nav";
import PaletteForm from "@/components/palette/Palette";
import PaletteSondage from "@/components/palette/SondagePalette";
import PalettePost from "@/components/post/PostPalette";
import FormCanvas from "@/components/sondage/FormCanvas";
import SondageCanvas from "@/components/sondage/SondageCanvas";
import PostCanvas from "@/components/post/PostCanvas";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export default function BuilderPage() {
  const [activeTab, setActiveTab] = useState<"form" | "sondage" | "post">("form");
  
  // 🔹 Background color for the post canvas
  const [postBgColor, setPostBgColor] = useState<string>("");

  // Independent states for each tab*
  const [formComponents, setFormComponents] = useState<any[]>([]);
  const [sondageComponents, setSondageComponents] = useState<any[]>([]);

  // For Post tab: options-based instead of template selection
  const [postOptions, setPostOptions] = useState({
    addPhoto: true,
    enableComments: false,
    enableBinaryReacts: false,
    enableNormalReacts: true,
  });

  return (
    <div>
      <PageBreadcrumb pageTitle="Builder" />
      {/* Navbar at the top */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="mt-4 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.06]">
          {/* Sidebar / Palette */}
          {activeTab === "form" && (
            <PaletteForm onAdd={(elements:any[]) => setFormComponents((prev) => [...prev, ...elements])} />
          )}
          {activeTab === "sondage" && (
            <PaletteSondage onAdd={(elements:any[]) => setSondageComponents(elements)} />
          )}
          {activeTab === "post" && (
            <PalettePost
              options={postOptions}
              onChangeOptions={setPostOptions}
              onChangeBackground={setPostBgColor}
              selectedColor={postBgColor}
            />
          )}
        </div>

        <div className="xl:col-span-2 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.06]">
          {/* Main Canvas */}
          <div className="flex flex-col">
            {activeTab === "form" && (
              <FormCanvas components={formComponents} setComponents={setFormComponents} />
            )}
            {activeTab === "sondage" && (
              <SondageCanvas components={sondageComponents} setComponents={setSondageComponents} />
            )}
            {activeTab === "post" && (
              <PostCanvas options={postOptions} bgColor={postBgColor} />
            )}

            {/* 🔹 Submit Button */}
            <div className="p-4">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => {
                  let dataToShow;
                  switch (activeTab) {
                    case "form":
                      dataToShow = formComponents;
                      break;
                    case "sondage":
                      dataToShow = sondageComponents;
                      break;
                    case "post":
                      dataToShow = { type: "post", options: postOptions, bgColor: postBgColor };
                      break;
                    default:
                      dataToShow = null;
                  }
                  if (!dataToShow) {
                    alert("Nothing selected!");
                  } else {
                    alert(JSON.stringify(dataToShow, null, 2));
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