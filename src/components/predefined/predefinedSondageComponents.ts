export const predefinedSondageComponents = [
  {
    name: "Yes/No Survey ",
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
    name: "Rating Survey ",
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
    name: "Multiple Choice Survey ",
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