import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Survey from "@/models/Survey";
import { getCurrentUser } from "@/lib/session";

type QuestionStat = {
  id: string;
  label: string;
  type: string;
  totalAnswers: number;
  optionCounts?: { option: string; count: number }[];
  ratingDistribution?: { value: number; count: number }[];
  averageRating?: number;
  textResponses?: number;
};

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

function buildQuestionStats(survey: any): QuestionStat[] {
  const responses = survey.responses ?? [];
  const questions = survey.questions ?? [];

  return questions.map((question: any) => {
    const answers = responses
      .map((response: any) =>
        (response.answers ?? []).find(
          (answer: any) => answer.questionId === question.id
        )
      )
      .filter(Boolean);

    const totalAnswers = answers.length;

    if (question.type === "radio" || question.type === "checkbox") {
      const optionCounts = (question.options ?? []).map((option: string) => ({
        option,
        count: 0,
      }));

      answers.forEach((answer: any) => {
        if (question.type === "radio") {
          const selected = String(answer.value ?? "");
          const option = optionCounts.find((entry) => entry.option === selected);
          if (option) option.count += 1;
        } else if (Array.isArray(answer.value)) {
          answer.value.forEach((value: any) => {
            const selected = String(value ?? "");
            const option = optionCounts.find((entry) => entry.option === selected);
            if (option) option.count += 1;
          });
        }
      });

      return {
        id: question.id,
        label: question.label,
        type: question.type,
        totalAnswers,
        optionCounts,
      };
    }

    if (question.type === "rating") {
      const max = question.max ?? 5;
      const distribution = Array.from({ length: max }, (_, index) => ({
        value: index + 1,
        count: 0,
      }));

      answers.forEach((answer: any) => {
        const rating = Number(answer.value);
        if (Number.isFinite(rating) && rating >= 1 && rating <= max) {
          const entry = distribution.find((item) => item.value === rating);
          if (entry) entry.count += 1;
        }
      });

      const totalWeighted = distribution.reduce(
        (sum, entry) => sum + entry.value * entry.count,
        0
      );
      const responseCount = distribution.reduce(
        (sum, entry) => sum + entry.count,
        0
      );

      return {
        id: question.id,
        label: question.label,
        type: question.type,
        totalAnswers,
        ratingDistribution: distribution,
        averageRating:
          responseCount > 0 ? Number((totalWeighted / responseCount).toFixed(2)) : 0,
      };
    }

    const answeredCount = answers.filter((answer: any) => {
      if (answer.value === null || answer.value === undefined) return false;
      if (typeof answer.value === "string") {
        return answer.value.trim().length > 0;
      }
      return true;
    }).length;

    return {
      id: question.id,
      label: question.label,
      type: question.type,
      totalAnswers,
      textResponses: answeredCount,
    };
  });
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
      questionStats: buildQuestionStats(survey),
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

