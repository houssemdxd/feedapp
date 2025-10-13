// components/predefined/predefinedPostComponents.ts
export const predefinedPostComponents = [
  {
    name: "Post (Title + Image + Description)",
    elements: [
      { type: "title", label: "Post Title", title: "Amazing news!" },
      { type: "image", label: "Post Image", src: "" },
      { type: "paragraph", label: "Post Description", content: "Describe your post..." },
    ],
  },
  {
    name: "Post (Title + Image + Description + Likes/Dislikes)",
    elements: [
      { type: "title", label: "Post Title", title: "Check this out!" },
      { type: "image", label: "Post Image", src: "" },
      { type: "paragraph", label: "Description (Optional)", content: "" },
      { type: "reactions", label: "Reactions", reactions: [{ id: "r1", label: "👍", count: 0 }, { id: "r2", label: "👎", count: 0 }] },
    ],
  },
  {
    name: "Text Post + Reactions",
    elements: [
      { type: "paragraph", label: "Write something...", content: "Write something interesting..." },
      { type: "reactions", label: "Reactions", reactions: [{ id: "r1", label: "❤️", count: 0 }, { id: "r2", label: "😂", count: 0 }] },
    ],
  },
];