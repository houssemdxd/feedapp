/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React from "react";
import {
  AiOutlineFontSize,
  AiOutlineFileText,
  AiOutlineStar,
  AiOutlineCheckSquare,
  AiOutlineAudio,
  AiOutlinePicture,
  AiOutlineControl,
  AiOutlineBgColors,
  AiOutlineSwitcher,
  AiOutlineClockCircle,
  AiOutlineMail,
  AiOutlineNumber,
} from "react-icons/ai";
import { predefinedComponents } from "../predefined/predefinedComponents";
import { v4 as uuidv4 } from "uuid";

const components = [
  { type: "input", label: "Text Input", icon: <AiOutlineFontSize /> },
  { type: "textarea", label: "Textarea", icon: <AiOutlineFileText /> },
  { type: "rating", label: "Rating", icon: <AiOutlineStar /> },
  { type: "checkbox", label: "Checkbox Group", icon: <AiOutlineCheckSquare /> },
  { type: "radio", label: "Radio Button Group", icon: <AiOutlineAudio /> },
  { type: "text", label: "Text", icon: <AiOutlineFontSize /> },
  { type: "image", label: "Image", icon: <AiOutlinePicture /> },
  { type: "slider", label: "Slider", icon: <AiOutlineControl /> },
  { type: "color", label: "Color Picker", icon: <AiOutlineBgColors /> },
  { type: "toggle", label: "Toggle Switch", icon: <AiOutlineSwitcher /> },
  { type: "time", label: "Time Picker", icon: <AiOutlineClockCircle /> },
  { type: "email", label: "Email Input", icon: <AiOutlineMail /> },
  { type: "number", label: "Number Input", icon: <AiOutlineNumber /> },
];

export default function Palette({ onDragStart }: any) {
  return (
    <div className="p-2 bg-transparent flex flex-col h-full max-h-[70vh] overflow-y-auto">
      <h2 className="text-lg font-semibold mb-3 dark:text-white">Components</h2>

      <div className="flex-1 flex flex-col gap-2">
        {/* Main draggable components */}
        {components.map((c) => (
          <div
            key={c.type}
            draggable
            onDragStart={(e) =>
              e.dataTransfer.setData(
                "component",
                JSON.stringify({ ...c, id: uuidv4() })
              )
            }
            className="cursor-grab p-2 bg-white rounded-lg border border-gray-200 shadow hover:bg-gray-50 flex items-center gap-2 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] dark:border-gray-700"
          >
            <span className="text-xl text-gray-600 dark:text-white/80">{c.icon}</span>
            <span className="dark:text-white">{c.label}</span>
          </div>
        ))}

        {/* Predefined components as sidebar cards */}
        <h2 className="text-lg font-semibold mt-4 mb-2 dark:text-white">Predefined</h2>
        {predefinedComponents.map((preset) => (
          <div
            key={preset.name}
            draggable
            onDragStart={(e) =>
              e.dataTransfer.setData(
                "component",
                JSON.stringify({
                  type: "predefined", // mark it as predefined
                  elements: preset.elements.map((el) => ({ ...el, id: uuidv4() })),
                })
              )
            }
            className="cursor-grab p-2 bg-blue-50 rounded-lg border border-gray-200 shadow hover:bg-blue-100 flex flex-col gap-1 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] dark:border-gray-700 dark:text-white/90"
          >
            <span className="font-medium dark:text-white">{preset.name}</span>
            <div className="text-sm text-gray-600 dark:text-white">
              {preset.elements.map((el: any) => el.type).join(", ")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}