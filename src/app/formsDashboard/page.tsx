"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PieChartIcon, TrashBinIcon } from "@/icons";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

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

type AnalyticsSummary = {
  assets: EngagementAsset[];
  totals: Record<"Form" | "Survey" | "Post", number>;
  responseShare: Record<"Form" | "Survey" | "Post", number>;
  lastActivity: string | null;
};

export default function FormsDashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStatistics, setShowStatistics] = useState(false);
  const [statisticsCleared, setStatisticsCleared] = useState(false);
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/surveys/analytics");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load analytics.");
      }

      setAnalytics(data.analytics);
    } catch (fetchError: any) {
      console.error("Failed to load survey analytics:", fetchError);
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Something went wrong while loading analytics."
      );
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const assets = analytics?.assets ?? [];
  const totals = analytics?.totals ?? { Form: 0, Survey: 0, Post: 0 };

  useEffect(() => {
    if (!analytics) {
      setSelectedSurveyId(null);
      setSelectedQuestionId(null);
      return;
    }

    if (assets.length === 0) {
      setSelectedSurveyId(null);
      setSelectedQuestionId(null);
      return;
    }

    if (!selectedSurveyId || !assets.some((asset) => asset.id === selectedSurveyId)) {
      setSelectedSurveyId(assets[0].id);
      const defaultQuestion =
        assets[0].questionStats?.find(
          (question) =>
            (question.optionCounts && question.optionCounts.length > 0) ||
            (question.ratingDistribution && question.ratingDistribution.length > 0)
        ) ?? assets[0].questionStats?.[0];
      setSelectedQuestionId(defaultQuestion?.id ?? null);
      return;
    }

    const currentSurvey = assets.find((asset) => asset.id === selectedSurveyId);
    if (currentSurvey) {
      if (
        !selectedQuestionId ||
        !currentSurvey.questionStats?.some((question) => question.id === selectedQuestionId)
      ) {
        const defaultQuestion =
          currentSurvey.questionStats?.find(
            (question) =>
              (question.optionCounts && question.optionCounts.length > 0) ||
              (question.ratingDistribution && question.ratingDistribution.length > 0)
          ) ?? currentSurvey.questionStats?.[0];
        setSelectedQuestionId(defaultQuestion?.id ?? null);
      }
    }
  }, [analytics, assets, selectedSurveyId, selectedQuestionId]);

  const totalResponses = useMemo(
    () => assets.reduce((sum, asset) => sum + asset.responses, 0),
    [assets]
  );

  const chartSeries = useMemo(() => {
    if (!analytics || statisticsCleared) {
      return [0, 0, 0];
    }
    return [
      analytics.responseShare.Form ?? 0,
      analytics.responseShare.Survey ?? 0,
      analytics.responseShare.Post ?? 0,
    ];
  }, [analytics, statisticsCleared]);

  const chartOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        type: "donut",
        fontFamily: "Outfit, sans-serif",
      },
      labels: ["Forms", "Surveys", "Posts"],
      colors: ["#2563eb", "#f97316", "#14b8a6"],
      legend: {
        position: "bottom",
        fontFamily: "Outfit",
      },
      dataLabels: {
        formatter(val: number) {
          return `${val.toFixed(1)}%`;
        },
      },
      tooltip: {
        y: {
          formatter(value: number) {
            return `${value} réponses`;
          },
        },
      },
    }),
    []
  );

  const handleViewStatistics = () => {
    if (assets.length === 0) return;
    setStatisticsCleared(false);
    setShowStatistics(true);
  };

  const handleDeleteStatistics = () => {
    setStatisticsCleared(true);
    setShowStatistics(false);
  };

  const handleDeleteAsset = useCallback(
    async (asset: EngagementAsset) => {
      if (asset.type !== "Survey") {
        setDeleteError("Deleting forms and posts will be available soon.");
        return;
      }

      const confirmed = window.confirm(
        `Delete survey "${asset.title}" and all of its responses? This cannot be undone.`
      );
      if (!confirmed) {
        return;
      }

      setDeleteError(null);
      setDeletingId(asset.id);
      try {
        const res = await fetch(`/api/surveys/${asset.id}`, { method: "DELETE" });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Unable to delete this survey.");
        }

        if (selectedSurveyId === asset.id) {
          setSelectedSurveyId(null);
          setSelectedQuestionId(null);
        }

        await loadAnalytics();
      } catch (deleteErr: any) {
        console.error("Failed to delete survey:", deleteErr);
        setDeleteError(
          deleteErr instanceof Error
            ? deleteErr.message
            : "Something went wrong while deleting this survey."
        );
      } finally {
        setDeletingId(null);
      }
    },
    [loadAnalytics, selectedQuestionId, selectedSurveyId]
  );

  const selectedSurvey = useMemo(
    () => assets.find((asset) => asset.id === selectedSurveyId) ?? null,
    [assets, selectedSurveyId]
  );

  const selectedQuestion = useMemo(() => {
    if (!selectedSurvey || !selectedQuestionId) return null;
    return (
      selectedSurvey.questionStats?.find(
        (question) => question.id === selectedQuestionId
      ) ?? null
    );
  }, [selectedSurvey, selectedQuestionId]);

  const questionChart = useMemo(() => {
    if (!selectedQuestion) return null;

    if (
      selectedQuestion.optionCounts &&
      selectedQuestion.optionCounts.length > 0
    ) {
      const total = selectedQuestion.optionCounts.reduce(
        (sum, entry) => sum + entry.count,
        0
      );

      const series = selectedQuestion.optionCounts.map((entry) => entry.count);
      const labels = selectedQuestion.optionCounts.map((entry) => entry.option);

      const options: ApexOptions = {
        chart: { type: "donut", fontFamily: "Outfit, sans-serif" },
        labels,
        colors: ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#6366f1", "#14b8a6"],
        dataLabels: {
          enabled: true,
          formatter(val: number) {
            return `${val.toFixed(1)}%`;
          },
        },
        legend: {
          position: "bottom",
          formatter(seriesName, opts) {
            const count = opts.w.globals.series[opts.seriesIndex];
            const pct = total > 0 ? ((count / total) * 100).toFixed(0) : "0";
            return `${seriesName}: ${count} (${pct}%)`;
          },
        },
        tooltip: {
          y: {
            formatter(value: number) {
              const pct = total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";
              return `${value} responses (${pct}%)`;
            },
          },
        },
        stroke: { width: 0 },
      };

      const summary =
        total > 0
          ? selectedQuestion.optionCounts
              .map((entry) => {
                const pct = ((entry.count / total) * 100).toFixed(1);
                return `${entry.option}: ${entry.count} (${pct}%)`;
              })
              .join(" • ")
          : "No responses recorded yet.";

      return {
        series,
        options,
        summary,
        chartType: "donut" as const,
      };
    }

    if (
      selectedQuestion.ratingDistribution &&
      selectedQuestion.ratingDistribution.length > 0
    ) {
      const categories = selectedQuestion.ratingDistribution.map((entry) =>
        entry.value.toString()
      );
      const series = [
        {
          name: "Responses",
          data: selectedQuestion.ratingDistribution.map((entry) => entry.count),
        },
      ];

      const totalResponsesForRating = selectedQuestion.ratingDistribution.reduce(
        (sum, entry) => sum + entry.count,
        0
      );
      const distributionSummary = selectedQuestion.ratingDistribution
        .filter((entry) => entry.count > 0)
        .map((entry) => `${entry.value}: ${entry.count}`);

      const summaryParts: string[] = [];
      if (
        typeof selectedQuestion.averageRating === "number" &&
        !Number.isNaN(selectedQuestion.averageRating) &&
        totalResponsesForRating > 0
      ) {
        summaryParts.push(
          `Average rating: ${selectedQuestion.averageRating.toFixed(2)}`
        );
      }
      if (distributionSummary.length > 0) {
        summaryParts.push(`Counts ${distributionSummary.join(" • ")}`);
      }

      const options: ApexOptions = {
        chart: { type: "bar", fontFamily: "Outfit, sans-serif" },
        plotOptions: { bar: { horizontal: false, columnWidth: "45%" } },
        dataLabels: { enabled: false },
        xaxis: { categories, title: { text: "Rating" } },
        colors: ["#f97316"],
        yaxis: { title: { text: "Responses" } },
      };

      const summary =
        summaryParts.length > 0
          ? summaryParts.join(" • ")
          : totalResponsesForRating > 0
          ? `Collected ${totalResponsesForRating} responses.`
          : "No responses recorded yet.";

      return { series, options, summary, chartType: "bar" as const };
    }

    if (selectedQuestion.textResponses !== undefined) {
      return {
        series: null,
        options: null,
        summary: `Collected ${selectedQuestion.textResponses} text responses.`,
        chartType: null,
      };
    }

    return null;
  }, [selectedQuestion]);

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Forms Dashboard" />

      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={handleViewStatistics}
          startIcon={<PieChartIcon className="h-4 w-4" />}
          disabled={assets.length === 0 || loading}
        >
          View statistics
        </Button>

        <Button
          onClick={handleDeleteStatistics}
          variant="outline"
          startIcon={<TrashBinIcon className="h-4 w-4 text-error-500" />}
          className="!text-error-600 !ring-error-200 hover:!bg-error-50"
          disabled={statisticsCleared || loading}
        >
          Delete statistics
        </Button>
      </div>

      {deleteError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
          {deleteError}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Active Engagement Assets
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Keep a consolidated view of your forms, surveys, and posts.
            </p>
            {analytics?.lastActivity && (
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                Last activity:{" "}
                {new Date(analytics.lastActivity).toLocaleString("en-US")}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-brand-50 px-3 py-1 font-medium text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              {assets.length} items
            </span>
            <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-600 dark:bg-white/10 dark:text-gray-300">
              {totalResponses} total responses
            </span>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
            Loading analytics...
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </div>
        ) : assets.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
            No form or survey has collected responses yet. Publish a new survey to
            start gathering insights.
          </div>
        ) : (
          <div className="max-w-full overflow-x-auto">
            <Table className="min-w-[820px]">
              <TableHeader className="border-y border-gray-100 bg-gray-50/60 dark:border-gray-800 dark:bg-white/[0.02]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="py-3 text-start text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
                  >
                    Title
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 text-start text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
                  >
                    Type
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 text-start text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
                  >
                    Responses
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 text-start text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
                  >
                    Completion
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 text-start text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
                  >
                    Last update
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 text-start text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {assets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell className="py-4">
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {asset.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        ID • {asset.id}
                      </p>
                    </TableCell>
                    <TableCell className="py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          asset.type === "Form"
                            ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                            : asset.type === "Survey"
                            ? "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"
                            : "bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400"
                        }`}
                      >
                        {asset.type}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 text-sm font-semibold text-gray-800 dark:text-white/90">
                      {asset.responses.toLocaleString("fr-FR")}
                    </TableCell>
                    <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-300">
                      {asset.completionRate}%
                    </TableCell>
                    <TableCell className="py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(asset.lastUpdated).toLocaleString("en-US")}
                    </TableCell>
                    <TableCell className="py-4">
                      <button
                        type="button"
                        onClick={() => handleDeleteAsset(asset)}
                        disabled={
                          asset.type !== "Survey" || deletingId === asset.id || loading
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/10 disabled:dark:border-gray-700 disabled:dark:text-gray-500"
                        title={
                          asset.type === "Survey"
                            ? "Delete survey"
                            : "Deleting forms/posts will be available soon"
                        }
                      >
                        <TrashBinIcon className="h-3.5 w-3.5" />
                        {deletingId === asset.id ? "Deleting..." : "Delete"}
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {showStatistics && !statisticsCleared && assets.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h4 className="text-base font-semibold text-gray-800 dark:text-white/90">
              Response distribution
            </h4>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Visualize how responses are distributed across your engagement types.
            </p>
            <ReactApexChart
              options={chartOptions}
              series={chartSeries}
              type="donut"
              height={320}
            />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h4 className="text-base font-semibold text-gray-800 dark:text-white/90">
              Top performing experiences
            </h4>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Highest completion rates highlight your most engaging experiences.
            </p>
            <ul className="space-y-4">
              {assets
                .slice()
                .sort((a, b) => b.completionRate - a.completionRate)
                .slice(0, 3)
                .map((asset) => (
                  <li
                    key={`metric-${asset.id}`}
                    className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-white/5"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                        {asset.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {asset.type}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                      {asset.completionRate}%
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}

      {showStatistics && !statisticsCleared && selectedSurvey && selectedQuestion && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] space-y-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[220px]">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white/80">
                Survey
              </label>
              <select
                value={selectedSurveyId ?? ""}
                onChange={(event) => setSelectedSurveyId(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-white/[0.04] dark:text-white"
              >
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[220px]">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white/80">
                Question
              </label>
              <select
                value={selectedQuestionId ?? ""}
                onChange={(event) => setSelectedQuestionId(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-white/[0.04] dark:text-white"
              >
                {(selectedSurvey.questionStats ?? []).map((question) => (
                  <option key={question.id} value={question.id}>
                    {question.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-base font-semibold text-gray-800 dark:text-white/90">
                {selectedQuestion.label}
              </h4>
              <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">
                Type: {selectedQuestion.type} • {selectedQuestion.totalAnswers} answers
              </p>
            </div>

            {questionChart?.series && questionChart.options ? (
              <ReactApexChart
                options={questionChart.options}
                series={questionChart.series}
                type={questionChart.chartType ?? "bar"}
                height={320}
              />
            ) : !questionChart?.summary ? (
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-600 dark:border-gray-700 dark:bg-white/5 dark:text-gray-300">
                Not enough structured data to build a chart for this question yet.
              </div>
            ) : null}

            {questionChart?.summary && (
              <div className="rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-700 dark:bg-brand-500/10 dark:text-brand-200">
                {questionChart.summary}
              </div>
            )}
          </div>
        </div>
      )}

      {statisticsCleared && (
        <div className="rounded-2xl border border-dashed border-error-200 bg-error-50/80 p-6 text-sm text-error-700 dark:border-error-500/40 dark:bg-error-500/10 dark:text-error-200">
          Statistics cleared. Launch a new collection to generate updated insights.
        </div>
      )}
    </div>
  );
}
