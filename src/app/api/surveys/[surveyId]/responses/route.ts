import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Survey from "@/models/Survey";
import { getCurrentUser } from "@/lib/session";

type RawAnswer = {
  questionId: string;
  value: unknown;
};

function normalizeAnswer(question: any, answer: RawAnswer | undefined) {
  if (!answer) {
    if (question.required !== false) {
      throw new Error(`Question "${question.label}" requires an answer.`);
    }
    return {
      questionId: question.id,
      value: null,
    };
  }

  const { value } = answer;
  switch (question.type) {
    case "text":
    case "textarea": {
      const parsed = typeof value === "string" ? value.trim() : "";
      if (!parsed && question.required !== false) {
        throw new Error(`Question "${question.label}" requires an answer.`);
      }
      return { questionId: question.id, value: parsed };
    }
    case "radio": {
      const parsed = typeof value === "string" ? value.trim() : "";
      if (!parsed) {
        throw new Error(`Select an option for "${question.label}".`);
      }
      if (!question.options?.includes(parsed)) {
        throw new Error(`Invalid choice submitted for "${question.label}".`);
      }
      return { questionId: question.id, value: parsed };
    }
    case "checkbox": {
      const parsed = Array.isArray(value)
        ? value.map((val) => String(val ?? "").trim()).filter(Boolean)
        : [];
      if (!parsed.length && question.required !== false) {
        throw new Error(`Select at least one option for "${question.label}".`);
      }
      const invalid = parsed.filter(
        (option) => !question.options?.includes(option)
      );
      if (invalid.length > 0) {
        throw new Error(`Invalid choices submitted for "${question.label}".`);
      }
      return { questionId: question.id, value: parsed };
    }
    case "rating": {
      const parsed =
        typeof value === "number"
          ? value
          : typeof value === "string"
          ? Number(value)
          : NaN;
      const max = question.max ?? 5;
      if (!Number.isFinite(parsed)) {
        throw new Error(`Please provide a rating for "${question.label}".`);
      }
      if (parsed < 1 || parsed > max) {
        throw new Error(
          `Rating for "${question.label}" must be between 1 and ${max}.`
        );
      }
      return { questionId: question.id, value: parsed };
    }
    default:
      throw new Error(`Unsupported question type "${question.type}".`);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { surveyId: string } }
) {
  await connectDB();
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { surveyId } = params;

  if (!mongoose.Types.ObjectId.isValid(surveyId)) {
    return NextResponse.json({ error: "Invalid survey id" }, { status: 400 });
  }

  const survey = await Survey.findById(surveyId);
  if (!survey) {
    return NextResponse.json({ error: "Survey not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const answers = Array.isArray(body.answers) ? body.answers : [];
    const answerMap = new Map<string, RawAnswer>();
    for (const answer of answers) {
      if (answer && typeof answer === "object" && "questionId" in answer) {
        const qId = String((answer as RawAnswer).questionId ?? "");
        if (qId) {
          answerMap.set(qId, {
            questionId: qId,
            value: (answer as RawAnswer).value,
          });
        }
      }
    }

    const normalizedAnswers = survey.questions.map((question: any) =>
      normalizeAnswer(question, answerMap.get(question.id))
    );

    survey.responses.push({
      respondentId: currentUser.role === "client" ? currentUser._id : undefined,
      submittedAt: new Date(),
      answers: normalizedAnswers,
    });

    await survey.save();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(
      `POST /api/surveys/${surveyId}/responses error:`,
      error?.message ?? error
    );
    const message =
      error instanceof Error
        ? error.message
        : "Unable to submit this survey response";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

