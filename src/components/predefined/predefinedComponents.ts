import { v4 as uuidv4 } from "uuid";

export const predefinedComponents = [
  {
    name: "Image + Text Card",
    elements: [
      {
        id: uuidv4(),
        type: "custom-card",
        label: "Image with text",
        content: {
          image: "https://via.placeholder.com/300x150",
          text: "Write something about this image...",
        },
      },
    ],
  },
  {
    name: "Image + Checkbox Card",
    elements: [
      {
        id: uuidv4(),
        type: "custom-card",
        label: "Select options for this image",
        content: {
          image: "https://via.placeholder.com/250x120",
          checkboxes: ["Option 1", "Option 2", "Option 3"],
        },
      },
    ],
  },
  {
    name: "Image + Radio Card",
    elements: [
      {
        id: uuidv4(),
        type: "custom-card",
        label: "Choose one option for this image",
        content: {
          image: "https://via.placeholder.com/250x120",
          radios: ["Yes", "No", "Maybe"],
        },
      },
    ],
  },
];