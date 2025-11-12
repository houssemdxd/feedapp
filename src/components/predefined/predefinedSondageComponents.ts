export const predefinedSondageComponents = [
  {
    name: "Yes / No Question",
    elements: [
      {
        type: "radio",
        label: "Enter your question",
        options: ["Yes", "No"],
      },
    ],
  },
  {
    name: "Rating Scale",
    elements: [
      {
        type: "rating",
        label: "Enter your question",
        max: 5,
      },
    ],
  },
  {
    name: "Multiple Choice",
    elements: [
      {
        type: "checkbox",
        label: "Enter your question",
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      },
    ],
  },
];