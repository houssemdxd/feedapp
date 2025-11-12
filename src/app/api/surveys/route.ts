import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Survey from "@/models/Survey";
import { getCurrentUser } from "@/lib/session";

const ALLOWED_TYPES = new Set([
  "text",
  "textarea",
  "radio",
  "checkbox",
  "rating",
]);

type RawQuestion = {
  id?: string;
  label?: string;
  type?: string;
  options?: string[];
  max?: number;
  required?: boolean;
};

function normalizeQuestions(rawQuestions: RawQuestion[]) {
  const questions = rawQuestions
    .filter((q) => q && typeof q === "object")
    .map((question, index) => {
      const id = question.id ?? `q-${index}`;
      const label = String(question.label ?? "").trim();
      const type = String(question.type ?? "").trim().toLowerCase();

      if (!label) {
        throw new Error(`Question ${index + 1} is missing a label`);
      }
      if (!ALLOWED_TYPES.has(type)) {
        throw new Error(
          `Question ${index + 1} has an unsupported type "${question.type}"`
        );
      }

      const normalizedQuestion: RawQuestion = {
        id,
        label,
        type,
        required: question.required ?? true,
      };

      if (type === "radio" || type === "checkbox") {
        const options = Array.isArray(question.options)
          ? question.options
              .map((opt) => String(opt ?? "").trim())
              .filter(Boolean)
          : [];
        if (options.length < 2) {
          throw new Error(
            `Question ${index + 1} must provide at least two options`
          );
        }
        normalizedQuestion.options = options;
      }

      if (type === "rating") {
        const max = question.max ?? 5;
        if (typeof max !== "number" || max < 3 || max > 10) {
          throw new Error(
            `Question ${index + 1} rating scale must be between 3 and 10`
          );
        }
        normalizedQuestion.max = max;
      }

      return normalizedQuestion;
    });

  if (questions.length === 0) {
    throw new Error("A survey must contain at least one question");
  }

  return questions;
}

function sanitizeSurvey(survey: any, includeQuestions: boolean) {
  return {
    id: String(survey._id),
    title: survey.title,
    description: survey.description ?? "",
    responseCount: survey.responses?.length ?? 0,
    lastResponseAt: survey.responses?.slice(-1)[0]?.submittedAt ?? survey.updatedAt,
    createdAt: survey.createdAt,
    updatedAt: survey.updatedAt,
    questions: includeQuestions ? survey.questions ?? [] : undefined,
  };
}

export async function POST(req: NextRequest) {
  await connectDB();
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (currentUser.role !== "organization") {
    return NextResponse.json(
      { error: "Only organization accounts can create surveys" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const title = String(body.title ?? "").trim();
    const description =
      typeof body.description === "string" ? body.description.trim() : "";

    if (!title) {
      return NextResponse.json(
        { error: "Survey title is required" },
        { status: 400 }
      );
    }

    const questions = normalizeQuestions(body.questions ?? []);

    // Ensure legacy accessCode index is removed now that surveys share org code
    try {
      // @ts-ignore - dropIndex exists at runtime
      await Survey.collection.dropIndex("accessCode_1");
    } catch (dropError: any) {
      if (dropError?.codeName !== "IndexNotFound") {
        console.warn("Failed to drop legacy accessCode index:", dropError);
      }
    }

    const survey = await Survey.create({
      organizationId: currentUser._id,
      title,
      description,
      questions,
    });

    return NextResponse.json(
      { survey: sanitizeSurvey(survey, true) },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/surveys error:", error);
    const message =
      error instanceof Error ? error.message : "Unable to create survey";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  await connectDB();
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (currentUser.role !== "organization") {
    return NextResponse.json(
      { error: "Only organization accounts can view their surveys" },
      { status: 403 }
    );
  }

  const searchParams = req.nextUrl.searchParams;
  const includeQuestions = searchParams.get("includeQuestions") === "true";

  const surveys = await Survey.find({
    organizationId: currentUser._id,
  })
    .sort({ updatedAt: -1 })
    .lean();

  const sanitized = surveys.map((survey: any) =>
    sanitizeSurvey(survey, includeQuestions)
  );

  return NextResponse.json({ surveys: sanitized });
}

