/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import EditableCard from "../formElements/EditableCard";

export default function FormCanvas({ components, setComponents }: any) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempLabel, setTempLabel] = useState("");
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Ensure unique IDs for arrays
  const ensureUniqueIds = (items: any[]): any[] =>
    items.map((item) => ({ ...item, id: uuidv4() }));

  const handleDrop = (e: any, dropIndex?: number) => {
    e.preventDefault();
    e.stopPropagation();

    const data = JSON.parse(e.dataTransfer.getData("component"));

    let newElements: any[] = [];

    // Check if it's a predefined card
    if (data.type === "predefined" && Array.isArray(data.elements)) {
      newElements = ensureUniqueIds(data.elements);
    } else {
      // single component
      let extraFields = {};
      if (data.type === "checkbox" || data.type === "radio") {
        extraFields = { options: ["Option 1", "Option 2", "Option 3"] };
      }
      newElements = [{ ...data, id: uuidv4(), label: "New Question", ...extraFields }];
    }

    setComponents((prev: any) => {
      const updated = [...prev];
      const index = dropIndex ?? prev.length;
      updated.splice(index, 0, ...newElements);
      return updated;
    });

    setDragOverIndex(null);
  };

  const startEditing = (id: string, currentLabel: string) => {
    setEditingId(id);
    setTempLabel(currentLabel);
  };

  const finishEditing = (id: string) => {
    setComponents((prev: any) =>
      prev.map((c: any) => (c.id === id ? { ...c, label: tempLabel || "Untitled Question" } : c))
    );
    setEditingId(null);
  };

  const handleOptionChange = (componentId: string, optionIndex: number, value: string) => {
    setComponents((prev: any) =>
      prev.map((c: any) =>
        c.id === componentId
          ? { ...c, options: c.options.map((opt: string, i: number) => (i === optionIndex ? value : opt)) }
          : c
      )
    );
  };

  const addOption = (componentId: string) => {
    setComponents((prev: any) =>
      prev.map((c: any) =>
        c.id === componentId ? { ...c, options: [...c.options, `Option ${c.options.length + 1}`] } : c
      )
    );
  };

  const removeOption = (componentId: string, optionIndex: number) => {
    setComponents((prev: any) =>
      prev.map((c: any) =>
        c.id === componentId
          ? { ...c, options: c.options.filter((_: any, i: number) => i !== optionIndex) }
          : c
      )
    );
  };

  const deleteComponent = (componentId: string) => {
    setComponents((prev: any) => prev.filter((c: any) => c.id !== componentId));
  };

  const renderField = (c: any) => {
    switch (c.type) {
      case "custom-card":
        return (
          <EditableCard
            element={c}
            onUpdate={(updatedCard: any) => {
              setComponents((prev: any) =>
                prev.map((el: any) => (el.id === c.id ? updatedCard : el))
              );
            }}
          />
        );
      case "input":
        return <input className="border p-2 w-full mt-2 dark:bg-white dark:border-gray-300 dark:text-gray-900" placeholder="Answer here..." />;
      case "textarea":
        return <textarea className="border p-2 w-full mt-2 dark:bg-white dark:border-gray-300 dark:text-gray-900" placeholder="Your message..." />;
      case "rating":
        return (
          <div className="mt-2 flex gap-1">{[1, 2, 3, 4, 5].map((r) => <span key={r}>⭐</span>)}</div>
        );
      case "checkbox":
      case "radio":
        return (
          <div className="mt-2 flex flex-wrap gap-4">
            {c.options?.map((opt: string, i: number) => (
              <div key={`${c.id}-option-${i}`} className="flex items-center gap-1">
                <input type={c.type} name={`group-${c.id}`} />
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => handleOptionChange(c.id, i, e.target.value)}
                  className="border rounded px-2 py-1 w-28 dark:bg-white dark:border-gray-300 dark:text-gray-900"
                />
                <button onClick={() => removeOption(c.id, i)} className="text-red-500 font-bold ml-1">×</button>
              </div>
            ))}
            <button onClick={() => addOption(c.id)} className="text-sm text-blue-600 mt-2">+ Add option</button>
          </div>
        );
      case "text":
        return <input type="text" placeholder="Enter text here..." className="border p-2 w-full mt-2 dark:bg-white dark:border-gray-300 dark:text-gray-900" />;
      case "image":
        return (
          <div className="mt-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = URL.createObjectURL(file);
                  setComponents((prev: any) =>
                    prev.map((comp: any) => (comp.id === c.id ? { ...comp, src: url } : comp))
                  );
                }
              }}
            />
            {c.src && <img src={c.src} alt="Uploaded" className="mt-2 max-h-40" />}
          </div>
        );
      case "slider":
        return <input type="range" min="0" max="100" className="w-full mt-2" />;
      case "color":
        return <input type="color" className="w-full mt-2 h-10 p-1" />;
      case "toggle":
        return (
          <label className="flex items-center gap-2 mt-2">
            <input type="checkbox" className="toggle-checkbox" />
            <span>Toggle</span>
          </label>
        );
      case "time":
        return <input type="time" className="border p-2 w-full mt-2 dark:bg-white dark:border-gray-300 dark:text-gray-900" />;
      case "email":
        return <input type="email" className="border p-2 w-full mt-2 dark:bg-white dark:border-gray-300 dark:text-gray-900" placeholder="Email" />;
      case "number":
        return <input type="number" className="border p-2 w-full mt-2 dark:bg-white dark:border-gray-300 dark:text-gray-900" placeholder="Number" />;
      default:
        return null;
    }
  };

  return (
    <div
      className="w-full bg-transparent"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => handleDrop(e)}
    >
      <h2 className="text-lg font-semibold mb-3 dark:text-white">Form Canvas</h2>

      {components.length === 0 && (
        <div className="text-gray-400 text-sm dark:text-white/70">Drag components here...</div>
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
            <button
              onClick={() => deleteComponent(c.id)}
              className="absolute top-1 right-1 text-red-500 font-bold"
              title="Delete component"
            >
              ×
            </button>

            {editingId === c.id ? (
              <input
                className="border p-1 w-full mb-2"
                autoFocus
                value={tempLabel}
                onChange={(e) => setTempLabel(e.target.value)}
                onBlur={() => finishEditing(c.id)}
                onKeyDown={(e) => e.key === "Enter" && finishEditing(c.id)}
              />
            ) : (
              <label
                onClick={() => startEditing(c.id, c.label)}
                className="font-medium cursor-pointer dark:text-white/90"
              >
                {c.label}
              </label>
            )}

            {renderField(c)}
          </div>
        ))}
      </div>
    </div>
  );
}