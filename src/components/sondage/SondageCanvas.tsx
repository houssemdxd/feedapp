/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import Radio from "../form/input/Radio";
import Checkbox from "../form/input/Checkbox";

export default function SondageCanvas({ components, setComponents }: any) {
  // Track selected values for radio buttons and checkboxes
  const [selectedValues, setSelectedValues] = useState<{ [key: string]: string }>({});
  const [checkedValues, setCheckedValues] = useState<{ [key: string]: string[] }>({});

  const handleRadioChange = (componentId: string, value: string) => {
    setSelectedValues(prev => ({ ...prev, [componentId]: value }));
  };

  const handleCheckboxChange = (componentId: string, optionValue: string, checked: boolean) => {
    setCheckedValues(prev => {
      const current = prev[componentId] || [];
      if (checked) {
        return { ...prev, [componentId]: [...current, optionValue] };
      } else {
        return { ...prev, [componentId]: current.filter(v => v !== optionValue) };
      }
    });
  };

  const deleteComponent = (componentId: string) => {
    setComponents((prev: any[]) => prev.filter((c: any) => c.id !== componentId));
  };

  return (
    <div className="w-full bg-transparent">
      <h2 className="text-lg font-semibold mb-3 dark:text-white">Surveys Canvas</h2>

      {components.length === 0 && (
        <div className="text-gray-400 text-sm dark:text-white/70">Use the predefined list to add questions.</div>
      )}

      <div className="max-h-[70vh] overflow-y-auto pr-1">
        {components.map((c: any, index: number) => (
          <div
            key={c.id}
            className={`border rounded p-3 mb-3 bg-white shadow-sm relative dark:bg-white/[0.04] dark:border-gray-700`}
          >
            <button
              onClick={() => deleteComponent(c.id)}
              className="absolute top-1 right-1 text-red-500 font-bold"
              title="Delete question"
            >
              ×
            </button>

            <div className="font-medium mb-2 dark:text-white/90">
              {c.label}
            </div>

            {c.type === "input" && (
              <input className="border p-2 w-full mt-2 dark:bg-white dark:border-gray-300 dark:text-gray-900" placeholder="Answer here..." />
            )}
            {c.type === "textarea" && (
              <textarea className="border p-2 w-full mt-2 dark:bg-white dark:border-gray-300 dark:text-gray-900" placeholder="Your message..." />
            )}
            {c.type === "rating" && (
              <div className="mt-2 flex gap-1">{[1, 2, 3, 4, 5].map((r) => <span key={r}>⭐</span>)}</div>
            )}
            {c.type === "radio" && (
              <div className="mt-2 space-y-2">
                {c.options?.map((opt: string, i: number) => (
                  <Radio
                    key={`${c.id}-opt-${i}`}
                    id={`${c.id}-opt-${i}`}
                    name={`radio-group-${c.id}`}
                    value={opt}
                    checked={selectedValues[c.id] === opt}
                    onChange={(value) => handleRadioChange(c.id, value)}
                    label={opt}
                  />
                ))}
              </div>
            )}
            {c.type === "checkbox" && (
              <div className="mt-2 space-y-2">
                {c.options?.map((opt: string, i: number) => (
                  <Checkbox
                    key={`${c.id}-opt-${i}`}
                    label={opt}
                    checked={checkedValues[c.id]?.includes(opt) || false}
                    onChange={(checked) => handleCheckboxChange(c.id, opt, checked)}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}