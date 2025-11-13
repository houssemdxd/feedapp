import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IFormResponse extends Document {
  formId: mongoose.Types.ObjectId;
  respondentId: mongoose.Types.ObjectId;
  answers: Array<{
    questionId: mongoose.Types.ObjectId;
    value: string | string[];
  }>;
  createdAt?: Date;
  updatedAt?: Date;
}

const FormResponseSchema = new Schema<IFormResponse>(
  {
    formId: { type: Schema.Types.ObjectId, ref: "FormTemplate", required: true },
    respondentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    answers: [
      {
        questionId: { type: Schema.Types.ObjectId, ref: "Question", required: true },
        value: { type: Schema.Types.Mixed, required: true },
      },
    ],
  },
  { timestamps: true }
);

FormResponseSchema.index({ formId: 1, respondentId: 1 }, { unique: true });

const FormResponse = models.FormResponse || model<IFormResponse>("FormResponse", FormResponseSchema);
export default FormResponse;
