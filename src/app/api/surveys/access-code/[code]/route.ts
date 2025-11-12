import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Survey from "@/models/Survey";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/session";

function sanitizeSurveyForRespondent(survey: any) {
  return {
    id: String(survey._id),
    title: survey.title,
    description: survey.description ?? "",
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
      { error: "Organization access code is required" },
      { status: 400 }
    );
  }

  const organization = await User.findOne({
    generatedCode: normalized,
    role: "organization",
  })
    .select("_id fname lname email generatedCode")
    .lean();

  if (!organization) {
    return NextResponse.json(
      { error: "No organization matches this access code" },
      { status: 404 }
    );
  }

  const surveys = await Survey.find({ organizationId: organization._id })
    .sort({ updatedAt: -1 })
    .lean();

  return NextResponse.json({
    organization: {
      id: String(organization._id),
      name: `${organization.fname ?? ""} ${organization.lname ?? ""}`.trim() || organization.email,
      code: organization.generatedCode ?? normalized,
    },
    surveys: surveys.map(sanitizeSurveyForRespondent),
  });
}

