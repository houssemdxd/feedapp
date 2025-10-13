import React from "react";
import { AiOutlineFileText, AiOutlinePicture, AiOutlineLike } from "react-icons/ai";
import { FaCheck } from "react-icons/fa";

const postTemplates = [
  { 
    id: 1, 
    name: "Title + Image + Description", 
    structure: { title: "", image: "", description: "", reactions: [] },
    icon: <AiOutlinePicture className="text-3xl text-gray-600 dark:text-white/70" />
  },
  { 
    id: 2, 
    name: "Like/Dislike", 
    structure: { title: "", image: "", description: "", reactions: ["👍","👎"] },
    icon: <AiOutlineLike className="text-3xl text-gray-600 dark:text-white/70" />
  },
  { 
    id: 3, 
    name: "Text + Reactions", 
    structure: { text: "", reactions: [] },
    icon: <AiOutlineFileText className="text-3xl text-gray-600 dark:text-white/70" />
  },
];

const backgroundColors = ["white", "lightblue", "lightyellow", "lightgreen", "lightpink"];

export default function PalettePost({ activeTemplate, onSelectTemplate, onChangeBackground, selectedColor }: any) {
  return (
    <div className="p-2 bg-transparent flex flex-col h-full max-h-[70vh] overflow-y-auto">
      <h2 className="text-lg font-semibold mb-3 dark:text-white">Post Templates</h2>

      {/* Template buttons */}
      {postTemplates.map((tpl) => (
        <button
          key={tpl.id}
          onClick={() => onSelectTemplate(tpl)}
          className={`p-2 rounded-lg border mb-3 w-full flex flex-col items-center transition-all
            ${activeTemplate?.id === tpl.id
              ? "bg-blue-100 border-blue-500 dark:bg-white/[0.12] dark:border-white/20"
              : "hover:bg-gray-50 dark:hover:bg-white/[0.08] dark:border-gray-700"}
          `}
        >
          <div className="w-12 h-12 flex items-center justify-center mb-2">
            {tpl.icon}
          </div>
          <span className="text-sm font-medium text-center dark:text-white/90">{tpl.name}</span>
        </button>
      ))}

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