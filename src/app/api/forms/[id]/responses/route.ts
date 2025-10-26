import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";
import FormTemplate from "@/models/FormTemplate";
import Question from "@/models/Question";
import FormResponse from "@/models/FormResponse";
import { getCurrentUser } from "@/lib/session";
import { cookies } from "next/headers";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const user = await getCurrentUser();
    const jar = await cookies();
    const orgCookie = jar.get("org_access")?.value;
    const respondentIdStr = (user as any)?._id || orgCookie;
    if (!respondentIdStr || !mongoose.Types.ObjectId.isValid(respondentIdStr)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid form id" }, { status: 400 });
    }

    const form = await FormTemplate.findById(id).select("_id").lean();
    if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

    const body = await req.json();
    const answersMap = body?.answers as Record<string, any> | undefined;
    if (!answersMap || typeof answersMap !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Validate question IDs belong to this form (basic sanity)
    const qIds = Object.keys(answersMap)
      .filter((k) => mongoose.Types.ObjectId.isValid(k))
      .map((k) => new mongoose.Types.ObjectId(k));
    const validQuestions = await Question.find({ _id: { $in: qIds }, formId: form._id })
      .select("_id")
      .lean();
    const validSet = new Set(validQuestions.map((q) => String(q._id)));

    const answersArr = Object.entries(answersMap)
      .filter(([qid]) => validSet.has(qid))
      .map(([qid, value]) => ({ questionId: new mongoose.Types.ObjectId(qid), value }));

    // Prevent duplicate submissions by same user
    const existing = await FormResponse.findOne({ formId: form._id, respondentId: new mongoose.Types.ObjectId(respondentIdStr) }).select("_id").lean();
    if (existing) {
      return NextResponse.json({ error: "You have already submitted this form" }, { status: 409 });
    }

    const doc = await FormResponse.create({ formId: form._id, respondentId: new mongoose.Types.ObjectId(respondentIdStr), answers: answersArr });

    return NextResponse.json({ success: true, id: String(doc._id) });
  } catch (err) {
    console.error("POST /api/forms/[id]/responses error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
