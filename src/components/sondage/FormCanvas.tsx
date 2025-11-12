/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function FormCanvas({ components = [], setComponents }: any) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempQuestion, setTempQuestion] = useState("");
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [topic, setTopic] = useState("");

  const ensureUniqueIds = (items: any[]): any[] =>
    items.map((item) => ({ ...item, id: uuidv4() }));

  // ✅ AI Survey Generation Handler
  const handleGenerateSurvey = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      if (!res.ok) throw new Error("Failed to generate survey");

      const data = await res.json();

      if (!data.questions || data.questions.length === 0) {
        alert("AI couldn't generate questions. Try again!");
        return;
      }

      const newComponents = data.questions.map((q: any) => ({
        id: uuidv4(),
        question: q.question,
        type: q.type || "input",
        elements: q.elements || [],
      }));

      setComponents(newComponents);
      setShowModal(false);
      setTopic("");
    } catch (error) {
      console.error("Error generating survey:", error);
      alert("Something went wrong. Check console for details.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDrop = (e: any, dropIndex?: number) => {
    e.preventDefault();
    e.stopPropagation();
    const data = JSON.parse(e.dataTransfer.getData("component"));
    let newElements: any[] = [];

    if (data.type === "predefined" && Array.isArray(data.elements)) {
      newElements = ensureUniqueIds(data.elements);
    } else {
      const defaultElementsMap: Record<string, string[]> = {
        checkbox: ["Option 1", "Option 2", "Option 3"],
        radio: ["Choice A", "Choice B", "Choice C"],
        image: [],
      };
      const defaultElements = defaultElementsMap[data.type] || [];
      newElements = [
        {
          id: uuidv4(),
          question: "Untitled Question",
          type: data.type,
          elements: defaultElements,
        },
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
        return <input type="text" placeholder="Answer here..." className="border p-2 w-full mt-2" />;
      case "textarea":
        return <textarea placeholder="Your message..." className="border p-2 w-full mt-2" />;
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
                  className="border rounded px-2 py-1 w-28"
                />
                <button onClick={() => removeElement(c.id, i)} className="text-red-500 font-bold ml-1">
                  ×
                </button>
              </div>
            ))}
            <button onClick={() => addElement(c.id)} className="text-sm text-blue-600 mt-2">
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
              <img src={c.elements[0]} alt="Uploaded" className="mt-2 max-h-40 rounded" />
            )}
          </div>
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
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold dark:text-white">Form Canvas</h2>

        {/* ✅ New modal trigger button */}
        <button
          onClick={() => setShowModal(true)}
          disabled={isGenerating}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700"
        >
          {isGenerating ? "Generating..." : "Generate Survey with AI"}
        </button>
      </div>

      {components.length === 0 && (
        <div className="text-gray-400 text-sm dark:text-white/70 text-center py-8">
          Drag components here or generate a survey with AI...
        </div>
      )}

      <div className="max-h-[70vh] overflow-y-auto pr-1">
        {components.map((c: any, index: number) => (
          <div
            key={c.id}
            className={`border rounded p-3 mb-3 bg-white shadow-sm relative dark:bg-white/[0.04] ${
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

      {/* ✅ Simple modal (no animation) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
            >
              ✕
            </button>
            <h3 className="text-xl font-semibold mb-4 dark:text-white text-center">
              Generate Survey with AI
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 text-center">
              Enter a topic (e.g. customer feedback, product satisfaction)
            </p>
            <input
              type="text"
              placeholder="Enter your topic..."
              className="w-full border border-gray-300 rounded-lg p-2 mb-4 dark:bg-gray-800 dark:text-white"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isGenerating}
            />
            <button
              onClick={handleGenerateSurvey}
              disabled={isGenerating}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isGenerating ? "Generating..." : "Generate Survey"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
