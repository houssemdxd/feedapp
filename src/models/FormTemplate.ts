import { Schema, model, models, type Model, type Types } from "mongoose";

export interface IFormTemplate {
  _id?: Types.ObjectId;
  title: string;
  type?: "form" | "survey" | "post";
  userId?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const FormTemplateSchema = new Schema<IFormTemplate>(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["form", "survey", "post"],
      default: "form",
    },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const FormTemplate: Model<IFormTemplate> =
  models.FormTemplate || model<IFormTemplate>("FormTemplate", FormTemplateSchema);

export default FormTemplate;
