/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { predefinedComponents } from "./predefinedComponents";
import { v4 as uuidv4 } from "uuid";

export default function PredefinedNav({ onAddPredefined }: any) {
  const [activeTab, setActiveTab] = useState<"form" | "post" | "sondage">("form");

  const assignUniqueIds = (elements: any[]) =>
    elements.map((el) => ({ ...el, id: uuidv4() }));

  // Filter components by type
  const getComponentsForTab = () => {
    return predefinedComponents.filter((c) => c.name === activeTab);
  };

  return (
    <div className="mt-6 border-t pt-3">
      <h3 className="text-md font-semibold mb-2">Predefined Blocks</h3>

      {/* Tabs */}
      <div className="flex gap-2 mb-3">
        {["form", "post", "sondage"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-3 py-1 rounded ${
              activeTab === tab ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Components inside active tab */}
      <div className="flex flex-col gap-2">
        {getComponentsForTab().map((preset) => (
          <div
            key={preset.name}
            draggable
            onDragStart={(e) =>
              e.dataTransfer.setData(
                "component",
                JSON.stringify(assignUniqueIds(preset.elements))
              )
            }
            className="cursor-grab p-2 bg-blue-50 rounded-lg shadow hover:bg-blue-100 flex flex-col gap-1"
          >
            <span className="font-medium">{preset.name}</span>
            <div className="text-sm text-gray-600">
              {preset.elements.map((el: any) => el.type).join(", ")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}