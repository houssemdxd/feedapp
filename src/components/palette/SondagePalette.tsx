/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { v4 as uuidv4 } from "uuid";
import { predefinedSondageComponents } from "../predefined/predefinedSondageComponents";
import {
  AiOutlineQuestionCircle,
  AiOutlineCheckSquare,
  AiOutlineStar,
  AiOutlineForm,
} from "react-icons/ai";

const sondageComponents = [
  { type: "text", label: "Question", icon: <AiOutlineQuestionCircle /> },
  { type: "checkbox", label: "Multiple Choice", icon: <AiOutlineCheckSquare /> },
  { type: "rating", label: "Rating", icon: <AiOutlineStar /> },
];

export default function SondagePalette({ onDragStart }: any) {
  return (
    <div className="p-2 bg-transparent flex flex-col h-full max-h-[70vh] overflow-y-auto">
      <h2 className="text-lg font-semibold mb-3 dark:text-white">Sondage Components</h2>

      {/* Basic sondage components */}
      <div className="flex-1 flex flex-col gap-2">
        {sondageComponents.map((c) => (
          <div
            key={c.type}
            draggable
            onDragStart={(e) =>
              e.dataTransfer.setData(
                "component",
                JSON.stringify({ ...c, id: uuidv4() })
              )
            }
            className="cursor-grab p-2 bg-white rounded-lg border border-gray-200 shadow hover:bg-gray-50 flex items-center gap-2 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] dark:border-gray-700 dark:text-white/90"
          >
            <span className="text-xl text-gray-600 dark:text-white/70">{c.icon}</span>
            <span className="dark:text-white/90">{c.label}</span>
          </div>
        ))}

        {/* Predefined sondage templates */}
        <h2 className="text-lg font-semibold mt-4 mb-2 dark:text-white">Predefined Sondages</h2>
        {predefinedSondageComponents.map((preset) => (
          <div
            key={preset.name}
            draggable
            onDragStart={(e) =>
              e.dataTransfer.setData(
                "component",
                JSON.stringify({
                  type: "predefined",
                  elements: preset.elements.map((el) => ({
                    ...el,
                    id: uuidv4(),
                  })),
                })
              )
            }
            className="cursor-grab p-2 bg-blue-50 rounded-lg border border-gray-200 shadow hover:bg-blue-100 flex flex-col gap-1 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] dark:border-gray-700 dark:text-white/90"
          >
            <span className="font-medium dark:text-white">{preset.name}</span>
            <div className="text-sm text-gray-600 dark:text-white/80">
              {preset.elements.map((el: any) => el.type).join(", ")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}