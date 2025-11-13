import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";
import FormTemplate from "@/models/FormTemplate";
import Question from "@/models/Question";
import FormResponse from "@/models/FormResponse";
import { getCurrentUser } from "@/lib/session";
import { cookies } from "next/headers";

const CHOICE_TYPES = new Set(["radio", "checkbox", "select", "dropdown", "toggle"]);
const NUMERIC_TYPES = new Set(["number", "slider", "rating"]);
const TEXT_TYPES = new Set(["input", "textarea", "text", "tr_text", "email", "time", "color", "image"]);

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid form id" }, { status: 400 });
    }

    const user = await getCurrentUser();
    if (!user?._id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await FormTemplate.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(String(user._id)),
    })
      .select("_id title type userId")
      .lean();

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const [questions, responses] = await Promise.all([
      Question.find({ formId: form._id })
        .select("_id question type elements")
        .lean(),
      FormResponse.find({ formId: form._id })
        .select("answers createdAt respondentId")
        .lean(),
    ]);

    const questionMap = new Map<
      string,
      {
        id: string;
        question: string;
        type: string;
        elements: string[];
        totalAnswers: number;
        uniqueRespondents: Set<string>; // For checkbox: track unique clients
        optionCounts: Map<string, number>;
        extraOptionCounts: Map<string, number>;
        numericSum: number;
        numericCount: number;
        numericMin: number | null;
        numericMax: number | null;
        numericDistribution: Map<string, number>;
        samples: string[];
      }
    >();

    questions.forEach((q: any) => {
      questionMap.set(String(q._id), {
        id: String(q._id),
        question: q.question,
        type: q.type,
        elements: Array.isArray(q.elements) ? q.elements : [],
        totalAnswers: 0,
        uniqueRespondents: new Set(),
        optionCounts: new Map(
          (Array.isArray(q.elements) ? q.elements : []).map((label: string) => [label, 0])
        ),
        extraOptionCounts: new Map(),
        numericSum: 0,
        numericCount: 0,
        numericMin: null,
        numericMax: null,
        numericDistribution: new Map(),
        samples: [],
      });
    });

    const submissionsPerDay = new Map<string, number>();

    responses.forEach((response: any) => {
      const createdAt: Date | undefined = response?.createdAt;
      if (createdAt instanceof Date && !isNaN(createdAt.getTime())) {
        const dateKey = createdAt.toISOString().slice(0, 10);
        submissionsPerDay.set(dateKey, (submissionsPerDay.get(dateKey) ?? 0) + 1);
      }

      const respondentId = String(response?.respondentId ?? "");

      (response?.answers ?? []).forEach((answer: any) => {
        const questionId = String(answer?.questionId ?? "");
        const stat = questionMap.get(questionId);
        if (!stat) return;

        const value = answer?.value;
        if (value === undefined || value === null) return;

        stat.totalAnswers += 1;

        // For checkbox: track unique respondents
        if (stat.type === "checkbox" && respondentId) {
          stat.uniqueRespondents.add(respondentId);
        }

        if (CHOICE_TYPES.has(stat.type)) {
          const values = Array.isArray(value) ? value : [value];
          values.forEach((val: any) => {
            const label = typeof val === "string" ? val : JSON.stringify(val);
            if (stat.optionCounts.has(label)) {
              stat.optionCounts.set(label, (stat.optionCounts.get(label) ?? 0) + 1);
            } else {
              stat.extraOptionCounts.set(label, (stat.extraOptionCounts.get(label) ?? 0) + 1);
            }
          });
        } else if (NUMERIC_TYPES.has(stat.type)) {
          const numericVal = Array.isArray(value) ? Number(value[0]) : Number(value);
          if (!Number.isFinite(numericVal)) return;
          stat.numericSum += numericVal;
          stat.numericCount += 1;
          stat.numericMin =
            stat.numericMin === null ? numericVal : Math.min(stat.numericMin, numericVal);
          stat.numericMax =
            stat.numericMax === null ? numericVal : Math.max(stat.numericMax, numericVal);
          const bucketKey = numericVal.toString();
          stat.numericDistribution.set(bucketKey, (stat.numericDistribution.get(bucketKey) ?? 0) + 1);
        } else if (!TEXT_TYPES.has(stat.type)) {
          // Unknown type, treat as stringified samples
          const label = Array.isArray(value) ? value.join(", ") : String(value);
          if (label && stat.samples.length < 5 && !stat.samples.includes(label)) {
            stat.samples.push(label);
          }
        } else {
          const textVal = Array.isArray(value) ? value.join(", ") : String(value);
          if (textVal && stat.samples.length < 5 && !stat.samples.includes(textVal)) {
            stat.samples.push(textVal);
          }
        }
      });
    });

    const questionsPayload = Array.from(questionMap.values()).map((stat) => {
      // For checkbox: use unique respondents count, otherwise use totalAnswers
      const denominator = stat.type === "checkbox" ? stat.uniqueRespondents.size : stat.totalAnswers;
      
      const optionTotalEntries = Array.from(stat.optionCounts.entries()).map(
        ([label, count]) => ({
          label,
          count,
          percentage: denominator > 0 ? (count / denominator) * 100 : 0,
        })
      );

      const extraOptionEntries = Array.from(stat.extraOptionCounts.entries()).map(
        ([label, count]) => ({
          label,
          count,
          percentage: denominator > 0 ? (count / denominator) * 100 : 0,
        })
      );

      const numeric =
        stat.numericCount > 0
          ? {
              average: stat.numericSum / stat.numericCount,
              min: stat.numericMin,
              max: stat.numericMax,
              distribution: Array.from(stat.numericDistribution.entries())
                .map(([value, count]) => ({
                  value: Number(value),
                  count,
                  percentage: stat.numericCount > 0 ? (count / stat.numericCount) * 100 : 0,
                }))
                .sort((a, b) => a.value - b.value),
            }
          : null;

      return {
        id: stat.id,
        question: stat.question,
        type: stat.type,
        totalAnswers: stat.type === "checkbox" ? stat.uniqueRespondents.size : stat.totalAnswers,
        options: optionTotalEntries,
        extraOptions: extraOptionEntries,
        numeric,
        samples: stat.samples,
      };
    });

    const timeline = Array.from(submissionsPerDay.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

    return NextResponse.json({
      form: {
        id: String(form._id),
        title: form.title,
        type: (form as any).type ?? "form",
      },
      totalResponses: responses.length,
      timeline,
      questions: questionsPayload,
    });
  } catch (err) {
    console.error("GET /api/forms/[id]/responses error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

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

    const form = await FormTemplate.findById(id).select("_id type").lean();
    if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });
    const formType = (form as any).type || "form";

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

    // Check if response already exists
    const existing = await FormResponse.findOne({ formId: form._id, respondentId: new mongoose.Types.ObjectId(respondentIdStr) }).select("_id").lean();
    
    let doc;
    if (existing) {
      // For surveys: allow updating existing response
      if (formType === "survey") {
        doc = await FormResponse.findOneAndUpdate(
          { formId: form._id, respondentId: new mongoose.Types.ObjectId(respondentIdStr) },
          { answers: answersArr, updatedAt: new Date() },
          { new: true }
        );
        if (!doc) {
          return NextResponse.json({ error: "Failed to update response" }, { status: 500 });
        }
        return NextResponse.json({ success: true, id: String(doc._id), updated: true });
      } else {
        // For forms: prevent duplicate submissions
        return NextResponse.json({ error: "You have already submitted this form" }, { status: 409 });
      }
    } else {
      // Create new response
      doc = await FormResponse.create({ formId: form._id, respondentId: new mongoose.Types.ObjectId(respondentIdStr), answers: answersArr });
    }

    return NextResponse.json({ success: true, id: String(doc._id), updated: false });
  } catch (err) {
    console.error("POST /api/forms/[id]/responses error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
