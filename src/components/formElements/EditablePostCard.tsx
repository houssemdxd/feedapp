/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function EditablePostCard({ element, onChange, onDelete }: any) {
  // element has shape: { id, type: 'custom-card' or group, elements: [...] }
  // For Post templates we expect element.elements: an array of blocks (title,image,paragraph,reactions)
  const [local, setLocal] = useState<any>(element);

  function updateLocal(next: any) {
    setLocal(next);
    onChange(next);
  }

  // update a nested block
  function updateBlock(index: number, patch: any) {
    const newElements = [...(local.elements || [])];
    newElements[index] = { ...newElements[index], ...patch };
    updateLocal({ ...local, elements: newElements });
  }

  function handleImageChange(index: number, file: File | null) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    updateBlock(index, { src: url });
  }

  function addReaction() {
    const newReaction = { id: uuidv4(), label: "★", count: 0 };
    const newElements = [...(local.elements || [])];
    // try to find reactions block
    const reactionsIndex = newElements.findIndex((b: any) => b.type === "reactions" || b.type === "reactions");
    if (reactionsIndex >= 0) {
      const block = { ...newElements[reactionsIndex] };
      block.reactions = [...(block.reactions || []), newReaction];
      newElements[reactionsIndex] = block;
      updateLocal({ ...local, elements: newElements });
    } else {
      // if none exists add a reactions block at the end
      newElements.push({ type: "reactions", label: "Reactions", reactions: [newReaction] });
      updateLocal({ ...local, elements: newElements });
    }
  }

  function updateReaction(blockIndex: number, reactionIndex: number, patch: any) {
    const newElements = [...(local.elements || [])];
    const block = { ...newElements[blockIndex] };
    block.reactions = block.reactions.map((r: any, i: number) => (i === reactionIndex ? { ...r, ...patch } : r));
    newElements[blockIndex] = block;
    updateLocal({ ...local, elements: newElements });
  }

  function removeReaction(blockIndex: number, reactionIndex: number) {
    const newElements = [...(local.elements || [])];
    const block = { ...newElements[blockIndex] };
    block.reactions = block.reactions.filter((_: any, i: number) => i !== reactionIndex);
    newElements[blockIndex] = block;
    updateLocal({ ...local, elements: newElements });
  }

  return (
    <div className="p-4 bg-white rounded-lg border shadow-sm">
      <div className="flex justify-between items-start gap-2">
        <strong className="text-lg">Template</strong>
        <button onClick={onDelete} className="text-red-500 font-bold">×</button>
      </div>

      <div className="mt-3 flex flex-col gap-3">
        {(local.elements || []).map((blk: any, i: number) => {
          if (blk.type === "title") {
            return (
              <div key={i} className="flex flex-col gap-1">
                <input
                  value={blk.title || ""}
                  onChange={(e) => updateBlock(i, { title: e.target.value })}
                  className="text-xl font-semibold border rounded px-2 py-1"
                  placeholder="Title..."
                />
              </div>
            );
          }
          if (blk.type === "image") {
            return (
              <div key={i} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(i, e.target.files?.[0] ?? null)}
                  />
                  <button
                    onClick={() => updateBlock(i, { src: "" })}
                    className="text-sm text-gray-500"
                  >
                    Remove
                  </button>
                </div>
                {blk.src ? <img src={blk.src} className="max-h-40 rounded" alt="uploaded" /> : <div className="text-gray-400">No image</div>}
              </div>
            );
          }
          if (blk.type === "paragraph") {
            return (
              <div key={i}>
                <textarea
                  value={blk.content || ""}
                  onChange={(e) => updateBlock(i, { content: e.target.value })}
                  className="border rounded p-2 w-full"
                  placeholder="Description..."
                />
              </div>
            );
          }
          if (blk.type === "reactions" || blk.type === "custom-card" || blk.type === "reactions") {
            return (
              <div key={i} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Reactions</span>
                  <button onClick={() => addReaction()} className="ml-auto text-sm text-blue-600">+ Add reaction</button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(blk.reactions || []).map((r: any, ri: number) => (
                    <div key={r.id} className="flex items-center gap-2 p-1 border rounded">
                      <input
                        value={r.label}
                        onChange={(e) => updateReaction(i, ri, { label: e.target.value })}
                        className="text-sm w-12 border-b"
                      />
                      <div className="text-xs text-gray-500">×</div>
                      <button
                        onClick={() => removeReaction(i, ri)}
                        className="text-red-500 text-sm"
                        title="Remove"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          // fallback
          return <div key={i} className="text-sm text-gray-500">Unknown block {blk.type}</div>;
        })}
      </div>
    </div>
  );
}