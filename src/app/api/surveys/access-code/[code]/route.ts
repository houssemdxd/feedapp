import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Survey from "@/models/Survey";
import { getCurrentUser } from "@/lib/session";

function sanitizeSurveyForRespondent(survey: any) {
  return {
    id: String(survey._id),
    title: survey.title,
    description: survey.description ?? "",
    accessCode: survey.accessCode,
    organizationId: String(survey.organizationId),
    questions: (survey.questions ?? []).map((question: any) => ({
      id: question.id,
      label: question.label,
      type: question.type,
      required: question.required ?? true,
      options: question.options ?? [],
      max: question.max ?? 5,
    })),
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { code: string } }
) {
  await connectDB();
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code } = params;
  const normalized = String(code ?? "").trim().toUpperCase();

  if (!normalized) {
    return NextResponse.json(
      { error: "Survey access code is required" },
      { status: 400 }
    );
  }

  const survey = await Survey.findOne({ accessCode: normalized }).lean();
  if (!survey) {
    return NextResponse.json(
      { error: "No survey matches this access code" },
      { status: 404 }
    );
  }

  return NextResponse.json({ survey: sanitizeSurveyForRespondent(survey) });
}

