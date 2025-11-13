"use client";

import React, { useState } from "react";
import PalettePost from "@/components/post/PostPalette";
import PostCanvas from "@/components/post/PostCanvas";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export default function PostBuilderPage() {
  const [postBgColor, setPostBgColor] = useState<string>("");
  const [postOptions, setPostOptions] = useState({
    addPhoto: true,
    enableComments: false,
    enableBinaryReacts: false,
    enableNormalReacts: true,
  });

  return (
    <div>
      <PageBreadcrumb pageTitle="Post Builder" />
      <div className="mt-4 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.06]">
          <PalettePost
            options={postOptions}
            onChangeOptions={setPostOptions}
            onChangeBackground={setPostBgColor}
            selectedColor={postBgColor}
          />
        </div>

        <div className="xl:col-span-2 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.06]">
          <div className="flex flex-col">
            <PostCanvas options={postOptions} bgColor={postBgColor} />

            <div className="p-4">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => {
                  // Transform the post into a structured object
                  const formattedData = {
                    type: "post",
                    options: { ...postOptions },
                    bgColor: postBgColor,
                  };

                  alert(JSON.stringify(formattedData, null, 2));
                  console.log("Submitted data:", formattedData);
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
