import mongoose, { Schema, Document, Types } from "mongoose";

type QuestionBase = {
  id: string;
  label: string;
  type: "text" | "textarea" | "radio" | "checkbox" | "rating";
  required?: boolean;
};

type OptionQuestion = QuestionBase & {
  options?: string[];
  max?: number;
};

type SurveyQuestion = QuestionBase & OptionQuestion;

type SurveyAnswer = {
  questionId: string;
  value: string | string[] | number | null;
};

interface SurveyResponse {
  respondentId?: Types.ObjectId | null;
  submittedAt: Date;
  answers: SurveyAnswer[];
}

export interface ISurvey extends Document {
  organizationId: Types.ObjectId;
  title: string;
  description?: string;
  accessCode: string;
  distributionChannel?: "Email" | "Website" | "In-app" | "SMS" | "Social";
  questions: SurveyQuestion[];
  responses: SurveyResponse[];
  createdAt: Date;
  updatedAt: Date;
}

const SurveyQuestionSchema = new Schema<SurveyQuestion>(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    type: {
      type: String,
      enum: ["text", "textarea", "radio", "checkbox", "rating"],
      required: true,
    },
    required: { type: Boolean, default: true },
    options: [{ type: String }],
    max: { type: Number },
  },
  { _id: false }
);

const SurveyAnswerSchema = new Schema<SurveyAnswer>(
  {
    questionId: { type: String, required: true },
    value: { type: Schema.Types.Mixed, default: null },
  },
  { _id: false }
);

const SurveyResponseSchema = new Schema<SurveyResponse>(
  {
    respondentId: { type: Schema.Types.ObjectId, ref: "User" },
    submittedAt: { type: Date, default: Date.now },
    answers: { type: [SurveyAnswerSchema], default: [] },
  },
  { _id: false }
);

const SurveySchema = new Schema<ISurvey>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String },
    accessCode: { type: String, required: true, unique: true },
    distributionChannel: {
      type: String,
      enum: ["Email", "Website", "In-app", "SMS", "Social"],
      default: "In-app",
    },
    questions: { type: [SurveyQuestionSchema], default: [] },
    responses: { type: [SurveyResponseSchema], default: [] },
  },
  { timestamps: true }
);

SurveySchema.index({ organizationId: 1, createdAt: -1 });
SurveySchema.index({ accessCode: 1 });

export default mongoose.models.Survey ||
  mongoose.model<ISurvey>("Survey", SurveySchema);

