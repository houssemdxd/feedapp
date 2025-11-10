import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Survey from "@/models/Survey";
import { getCurrentUser } from "@/lib/session";

function computeCompletionRate(
  totalQuestions: number,
  responses: Array<{ answers?: Array<{ value: any }> }>
) {
  if (!responses.length || !totalQuestions) {
    return 0;
  }

  const totalRatio = responses.reduce((acc, response) => {
    const answers = response.answers ?? [];
    const answeredCount = answers.filter((answer) => {
      if (answer.value === null || answer.value === undefined) return false;
      if (Array.isArray(answer.value)) return answer.value.length > 0;
      if (typeof answer.value === "string") return answer.value.trim().length > 0;
      return true;
    }).length;

    return acc + Math.min(1, answeredCount / totalQuestions);
  }, 0);

  return Math.round((totalRatio / responses.length) * 100);
}

export async function GET() {
  await connectDB();
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (currentUser.role !== "organization") {
    return NextResponse.json(
      { error: "Only organization accounts can access analytics" },
      { status: 403 }
    );
  }

  const surveys = await Survey.find({
    organizationId: currentUser._id,
  })
    .sort({ updatedAt: -1 })
    .lean();

  const assets = surveys.map((survey: any) => {
    const responses = survey.responses ?? [];
    const totalQuestions = survey.questions?.length ?? 0;
    const completionRate = computeCompletionRate(totalQuestions, responses);
    const lastUpdated = responses.length
      ? responses[responses.length - 1].submittedAt
      : survey.updatedAt;

    return {
      id: String(survey._id),
      title: survey.title,
      type: "Survey" as const,
      responses: responses.length,
      completionRate,
      lastUpdated,
      accessCode: survey.accessCode,
      distributionChannel: survey.distributionChannel ?? "In-app",
    };
  });

  const totals = {
    Form: 0,
    Survey: assets.reduce((acc, survey) => acc + survey.responses, 0),
    Post: 0,
  };

  const responseShare = {
    Form: 0,
    Survey: totals.Survey,
    Post: 0,
  };

  const lastActivity =
    assets.find((asset) => asset.responses > 0)?.lastUpdated ??
    surveys[0]?.updatedAt ??
    null;

  return NextResponse.json({
    analytics: {
      assets,
      totals,
      responseShare,
      lastActivity,
    },
  });
}

