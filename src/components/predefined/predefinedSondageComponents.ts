export const predefinedSondageComponents = [
  {
    name: "Yes/No Question",
    elements: [
      {
        type: "text",
        label: "Do you agree with this statement?",
      },
      {
        type: "radio",
        label: "Yes/No",
        options: ["Yes", "No"],
      },
    ],
  },
  {
    name: "Rating Question",
    elements: [
      {
        type: "text",
        label: "How satisfied are you with our service?",
      },
      {
        type: "rating",
        label: "Satisfaction",
        max: 5,
      },
    ],
  },
  {
    name: "Multiple Choice Question",
    elements: [
      {
        type: "text",
        label: "Which features do you use the most?",
      },
      {
        type: "checkbox",
        label: "Features",
        options: ["Speed", "Design", "Support", "Price"],
      },
    ],
  },
];