// models/FormTemplate.ts
import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IFormTemplate extends Document {
  title: string;
  type: "form" | "survey";
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const FormTemplateSchema = new Schema<IFormTemplate>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    type: { type: String, enum: ["form", "survey"], required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Force Mongoose to use the new schema even if the model was already compiled
const FormTemplateModel =
  (models.FormTemplate as mongoose.Model<IFormTemplate>) ||
  model<IFormTemplate>("FormTemplate", FormTemplateSchema);

export default FormTemplateModel;
