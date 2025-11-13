import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import FormTemplate from "@/models/FormTemplate";
import Question from "@/models/Question";
import FormResponse from "@/models/FormResponse";
import { getCurrentUser } from "@/lib/session";
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

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid form ID" }, { status: 400 });
    }

    const user = await getCurrentUser();
    if (!user?._id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Vérifier que le formulaire appartient à l'utilisateur
    const form = await FormTemplate.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(String(user._id)),
    }).lean();

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Supprimer les questions et réponses associées
    await Promise.all([
      Question.deleteMany({ formId: new mongoose.Types.ObjectId(id) }),
      FormResponse.deleteMany({ formId: new mongoose.Types.ObjectId(id) }),
    ]);

    // Supprimer le formulaire
    await FormTemplate.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/forms/[id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
