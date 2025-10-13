/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function SondageCanvas({ components, setComponents }: any) {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Ensure unique IDs for arrays
  const ensureUniqueIds = (items: any[]): any[] =>
    items.map((item) => ({ ...item, id: uuidv4() }));

  const handleDrop = (e: any, dropIndex?: number) => {
    e.preventDefault();
    e.stopPropagation();

    const data = e.dataTransfer.getData("component");
    if (!data) return;

    const parsed = JSON.parse(data);
    let newElements: any[] = [];

    if (parsed.type === "predefined" && Array.isArray(parsed.elements)) {
      // multiple predefined elements
      newElements = ensureUniqueIds(parsed.elements);
    } else {
      // single component
      let extraFields = {};
      if (parsed.type === "checkbox" || parsed.type === "radio") {
        extraFields = { options: ["Option 1", "Option 2", "Option 3"] };
      }
      newElements = [
        { ...parsed, id: uuidv4(), label: "New Sondage Question", ...extraFields },
      ];
    }

    setComponents((prev: any) => {
      const updated = [...prev];
      const index = dropIndex ?? prev.length;
      updated.splice(index, 0, ...newElements);
      return updated;
    });

    setDragOverIndex(null);
  };

  return (
    <div
      className="w-full bg-transparent"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => handleDrop(e)}
    >
      <h2 className="text-lg font-semibold mb-3 dark:text-white">Sondage Canvas</h2>

      {components.length === 0 && (
        <div className="text-gray-400 text-sm dark:text-white/70">Drag sondage components here...</div>
      )}

      <div className="max-h-[70vh] overflow-y-auto pr-1">
        {components.map((c: any, index: number) => (
          <div
            key={c.id}
            className={`border rounded p-3 mb-3 bg-white shadow-sm relative dark:bg-white/[0.04] dark:border-gray-700 ${
              dragOverIndex === index ? "border-blue-500" : ""
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverIndex(index);
            }}
            onDragLeave={() => setDragOverIndex(null)}
            onDrop={(e) => handleDrop(e, index)}
          >
            <label className="font-medium dark:text-white/90">{c.label}</label>

            {c.type === "input" && (
              <input className="border p-2 w-full mt-2 dark:bg-white dark:border-gray-300 dark:text-gray-900" placeholder="Answer here..." />
            )}
            {c.type === "textarea" && (
              <textarea className="border p-2 w-full mt-2 dark:bg-white dark:border-gray-300 dark:text-gray-900" placeholder="Your message..." />
            )}
            {c.type === "rating" && (
              <div className="mt-2 flex gap-1">{[1, 2, 3, 4, 5].map((r) => <span key={r}>⭐</span>)}</div>
            )}
            {c.type === "checkbox" && (
              <div className="mt-2 flex flex-wrap gap-4">
                {c.options?.map((opt: string, i: number) => (
                  <label key={i} className="flex items-center gap-2">
                    <input type="checkbox" />
                    <span className="dark:text-white/80">{opt}</span>
                  </label>
                ))}
              </div>
            )}
            {c.type === "radio" && (
              <div className="mt-2 flex flex-col gap-2">
                {c.options?.map((opt: string, i: number) => (
                  <label key={i} className="flex items-center gap-2">
                    <input type="radio" name={`radio-${c.id}`} />
                    <span className="dark:text-white/80">{opt}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}