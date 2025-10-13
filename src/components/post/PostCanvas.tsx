/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";

export default function PostCanvas({ activeTemplate, bgColor }: any) {
  const [postData, setPostData] = useState<any>({});
  const availableReactions = ["👍", "👎", "❤️", "😂", "😮", "😢", "😡"];

  useEffect(() => {
    if (activeTemplate) {
      setPostData(JSON.parse(JSON.stringify(activeTemplate.structure)));
    }
  }, [activeTemplate]);

  const handleInputChange = (field: string, value: string) => {
    setPostData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPostData((prev: any) => ({ ...prev, image: URL.createObjectURL(file) }));
  };

  const toggleReaction = (reaction: string) => {
    setPostData((prev: any) => {
      const currentReactions = prev.reactions || [];
      return {
        ...prev,
        reactions: currentReactions.includes(reaction)
          ? currentReactions.filter((r: string) => r !== reaction)
          : [...currentReactions, reaction],
      };
    });
  };

  if (!activeTemplate) return <p className="p-6 dark:text-white/70">Select a post template to start.</p>;

  return (
    <div className="w-full transition-colors duration-500 ease-in-out">
      <div
        className="p-4 rounded-xl shadow transition-colors duration-500 ease-in-out max-h-[70vh] overflow-y-auto"
        style={{ backgroundColor: bgColor || undefined }}
      >
        {/* Title */}
        {postData.title !== undefined && (
          <input
            type="text"
            value={postData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            className="border p-2 w-full mb-3 rounded dark:bg-white/[0.06] dark:border-gray-700 dark:text-white"
            placeholder="Enter title..."
          />
        )}

        {/* Image */}
        {postData.image !== undefined && (
          <div className="mb-3">
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            {postData.image && (
              <img
                src={postData.image}
                alt="Uploaded"
                className="mt-3 max-h-60 rounded-lg object-cover"
              />
            )}
          </div>
        )}

        {/* Description */}
        {postData.description !== undefined && (
          <textarea
            value={postData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            className="border p-2 w-full mb-3 rounded dark:bg-white/[0.06] dark:border-gray-700 dark:text-white"
            placeholder="Enter description..."
          />
        )}

        {/* Text */}
        {postData.text !== undefined && (
          <textarea
            value={postData.text}
            onChange={(e) => handleInputChange("text", e.target.value)}
            className="border p-2 w-full mb-3 rounded dark:bg-white/[0.06] dark:border-gray-700 dark:text-white"
            placeholder="Write your post..."
          />
        )}

        {/* Reactions */}
        {postData.reactions !== undefined && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Reactions</h4>
            <div className="flex gap-2 flex-wrap mb-2">
              {postData.reactions.map((r: string) => (
                <button
                  key={r}
                  onClick={() => toggleReaction(r)}
                  className="bg-gray-100 px-3 py-1 rounded-lg"
                >
                  {r} ×
                </button>
              ))}
            </div>

            <div className="flex gap-2 flex-wrap">
              {availableReactions.map((r) => (
                <button
                  key={r}
                  onClick={() => toggleReaction(r)}
                  className={`px-3 py-1 rounded-lg border ${
                    postData.reactions.includes(r)
                      ? "bg-blue-100 border-blue-500"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}