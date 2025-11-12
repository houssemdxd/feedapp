import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IQuestion extends Document {
  formId: mongoose.Types.ObjectId;
  question: string;
  type: string; // checkbox | radio | input | etc.
  elements: string[]; // e.g. ["Yes", "No"]
}

const QuestionSchema = new Schema<IQuestion>(
  {
    formId: { type: Schema.Types.ObjectId, ref: "FormTemplate", required: true },
    question: { type: String, required: true },
    type: { type: String, required: true },
    elements: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default models.Question || model<IQuestion>("Question", QuestionSchema);
