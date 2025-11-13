import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import FormTemplate from "@/models/FormTemplate";
import FormResponse from "@/models/FormResponse";
import Question from "@/models/Question";
import { getCurrentUser } from "@/lib/session";
import mongoose from "mongoose";

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

type EngagementAsset = {
  id: string;
  title: string;
  type: "Form" | "Survey" | "Post";
  responses: number;
  completionRate: number;
  lastUpdated: string;
  questionStats?: QuestionStat[];
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

function buildQuestionStats(questions: any[], responses: any[]): QuestionStat[] {
  return questions.map((question: any) => {
    const questionAnswers = responses
      .map((response: any) =>
        (response.answers ?? []).find(
          (answer: any) => String(answer.questionId) === String(question._id)
        )
      )
      .filter(Boolean);

    const totalAnswers = questionAnswers.length;

    if (question.type === "radio" || question.type === "checkbox") {
      const optionCountsMap = new Map<string, number>();
      questionAnswers.forEach((answer: any) => {
        const values = Array.isArray(answer.value) ? answer.value : [answer.value];
        values.forEach((val: any) => {
          const option = String(val ?? "");
          if (option) {
            optionCountsMap.set(option, (optionCountsMap.get(option) ?? 0) + 1);
          }
        });
      });

      const optionCounts = Array.from(optionCountsMap.entries()).map(([option, count]) => ({
        option,
        count,
      }));

      return {
        id: String(question._id),
        label: question.question,
        type: question.type,
        totalAnswers,
        optionCounts: optionCounts.length > 0 ? optionCounts : undefined,
      };
    }

    if (question.type === "rating") {
      const ratingValues = questionAnswers
        .map((answer: any) => {
          const val = Array.isArray(answer.value) ? answer.value[0] : answer.value;
          return typeof val === "number" ? val : Number(val);
        })
        .filter((v) => !isNaN(v) && isFinite(v));

      if (ratingValues.length === 0) {
        return {
          id: String(question._id),
          label: question.question,
          type: question.type,
          totalAnswers: 0,
        };
      }

      const maxRating = Number(question.elements?.[0] ?? 5);
      const ratingDistribution = Array.from({ length: maxRating }, (_, i) => {
        const value = i + 1;
        const count = ratingValues.filter((v) => Math.round(v) === value).length;
        return { value, count };
      }).filter((entry) => entry.count > 0);

      const averageRating =
        ratingValues.reduce((sum, val) => sum + val, 0) / ratingValues.length;

      return {
        id: String(question._id),
        label: question.question,
        type: question.type,
        totalAnswers: ratingValues.length,
        ratingDistribution: ratingDistribution.length > 0 ? ratingDistribution : undefined,
        averageRating: !isNaN(averageRating) ? averageRating : undefined,
      };
    }

    const textResponses = questionAnswers.filter((answer: any) => {
      const val = answer.value;
      if (val === null || val === undefined) return false;
      if (Array.isArray(val)) return val.some((v) => String(v).trim().length > 0);
      return String(val).trim().length > 0;
    }).length;

    return {
      id: String(question._id),
      label: question.question,
      type: question.type,
      totalAnswers,
      textResponses: textResponses > 0 ? textResponses : undefined,
    };
  });
}

export async function GET() {
  try {
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

    const userId = new mongoose.Types.ObjectId(String(currentUser._id));

    // Récupérer tous les forms/surveys de l'utilisateur
    const formTemplates = await FormTemplate.find({ userId })
      .select("_id title type createdAt updatedAt")
      .sort({ updatedAt: -1 })
      .lean();

    const assets: EngagementAsset[] = [];

    for (const template of formTemplates) {
      const formId = template._id;

      // Récupérer les questions et réponses
      const [questions, responses] = await Promise.all([
        Question.find({ formId }).select("_id question type elements").lean(),
        FormResponse.find({ formId })
          .select("answers createdAt")
          .lean(),
      ]);

      const totalQuestions = questions.length;
      const totalResponses = responses.length;

      // Calculer le taux de complétion
      const completionRate = computeCompletionRate(
        totalQuestions,
        responses.map((r: any) => ({ answers: r.answers ?? [] }))
      );

      // Dernière mise à jour
      const lastUpdated =
        responses.length > 0
          ? responses[responses.length - 1]?.updatedAt ?? responses[responses.length - 1]?.createdAt
          : template.updatedAt ?? template.createdAt;

      // Construire les stats des questions
      const questionStats = buildQuestionStats(questions, responses);

      // Déterminer le type
      const type = (template.type === "survey"
        ? "Survey"
        : template.type === "post"
          ? "Post"
          : "Form") as "Form" | "Survey" | "Post";

      assets.push({
        id: String(formId),
        title: template.title,
        type,
        responses: totalResponses,
        completionRate,
        lastUpdated: lastUpdated instanceof Date ? lastUpdated.toISOString() : String(lastUpdated),
        questionStats: questionStats.length > 0 ? questionStats : undefined,
      });
    }

    const totals = {
      Form: assets.filter((a) => a.type === "Form").reduce((sum, a) => sum + a.responses, 0),
      Survey: assets.filter((a) => a.type === "Survey").reduce((sum, a) => sum + a.responses, 0),
      Post: assets.filter((a) => a.type === "Post").reduce((sum, a) => sum + a.responses, 0),
    };

    const responseShare = {
      Form: totals.Form,
      Survey: totals.Survey,
      Post: totals.Post,
    };

    const lastActivity =
      assets.find((asset) => asset.responses > 0)?.lastUpdated ??
      formTemplates[0]?.updatedAt?.toISOString() ??
      null;

    return NextResponse.json({
      analytics: {
        assets,
        totals,
        responseShare,
        lastActivity,
      },
    });
  } catch (error: any) {
    console.error("GET /api/forms/analytics error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to load analytics" },
      { status: 500 }
    );
  }
}

