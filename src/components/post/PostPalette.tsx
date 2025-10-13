import React from "react";
import { FaCheck } from "react-icons/fa";
import Checkbox from "../form/input/Checkbox";

// Old template-based UI commented out as requested
// import { AiOutlineFileText, AiOutlinePicture, AiOutlineLike } from "react-icons/ai";
// const postTemplates = [ ... ];

const backgroundColors = ["white", "lightblue", "lightyellow", "lightgreen", "lightpink"];

export default function PalettePost({ options, onChangeOptions, onChangeBackground, selectedColor }: any) {
  const toggle = (key: string) => {
    const next = { ...options, [key]: !options[key] } as any;
    // enforce mutual exclusivity between reacts
    if (key === "enableBinaryReacts" && next.enableBinaryReacts) {
      next.enableNormalReacts = false;
    }
    if (key === "enableNormalReacts" && next.enableNormalReacts) {
      next.enableBinaryReacts = false;
    }
    onChangeOptions(next);
  };

  return (
    <div className="p-2 bg-transparent flex flex-col h-full max-h-[70vh] overflow-y-auto">
      <h2 className="text-lg font-semibold mb-3 dark:text-white">Post Options</h2>

      {/* Toggle controls */}
      <div className="flex flex-col gap-2">
        <Checkbox
          label="Add photo"
          checked={!!options.addPhoto}
          onChange={() => toggle("addPhoto")}
        />
        <Checkbox
          label="Enable comments"
          checked={!!options.enableComments}
          onChange={() => toggle("enableComments")}
        />
        <Checkbox
          label="Enable binary reacts (👍/👎)"
          checked={!!options.enableBinaryReacts}
          onChange={() => toggle("enableBinaryReacts")}
        />
        <Checkbox
          label="Enable normal reacts (emoji)"
          checked={!!options.enableNormalReacts}
          onChange={() => toggle("enableNormalReacts")}
        />
      </div>

      {/* Background color selector */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold mb-2 dark:text-white">Background Color</h3>
        <div className="flex gap-2 flex-wrap">
          {backgroundColors.map((color) => (
            <div
              key={color}
              onClick={() => onChangeBackground(color)}
              className={`w-8 h-8 rounded cursor-pointer border relative flex items-center justify-center transition-all
                ${selectedColor === color ? "ring-2 ring-blue-500 scale-110" : "hover:scale-105"}
                dark:border-gray-700
              `}
              style={{ backgroundColor: color }}
            >
              {selectedColor === color && (
                <FaCheck className="text-blue-600 text-xs absolute" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}