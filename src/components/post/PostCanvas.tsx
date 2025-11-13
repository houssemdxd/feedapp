/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import Checkbox from "../form/input/Checkbox";

type PostOptions = {
  addPhoto: boolean;
  enableComments: boolean;
  enableBinaryReacts: boolean;
  enableNormalReacts: boolean;
};

export default function PostCanvas({ options, bgColor }: { options: PostOptions; bgColor?: string }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);

  // reactions
  const normalReactions = ["❤️", "😂", "😮", "😢", "😡"];
  const [selectedNormal, setSelectedNormal] = useState<string[]>([]);
  const [binary, setBinary] = useState<"up" | "down" | null>(null);

  // comments
  const [comments, setComments] = useState<string[]>([]);
  const [newComment, setNewComment] = useState("");

  const handleImageUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(URL.createObjectURL(file));
  };

  const toggleNormalReaction = (r: string) => {
    setSelectedNormal((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    );
  };

  return (
    <div className="w-full transition-colors duration-500 ease-in-out">
      <div
        className="p-4 rounded-xl shadow transition-colors duration-500 ease-in-out max-h+[70vh] overflow-y-auto"
        style={{ backgroundColor: bgColor || undefined }}
      >
        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 w-full mb-3 rounded dark:bg-white dark:border-gray-300 dark:text-gray-900"
          placeholder="Enter title..."
        />

        {/* Image (optional) */}
        {options.addPhoto && (
          <div className="mb-3">
            <div className="relative">
              {image ? (
                <div className="relative inline-block">
                  <img
                    src={image}
                    alt="Uploaded"
                    className="w-16 h-16 object-cover rounded-lg border-2 border-gray-300 dark:border-gray-600"
                  />
                  <button
                    onClick={() => setImage(null)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImage(URL.createObjectURL(file));
                      }
                    }}
                    className="hidden"
                    id="image-upload"
                  />
                  <div className="w-16 h-16 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center hover:border-brand-500 dark:hover:border-brand-500 transition-colors bg-gray-50 dark:bg-gray-800">
                    <svg
                      className="w-6 h-6 text-gray-400 dark:text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                </label>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 w-full mb-3 rounded dark:bg-white dark:border-gray-300 dark:text-gray-900"
          placeholder="Enter description..."
        />

        {/* Reactions */}
        {(options.enableBinaryReacts || options.enableNormalReacts) && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Reactions</h4>
            <div className="flex gap-2 flex-wrap">
              {options.enableBinaryReacts && (
                <div className="flex items-center gap-2 mr-4">
                  <button
                    onClick={() => setBinary(binary === "up" ? null : "up")}
                    className={`px-3 py-1 rounded-lg border ${
                      binary === "up" ? "bg-blue-100 border-blue-500" : "hover:bg-gray-50"
                    }`}
                  >
                    👍
                  </button>
                  <button
                    onClick={() => setBinary(binary === "down" ? null : "down")}
                    className={`px-3 py-1 rounded-lg border ${
                      binary === "down" ? "bg-blue-100 border-blue-500" : "hover:bg-gray-50"
                    }`}
                  >
                    👎
                  </button>
                </div>
              )}

              {options.enableNormalReacts && (
                <div className="flex gap-2 flex-wrap">
                  {normalReactions.map((r) => (
                    <button
                      key={r}
                      onClick={() => toggleNormalReaction(r)}
                      className={`px-3 py-1 rounded-lg border ${
                        selectedNormal.includes(r)
                          ? "bg-blue-100 border-blue-500"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Comments */}
        {options.enableComments && (
          <div className="mt-6">
            <h4 className="font-medium mb-2">Comments</h4>
            <div className="space-y-2 mb-3">
              {comments.map((c, i) => (
                <div key={i} className="p-2 rounded border dark:border-gray-700">{c}</div>
              ))}
              {comments.length === 0 && (
                <div className="text-sm text-gray-500 dark:text-white/60">No comments yet.</div>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="border p-2 flex-1 rounded dark:bg-white dark:border-gray-300 dark:text-gray-900"
                placeholder="Write a comment..."
              />
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => {
                  if (!newComment.trim()) return;
                  setComments((prev) => [...prev, newComment.trim()]);
                  setNewComment("");
                }}
              >
                Add
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}