/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { predefinedSondageComponents } from "../predefined/predefinedSondageComponents";
// import {
//   AiOutlineQuestionCircle,
//   AiOutlineCheckSquare,
//   AiOutlineStar,
//   AiOutlineForm,
// } from "react-icons/ai";

// const sondageComponents = [
//   { type: "text", label: "Question", icon: <AiOutlineQuestionCircle /> },
//   { type: "checkbox", label: "Multiple Choice", icon: <AiOutlineCheckSquare /> },
//   { type: "rating", label: "Rating", icon: <AiOutlineStar /> },
// ];

export default function SondagePalette({ onAdd }: any) {
  const [questionCount, setQuestionCount] = useState<number>(1);

  const cloneWithIds = (elements: any[]) =>
    elements.map((el) => ({ ...el, id: uuidv4() }));

  const handleSelectPreset = (preset: any) => {
    const batches: any[] = [];
    for (let i = 0; i < questionCount; i++) {
      batches.push(...cloneWithIds(preset.elements));
    }
    onAdd(batches);
  };

  return (
    <div className="p-2 bg-transparent flex flex-col h-full max-h-[70vh] overflow-y-auto">
      {/* Old basic components UI removed as requested */}
      {/**
       * Old code commented out:
       * <h2 className="text-lg font-semibold mb-3 dark:text-white">Sondage Components</h2>
       * ... drag and drop of basic components ...
       */}

      {/* Number of questions selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 dark:text-white/90">Number of questions (max 30)</label>
        <input
          type="number"
          min={1}
          max={30}
          className="border rounded px-2 py-1 w-28 dark:bg-white dark:border-gray-300 dark:text-gray-900"
          value={questionCount}
          onChange={(e) => {
            const val = parseInt(e.target.value || "1");
            const clamped = Math.max(1, Math.min(30, isNaN(val) ? 1 : val));
            setQuestionCount(clamped);
          }}
        />
      </div>

      {/* Predefined sondage templates */}
      <h2 className="text-lg font-semibold mt-1 mb-2 dark:text-white">Survey type</h2>
      <div className="flex-1 flex flex-col gap-2">
        {predefinedSondageComponents.map((preset) => (
          <div
            key={preset.name}
            className="p-3 bg-blue-50 rounded-lg border border-gray-200 shadow flex flex-col gap-2 dark:bg-white/[0.06] dark:border-gray-700"
          >
            <div>
              <span className="font-medium dark:text-white">{preset.name}</span>
              <div className="text-sm text-gray-600 dark:text-white/80">
                {preset.elements.map((el: any) => el.type).join(", ")}
              </div>
            </div>
            <button
              className="self-start px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
              onClick={() => handleSelectPreset(preset)}
            >
              Add {questionCount} {questionCount === 1 ? "question" : "questions"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}