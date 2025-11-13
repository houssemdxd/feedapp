export const postTemplates = [
  {
    id: "template1",
    name: "Title + Image + Description",
    structure: { title: "Title here", image: "", description: "Description here", reactions: [] },
  },
  {
    id: "template2",
    name: "Title + Image + Description + Like/Dislike",
    structure: { title: "Title here", image: "", description: "Optional desc", reactions: ["like", "dislike"] },
  },
  {
    id: "template3",
    name: "Text + Reactions",
    structure: { text: "Write something...", reactions: ["👍", "❤️", "😂"] },
  },
];