/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import EditableCard from "../formElements/EditableCard";

export default function FormCanvas({ components = [], setComponents }: any) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempQuestion, setTempQuestion] = useState("");
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const ensureUniqueIds = (items: any[]): any[] =>
    items.map((item) => ({ ...item, id: uuidv4() }));

const handleDrop = (e: any, dropIndex?: number) => {
  e.preventDefault();
  e.stopPropagation();

  const data = JSON.parse(e.dataTransfer.getData("component"));
  let newElements: any[] = [];

  // ✅ If it's a predefined group of elements, assign unique IDs
  if (data.type === "predefined" && Array.isArray(data.elements)) {
    newElements = ensureUniqueIds(data.elements);
  } else {
    // ✅ Ensure consistent defaults
    const defaultElementsMap: Record<string, string[]> = {
      checkbox: ["Option 1", "Option 2", "Option 3"],
      radio: ["Choice A", "Choice B", "Choice C"],
      image: [],
    };

    const defaultElements = defaultElementsMap[data.type] || [];

    // ✅ Ensure the dropped element includes default `elements`
    newElements = [
      {
        id: uuidv4(),
        question: "Untitled Question",
        type: data.type,
        elements: defaultElements,
      },
    ];
  }

  // ✅ Properly insert into the array
  setComponents((prev: any) => {
    const updated = [...prev];
    const index = dropIndex ?? prev.length;
    updated.splice(index, 0, ...newElements);
    return updated;
  });

  setDragOverIndex(null);
};

  const startEditing = (id: string, currentQuestion: string) => {
    setEditingId(id);
    setTempQuestion(currentQuestion);
  };

  const finishEditing = (id: string) => {
    setComponents((prev: any) =>
      prev.map((c: any) =>
        c.id === id ? { ...c, question: tempQuestion || "Untitled Question" } : c
      )
    );
    setEditingId(null);
  };

  const handleElementChange = (componentId: string, index: number, value: string) => {
    setComponents((prev: any) =>
      prev.map((c: any) =>
        c.id === componentId
          ? { ...c, elements: c.elements.map((el: string, i: number) => (i === index ? value : el)) }
          : c
      )
    );
  };

  const addElement = (componentId: string) => {
    setComponents((prev: any) =>
      prev.map((c: any) =>
        c.id === componentId
          ? { ...c, elements: [...c.elements, `Option ${c.elements.length + 1}`] }
          : c
      )
    );
  };

  const removeElement = (componentId: string, index: number) => {
    setComponents((prev: any) =>
      prev.map((c: any) =>
        c.id === componentId
          ? { ...c, elements: c.elements.filter((_: any, i: number) => i !== index) }
          : c
      )
    );
  };

  const deleteComponent = (componentId: string) => {
    setComponents((prev: any) => prev.filter((c: any) => c.id !== componentId));
  };

  const renderField = (c: any) => {
    switch (c.type) {
      case "input":
        return (
          <input
            type="text"
            placeholder="Answer here..."
            className="border p-2 w-full mt-2 dark:bg-white dark:border-gray-300 dark:text-gray-900"
          />
        );

      case "textarea":
        return (
          <textarea
            placeholder="Your message..."
            className="border p-2 w-full mt-2 dark:bg-white dark:border-gray-300 dark:text-gray-900"
          />
        );

      case "rating":
        return (
          <div className="mt-2 flex gap-1">
            {[1, 2, 3, 4, 5].map((r) => (
              <span key={r}>⭐</span>
            ))}
          </div>
        );

      case "checkbox":
      case "radio":
        return (
          <div className="mt-2 flex flex-wrap gap-4">
            {c.elements?.map((el: string, i: number) => (
              <div key={`${c.id}-el-${i}`} className="flex items-center gap-1">
                <input type={c.type} name={`group-${c.id}`} />
                <input
                  type="text"
                  value={el}
                  onChange={(e) => handleElementChange(c.id, i, e.target.value)}
                  className="border rounded px-2 py-1 w-28 dark:bg-white dark:border-gray-300 dark:text-gray-900"
                />
                <button
                  onClick={() => removeElement(c.id, i)}
                  className="text-red-500 font-bold ml-1"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={() => addElement(c.id)}
              className="text-sm text-blue-600 mt-2"
            >
              + Add option
            </button>
          </div>
        );

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
                    prev.map((comp: any) =>
                      comp.id === c.id ? { ...comp, elements: [url] } : comp
                    )
                  );
                }
              }}
            />
            {c.elements?.[0] && (
              <img
                src={c.elements[0]}
                alt="Uploaded"
                className="mt-2 max-h-40 rounded"
              />
            )}
          </div>
        );

      case "email":
        return (
          <input
            type="email"
            placeholder="Email"
            className="border p-2 w-full mt-2 dark:bg-white dark:border-gray-300 dark:text-gray-900"
          />
        );

      case "number":
        return (
          <input
            type="number"
            placeholder="Number"
            className="border p-2 w-full mt-2 dark:bg-white dark:border-gray-300 dark:text-gray-900"
          />
        );

      case "color":
        return <input type="color" className="w-full mt-2 h-10 p-1" />;

      case "slider":
        return <input type="range" min="0" max="100" className="w-full mt-2" />;

      case "toggle":
        return (
          <label className="flex items-center gap-2 mt-2">
            <input type="checkbox" />
            <span>Toggle</span>
          </label>
        );

      case "time":
        return (
          <input
            type="time"
            className="border p-2 w-full mt-2 dark:bg-white dark:border-gray-300 dark:text-gray-900"
          />
        );

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
        <div className="text-gray-400 text-sm dark:text-white/70">
          Drag components here...
        </div>
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
                value={tempQuestion}
                onChange={(e) => setTempQuestion(e.target.value)}
                onBlur={() => finishEditing(c.id)}
                onKeyDown={(e) => e.key === "Enter" && finishEditing(c.id)}
              />
            ) : (
              <label
                onClick={() => startEditing(c.id, c.question)}
                className="font-medium cursor-pointer dark:text-white/90"
              >
                {c.question}
              </label>
            )}

            {renderField(c)}
          </div>
        ))}
      </div>
    </div>
  );
}
