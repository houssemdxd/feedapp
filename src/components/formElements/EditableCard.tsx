/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";

export default function EditableCard({ element, onUpdate }: any) {
  const [image, setImage] = useState(element.content.image || "");
  const [text, setText] = useState(element.content.text || "");
  const [checkboxes, setCheckboxes] = useState(element.content.checkboxes || []);
  const [radios, setRadios] = useState(element.content.radios || []);

  // Handle image upload
  const handleImageChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        onUpdate({ ...element, content: { ...element.content, image: reader.result } });
      };
      reader.readAsDataURL(file);
    }
  };

  // Add a new checkbox/radio
  const addOption = (type: "checkboxes" | "radios") => {
    const newOption = prompt("Enter new option:");
    if (!newOption) return;
    const newContent = {
      ...element.content,
      [type]: [...(element.content[type] || []), newOption],
    };
    onUpdate({ ...element, content: newContent });
    if (type === "checkboxes") setCheckboxes(newContent.checkboxes);
    else setRadios(newContent.radios);
  };

  // Edit option
  const editOption = (type: "checkboxes" | "radios", index: number) => {
    const newVal = prompt("Edit option:", element.content[type][index]);
    if (newVal === null) return;
    const newOptions = [...element.content[type]];
    newOptions[index] = newVal;
    const newContent = { ...element.content, [type]: newOptions };
    onUpdate({ ...element, content: newContent });
    if (type === "checkboxes") setCheckboxes(newOptions);
    else setRadios(newOptions);
  };

  // Remove option
  const removeOption = (type: "checkboxes" | "radios", index: number) => {
    const newOptions = [...element.content[type]];
    newOptions.splice(index, 1);
    const newContent = { ...element.content, [type]: newOptions };
    onUpdate({ ...element, content: newContent });
    if (type === "checkboxes") setCheckboxes(newOptions);
    else setRadios(newOptions);
  };

  // Update text content
  const handleTextChange = (e: any) => {
    setText(e.target.value);
    onUpdate({ ...element, content: { ...element.content, text: e.target.value } });
  };

  return (
    <div className="mt-2 border rounded-lg overflow-hidden shadow bg-gray-50">
      {/* Image Section */}
      <div className="relative">
        {image ? (
          <img src={image} alt="Custom" className="w-full h-48 object-cover" />
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-400">
            No image
          </div>
        )}
        <label className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-sm shadow cursor-pointer">
          📸 Change
          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        </label>
      </div>

      {/* Text Section */}
      <div className="p-3">
        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder="Enter description..."
          className="border p-2 w-full rounded resize-none"
        />

        {/* Checkboxes */}
        {checkboxes.length > 0 && (
          <div className="mt-3 space-y-2">
            <div className="flex justify-between items-center">
              <p className="font-medium">Checkbox Options</p>
              <button
                onClick={() => addOption("checkboxes")}
                className="text-blue-500 text-sm hover:underline"
              >
                + Add
              </button>
            </div>
            {checkboxes.map((opt: string, i: number) => (
              <div key={i} className="flex justify-between items-center border-b py-1">
                <label className="flex items-center gap-2">
                  <input type="checkbox" /> {opt}
                </label>
                <div className="flex gap-2 text-sm">
                  <button
                    onClick={() => editOption("checkboxes", i)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => removeOption("checkboxes", i)}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Radios */}
        {radios.length > 0 && (
          <div className="mt-3 space-y-2">
            <div className="flex justify-between items-center">
              <p className="font-medium">Radio Options</p>
              <button
                onClick={() => addOption("radios")}
                className="text-blue-500 text-sm hover:underline"
              >
                + Add
              </button>
            </div>
            {radios.map((opt: string, i: number) => (
              <div key={i} className="flex justify-between items-center border-b py-1">
                <label className="flex items-center gap-2">
                  <input type="radio" name={`radio-${element.id}`} /> {opt}
                </label>
                <div className="flex gap-2 text-sm">
                  <button
                    onClick={() => editOption("radios", i)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => removeOption("radios", i)}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}