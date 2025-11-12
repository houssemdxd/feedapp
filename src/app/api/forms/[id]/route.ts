import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import FormTemplate from "@/models/FormTemplate";
import Question from "@/models/Question";
import mongoose from "mongoose";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid form id" }, { status: 400 });
    }

    const form = await FormTemplate.findById(id).lean();
    if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

    const questions = await Question.find({ formId: new mongoose.Types.ObjectId(id) }).lean();

    return NextResponse.json({
      form: {
        id: String(form._id),
        title: form.title,
        type: (form as any).type ?? "form",
      },
      questions: questions.map((q: any) => ({
        id: String(q._id),
        question: q.question,
        type: q.type,
        elements: q.elements || [],
      })),
    });
  } catch (err) {
    console.error("GET /api/forms/[id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
