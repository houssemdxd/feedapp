/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/session";
import FormTemplate from "@/models/FormTemplate";
import Question from "@/models/Question";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";

// Type helpers
interface LeanForm {
  _id: mongoose.Types.ObjectId;
  title: string;
  type: string;
  createdAt: Date;
}

interface LeanQuestion {
  _id: mongoose.Types.ObjectId;
  question: string;
  type: string;
  elements?: any[];
  formId: mongoose.Types.ObjectId;
}

// Fetch all forms and surveys for the current user
export async function getAllFormTemplates() {
  try {
    await connectDB();
    const userId = await getCurrentUser();
    if (!userId) throw new Error("User not authenticated");

    const [forms, surveys] = await Promise.all([
      FormTemplate.find({ type: "form", userId }).lean<LeanForm[]>(),
      FormTemplate.find({ type: "survey", userId }).lean<LeanForm[]>(),
    ]);

    const data = [...forms, ...surveys].map((f) => ({
      id: f._id?.toString() ?? "",
      title: f.title,
      type: f.type,
      createdAt: f.createdAt?.toISOString() ?? "",
    }));

    return { success: true, data };
  } catch (err) {
    console.error("🔥 Error fetching forms:", err);
    return { success: false, error: "Failed to fetch forms" };
  }
}

// Fetch a form template with its questions by ID for the current user
export async function getFormTemplateById(formId: string) {
  try {
    await connectDB();
    const userId = await getCurrentUser();
    if (!userId) throw new Error("User not authenticated");

    const objectId = new mongoose.Types.ObjectId(formId);

    const form = await FormTemplate.findOne({ _id: objectId, userId }).lean<LeanForm>();
    if (!form) {
      console.log("❌ Form not found or not owned by user:", formId);
      return { success: false, error: "Form not found" };
    }

    const questions = await Question.find({ formId: objectId }).lean<LeanQuestion[]>();
    console.log("✅ Found", questions.length, "questions for form:", formId);

    return {
      success: true,
      data: {
        form: {
          id: form._id?.toString() ?? "",
          title: form.title,
          type: form.type,
        },
        questions: questions.map((q) => ({
          id: q._id?.toString() ?? "",
          question: q.question,
          type: q.type,
          elements: q.elements || [],
        })),
      },
    };
  } catch (err) {
    console.error("🔥 Error in getFormTemplateById:", err);
    return { success: false, error: "Failed to fetch form" };
  }
}

// Delete a form and its related questions (only if owned by current user)
export async function deleteFormTemplate(id: string) {
  try {
    await connectDB();
    const userId = await getCurrentUser();
    if (!userId) throw new Error("User not authenticated");

    const deletedForm = await FormTemplate.findOneAndDelete({ _id: id, userId }).lean<LeanForm>();
    if (!deletedForm) {
      return { success: false, error: "Item not found or not owned by user" };
    }

    await Question.deleteMany({ formId: deletedForm._id });

    return { success: true };
  } catch (err) {
    console.error("Error deleting form/survey:", err);
    return { success: false, error: "Failed to delete item" };
  }
}

// Create new form with questions linked to current user
export async function createFormAction({ title, type, questions }: any) {
  try {
    console.log("🚀 Connecting to MongoDB...");
    await connectDB();
    console.log("✅ MongoDB connected");

    const user = await getCurrentUser();
    if (!user) throw new Error("User not authenticated");
    console.log("🔹 Current user:", user);

    const userObjectId = new mongoose.Types.ObjectId(user._id);
    console.log("🔹 Converted user._id to ObjectId:", userObjectId);

    const form = await FormTemplate.create({
      title,
      type,
      userId: userObjectId,
    });
    console.log("✅ Form created:", form);

    if (questions?.length > 0) {
      const formattedQuestions = questions.map((q: any) => ({
        ...q,
        formId: form._id,
      }));
      await Question.insertMany(formattedQuestions);
      console.log("✅ Questions inserted");
    }

    revalidatePath("/admin/dashboard-admin");
    console.log("♻️ Revalidated path /admin/dashboard-admin");

    return { success: true, formId: form._id.toString() };
  } catch (err) {
    console.error("❌ Error saving form:", err);
    return { success: false, error: "Failed to save data" };
  }
}

// Fetch questions by form ID (form must belong to current user)
export async function getFormQuestionsById(formId: string) {
  try {
    await connectDB();
    const userId = await getCurrentUser();
    if (!userId) throw new Error("User not authenticated");

    const form = await FormTemplate.findOne({ _id: formId, userId }).lean<LeanForm>();
    if (!form) throw new Error("Form not found or not owned by user");

    const questions = await Question.find({ formId }).lean<LeanQuestion[]>();
    console.log("✅ getFormQuestionsById:", formId, "Questions:", questions.length);

    return {
      success: true,
      questions: questions.map((q) => ({
        id: q._id?.toString() ?? "",
        question: q.question,
        type: q.type,
        elements: q.elements || [],
      })),
    };
  } catch (err) {
    console.error("🔥 Error in getFormQuestionsById:", err);
    return { success: false, error: "Failed to fetch questions" };
  }
}
