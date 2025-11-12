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
      const counts = new Map<string, { option: string; count: number }>();
      const registerOption = (label: string, increment = 0) => {
        const normalized = label.trim().toLowerCase();
        if (!normalized) {
          return null;
        }
        const existing = counts.get(normalized);
        if (existing) {
          existing.count += increment;
          return normalized;
        }
        counts.set(normalized, { option: label.trim(), count: increment });
        return normalized;
      };

      (question.options ?? []).forEach((option: string) => {
        registerOption(option); // ensure option exists even if never chosen
      });

      const recordValue = (raw: unknown) => {
        if (raw === null || raw === undefined) return;
        if (Array.isArray(raw)) {
          raw.forEach(recordValue);
          return;
        }
        const value = String(raw).trim();
        if (!value) return;

        const normalized = value.toLowerCase();
        const canonical =
          (question.options ?? []).find(
            (opt: string) => opt.trim().toLowerCase() === normalized
          ) ?? value;

        const key = registerOption(canonical);
        if (!key) return;

        const entry = counts.get(key);
        if (entry) {
          entry.count += 1;
        }
      };

      answers.forEach((answer: any) => recordValue(answer.value));

      return {
        id: question.id,
        label: question.label,
        type: question.type,
        totalAnswers,
        optionCounts: Array.from(counts.values()),
      };
    }

    if (question.type === "rating") {
      const maxProvided = Number(question.max);
      const max = Number.isFinite(maxProvided) && maxProvided >= 1 ? maxProvided : 5;

      const counts = new Map<number, number>();

      answers.forEach((answer: any) => {
        const numeric =
          typeof answer.value === "number"
            ? answer.value
            : Number(String(answer.value ?? "").trim());
        if (!Number.isFinite(numeric)) return;

        const rating = Math.round(numeric);
        if (rating < 1 || rating > max) return;

        counts.set(rating, (counts.get(rating) ?? 0) + 1);
      });

      const distribution = Array.from({ length: max }, (_, index) => {
        const value = index + 1;
        return {
          value,
          count: counts.get(value) ?? 0,
        };
      });

      const responseCount = distribution.reduce(
        (sum, entry) => sum + entry.count,
        0
      );
      const totalWeighted = distribution.reduce(
        (sum, entry) => sum + entry.value * entry.count,
        0
      );

      return {
        id: question.id,
        label: question.label,
        type: question.type,
        totalAnswers,
        ratingDistribution: distribution,
        averageRating:
          responseCount > 0 ? Number((totalWeighted / responseCount).toFixed(2)) : undefined,
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

