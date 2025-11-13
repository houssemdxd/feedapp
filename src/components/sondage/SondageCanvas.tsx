"use client";

import React, { useState } from "react";
import Radio from "../form/input/Radio";
import Checkbox from "../form/input/Checkbox";

export default function SondageCanvas({ components, setComponents }: any) {
  const [selectedValues, setSelectedValues] = useState<{ [key: string]: string }>({});
  const [checkedValues, setCheckedValues] = useState<{ [key: string]: string[] }>({});

  const handleRadioChange = (componentId: string, value: string) => {
    setSelectedValues((prev) => ({ ...prev, [componentId]: value }));
  };

  const handleCheckboxChange = (componentId: string, optionValue: string, checked: boolean) => {
    setCheckedValues((prev) => {
      const current = prev[componentId] || [];
      return checked
        ? { ...prev, [componentId]: [...current, optionValue] }
        : { ...prev, [componentId]: current.filter((v) => v !== optionValue) };
    });
  };

  const deleteComponent = (componentId: string) => {
    setComponents((prev: any[]) => prev.filter((c: any) => c.id !== componentId));
  };

  /** 📝 Update the question label text */
  const handleLabelChange = (componentId: string, newLabel: string) => {
    setComponents((prev: any[]) =>
      prev.map((c: any) => (c.id === componentId ? { ...c, label: newLabel } : c))
    );
  };

  /** 📝 Update a specific checkbox/radio option text */
  const handleOptionTextChange = (componentId: string, index: number, newText: string) => {
    setComponents((prev: any[]) =>
      prev.map((c: any) => {
        if (c.id === componentId && Array.isArray(c.options)) {
          const newOpts = [...c.options];
          newOpts[index] = newText;
          return { ...c, options: newOpts };
        }
        return c;
      })
    );
  };

  return (
    <div className="w-full bg-transparent">
      <h2 className="text-lg font-semibold mb-3 dark:text-white">Surveys Canvas</h2>

      {components.length === 0 && (
        <div className="text-gray-400 text-sm dark:text-white/70">
          Use the predefined list to add questions.
        </div>
      )}

      <div className="max-h-[70vh] overflow-y-auto pr-1">
        {components.map((c: any) => (
          <div
            key={c.id}
            className="border rounded p-3 mb-3 bg-white shadow-sm relative dark:bg-white/[0.04] dark:border-gray-700"
          >
            <button
              onClick={() => deleteComponent(c.id)}
              className="absolute top-1 right-1 text-red-500 font-bold"
              title="Delete question"
            >
              ×
            </button>

            {/* 🖊 Editable Question Label */}
            <input
              type="text"
              value={c.label}
              onChange={(e) => handleLabelChange(c.id, e.target.value)}
              className="w-full border-b border-gray-300 text-base font-medium mb-2 dark:bg-transparent dark:text-white focus:outline-none focus:border-blue-500"
            />

            {/* Field rendering */}
            {c.type === "input" && (
              <input
                className="border p-2 w-full mt-2 dark:bg-white dark:border-gray-300 dark:text-gray-900"
                placeholder="Answer here..."
              />
            )}

            {c.type === "textarea" && (
              <textarea
                className="border p-2 w-full mt-2 dark:bg-white dark:border-gray-300 dark:text-gray-900"
                placeholder="Your message..."
              />
            )}

            {c.type === "rating" && (
              <div className="mt-2 flex gap-1">{[1, 2, 3, 4, 5].map((r) => <span key={r}>⭐</span>)}</div>
            )}

            {c.type === "radio" && (
              <div className="mt-2 space-y-2">
                {c.options?.map((opt: string, i: number) => (
                  <div key={`${c.id}-opt-${i}`} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionTextChange(c.id, i, e.target.value)}
                      className="border-b w-32 focus:border-blue-500 focus:outline-none text-sm dark:bg-transparent dark:text-white"
                    />
                    <Radio
                      id={`${c.id}-opt-${i}`}
                      name={`radio-group-${c.id}`}
                      value={opt}
                      checked={selectedValues[c.id] === opt}
                      onChange={(value) => handleRadioChange(c.id, value)}
                      label=""
                    />
                  </div>
                ))}
              </div>
            )}

            {c.type === "checkbox" && (
              <div className="mt-2 space-y-2">
                {c.options?.map((opt: string, i: number) => (
                  <div key={`${c.id}-opt-${i}`} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionTextChange(c.id, i, e.target.value)}
                      className="border-b w-32 focus:border-blue-500 focus:outline-none text-sm dark:bg-transparent dark:text-white"
                    />
                    <Checkbox
                      label=""
                      checked={checkedValues[c.id]?.includes(opt) || false}
                      onChange={(checked) => handleCheckboxChange(c.id, opt, checked)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
