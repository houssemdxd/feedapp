import { Schema, model, models, type Model, type Types } from "mongoose";

export interface IFormTemplate {
  _id?: Types.ObjectId;
  title: string;
  type: "form" | "survey"; // 👈 added this
  userId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const FormTemplateSchema = new Schema<IFormTemplate>(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["form", "survey"], // 👈 optional enum for data consistency
      default: "form",          // 👈 ensures it’s always set
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const FormTemplate: Model<IFormTemplate> =
  models.FormTemplate || model<IFormTemplate>("FormTemplate", FormTemplateSchema);

export default FormTemplate;
