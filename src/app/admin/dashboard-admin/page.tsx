/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AiOutlineFileText, AiOutlineFile, AiOutlineDelete } from "react-icons/ai";
import { getAllFormTemplates, deleteFormTemplate, getFormTemplateById, updateFormTemplateType } from "@/app/actions/formActions";
import BarChartOne from "@/components/charts/bar/BarChartOne";
import LineChartOne from "@/components/charts/line/LineChartOne";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Item {
  id: string;
  title: string;
  createdAt: string;
  type: "form" | "post" | "survey";
}

interface TableProps {
  items: Item[];
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  onSelect?: (id: string) => void;
  selectedId?: string | null;
  loadingStatsId?: string | null;
  onChangeType?: (id: string, type: Item["type"]) => void;
  updatingTypeId?: string | null;
}

interface FormStatsQuestionOption {
  label: string;
  count: number;
  percentage: number;
}

interface FormStatsNumericPoint {
  value: number;
  count: number;
  percentage: number;
}

interface FormStatsQuestion {
  id: string;
  question: string;
  type: string;
  totalAnswers: number;
  options: FormStatsQuestionOption[];
  extraOptions: FormStatsQuestionOption[];
  numeric: {
    average: number;
    min: number | null;
    max: number | null;
    distribution: FormStatsNumericPoint[];
  } | null;
  samples: string[];
}

interface FormStatsResponse {
  form: { id: string; title: string; type: string };
  totalResponses: number;
  timeline: { date: string; count: number }[];
  questions: FormStatsQuestion[];
}

const ItemsTable: React.FC<TableProps> = ({
  items,
  onDelete,
  onView,
  onSelect,
  selectedId,
  loadingStatsId,
  onChangeType,
  updatingTypeId,
}) => (
  <div className="overflow-x-auto w-full rounded-lg">
    <table className="min-w-full border-separate border-spacing-0">
      <thead className="sticky top-0 z-10">
        <tr>
          <th className="rounded-tl-lg border-b border-gray-200/80 bg-gradient-to-r from-gray-50 to-gray-100/80 px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700 backdrop-blur-sm dark:border-gray-700/80 dark:from-gray-800 dark:to-gray-800/80 dark:text-gray-300">
            Title
          </th>
          <th className="border-b border-gray-200/80 bg-gradient-to-r from-gray-50 to-gray-100/80 px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700 backdrop-blur-sm dark:border-gray-700/80 dark:from-gray-800 dark:to-gray-800/80 dark:text-gray-300">
            <span className="flex items-center gap-1.5">
              Type <AiOutlineFileText className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
            </span>
          </th>
          <th className="border-b border-gray-200/80 bg-gradient-to-r from-gray-50 to-gray-100/80 px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700 backdrop-blur-sm dark:border-gray-700/80 dark:from-gray-800 dark:to-gray-800/80 dark:text-gray-300">
            Created At
          </th>
          <th className="rounded-tr-lg border-b border-gray-200/80 bg-gradient-to-r from-gray-50 to-gray-100/80 px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700 backdrop-blur-sm dark:border-gray-700/80 dark:from-gray-800 dark:to-gray-800/80 dark:text-gray-300">
            Action
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
        {items.map((item) => {
          const isSelected = selectedId === item.id;
          return (
            <tr
              key={item.id}
              className={`transition-all duration-200 ${
                isSelected
                  ? "bg-gradient-to-r from-blue-50/80 to-indigo-50/80 shadow-sm dark:from-blue-500/10 dark:to-indigo-500/10"
                  : "bg-white/50 hover:bg-gray-50/80 dark:bg-gray-800/50 dark:hover:bg-gray-700/50"
              }`}
            >
              <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{item.title}</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-700/50 dark:text-gray-300">
                  {item.type === "form" || item.type === "survey" ? (
                    <AiOutlineFileText className="h-3 w-3" />
                  ) : (
                    <AiOutlineFile className="h-3 w-3" />
                  )}
                  {item.type === "form" ? "Form" : item.type === "survey" ? "Survey" : "Post"}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{item.createdAt}</td>
              <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                <div className="flex flex-wrap gap-2 items-center">
                  {onSelect && (
                    <button
                      className={`group relative overflow-hidden rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-300 ${
                        isSelected
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                          : "border border-blue-500/30 bg-white/80 text-blue-600 backdrop-blur-sm hover:border-blue-500 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-md hover:shadow-blue-500/20 dark:border-blue-400/20 dark:bg-gray-800/80 dark:text-blue-400 dark:hover:from-blue-500/10 dark:hover:to-indigo-500/10"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      onClick={() => onSelect(item.id)}
                      disabled={loadingStatsId === item.id}
                    >
                      <span className="relative z-10 flex items-center gap-1.5">
                        {loadingStatsId === item.id ? (
                          <>
                            <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Loading…
                          </>
                        ) : isSelected ? (
                          <>
                            <span>✓</span>
                            Selected
                          </>
                        ) : (
                          <>
                            <span>📊</span>
                            Stats
                          </>
                        )}
                      </span>
                    </button>
                  )}
                  <button
                    className="group flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-xs font-medium text-gray-700 backdrop-blur-sm transition-all duration-200 hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-300 dark:hover:border-blue-500/30 dark:hover:from-blue-500/10 dark:hover:to-indigo-500/10"
                    onClick={() => onView(item.id)}
                  >
                    <span className="text-sm">👁️</span>
                    View
                  </button>
                  <button
                    className="group flex items-center gap-1.5 rounded-lg border border-red-200 bg-white/80 px-3 py-2 text-xs font-medium text-red-600 backdrop-blur-sm transition-all duration-200 hover:border-red-400 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:shadow-sm dark:border-red-500/30 dark:bg-gray-800/80 dark:text-red-400 dark:hover:border-red-400/50 dark:hover:from-red-500/10 dark:hover:to-pink-500/10"
                    onClick={() => onDelete(item.id)}
                  >
                    <AiOutlineDelete className="h-3.5 w-3.5" />
                    Delete
                  </button>
                  {onChangeType && (
                    <select
                      value={item.type}
                      onChange={(e) => onChangeType(item.id, e.target.value as Item["type"])}
                      disabled={updatingTypeId === item.id}
                      className="rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-xs font-medium text-gray-700 backdrop-blur-sm transition-all duration-200 hover:border-blue-300 hover:shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-300 dark:hover:border-blue-500/30 dark:focus:border-blue-500/50"
                    >
                      <option value="form">Form</option>
                      <option value="survey">Survey</option>
                    </select>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

const QuestionStatsCard: React.FC<{ question: FormStatsQuestion }> = ({ question }) => {
  const combinedOptions = useMemo(() => [...question.options, ...question.extraOptions], [question.options, question.extraOptions]);
  const hasChoiceData = combinedOptions.some((option) => option.count > 0);
  const hasNumericData = !!question.numeric && question.numeric.distribution.length > 0;
  const hasSamples = question.samples.length > 0;

  const donutOptions = useMemo(
    () => ({
      chart: {
        type: "donut" as const,
        fontFamily: "Outfit, sans-serif",
      },
      labels: combinedOptions.map((option) => option.label || "—"),
      legend: {
        position: "bottom" as const,
        labels: {
          colors: "#6B7280",
          useSeriesColors: false,
        },
        formatter: (seriesName: string, opts: any) => {
          const seriesIndex = opts.seriesIndex ?? 0;
          const count = combinedOptions[seriesIndex]?.count ?? 0;
          const total = combinedOptions.reduce((sum, opt) => sum + opt.count, 0);
          const pct = total ? ((count / total) * 100).toFixed(1) : "0";
          return `${seriesName}: ${count} (${pct}%)`;
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => {
          if (val < 0.1) return "";
          return `${val.toFixed(val >= 10 ? 0 : 1)}%`;
        },
        style: {
          fontSize: "14px",
          fontWeight: 600,
          colors: ["#fff"],
        },
        dropShadow: {
          enabled: true,
          color: "#000",
          blur: 3,
          opacity: 0.35,
        },
      },
      tooltip: {
        y: {
          formatter: (value: number, { seriesIndex }: any) => {
            const label = combinedOptions[seriesIndex]?.label || "—";
            const total = combinedOptions.reduce((sum, opt) => sum + opt.count, 0);
            const pct = total ? ((value / total) * 100).toFixed(1) : "0";
            return `${label}: ${value} réponse(s) (${pct}%)`;
          },
        },
      },
      plotOptions: {
        pie: {
          donut: {
            size: "65%",
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: "16px",
                fontWeight: 600,
                color: "#374151",
              },
              value: {
                show: true,
                fontSize: "20px",
                fontWeight: 700,
                color: "#1f2937",
                formatter: (val: string) => {
                  const total = combinedOptions.reduce((sum, opt) => sum + opt.count, 0);
                  if (!total) return "0";
                  return String(total);
                },
              },
              total: {
                show: true,
                label: "Total",
                fontSize: "14px",
                fontWeight: 600,
                color: "#6B7280",
                formatter: () => {
                  const total = combinedOptions.reduce((sum, opt) => sum + opt.count, 0);
                  return `${total} réponse(s)`;
                },
              },
            },
          },
        },
      },
      stroke: {
        width: 2,
        colors: ["#fff"],
      },
      colors: ["#2563eb", "#4f46e5", "#1d4ed8", "#4338ca", "#0f766e", "#14b8a6", "#f97316", "#facc15", "#ef4444", "#8b5cf6"],
    }),
    [combinedOptions]
  );
  const donutSeries = useMemo(() => combinedOptions.map((option) => option.count), [combinedOptions]);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white/90 p-6 shadow-lg shadow-gray-200/30 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-gray-300/40 dark:border-gray-700/80 dark:bg-gray-800/90 dark:shadow-gray-900/30 dark:hover:shadow-gray-900/50">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
      <div className="relative z-10">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white/90">{question.question}</h4>
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                {question.totalAnswers} réponse(s)
              </span>
            </div>
          </div>
          <span className="inline-flex items-center rounded-full border border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-gray-700 shadow-sm dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-gray-300">
            {question.type}
          </span>
        </div>

      <div className="mt-4 space-y-4">
        {hasChoiceData && (
          <div className="grid gap-4 lg:grid-cols-2">
            <BarChartOne
              categories={combinedOptions.map((option) => option.label || "—")}
              series={[
                {
                  name: "Réponses",
                  data: combinedOptions.map((option) => option.count),
                },
              ]}
              colors={["#2563eb"]}
              height={220}
              minWidth={Math.max(360, combinedOptions.length * 90)}
            />

            <div className="flex items-center justify-center">
              <div className="w-full max-w-sm">
                <ReactApexChart options={donutOptions} series={donutSeries} type="donut" height={300} />
              </div>
            </div>
          </div>
        )}

        {question.numeric && (
          <>
            {question.type === "rating" ? (
              <div className="relative overflow-hidden rounded-2xl border-2 border-blue-300/80 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 shadow-xl shadow-blue-500/20 backdrop-blur-sm dark:border-blue-500/40 dark:from-blue-500/15 dark:via-indigo-500/15 dark:to-purple-500/15">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-purple-500/10"></div>
                <div className="relative z-10 flex flex-col items-center justify-center gap-3 text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                    Note moyenne
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-5xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
                      {question.numeric.average.toFixed(2)}
                    </p>
                    <p className="text-xl font-semibold text-blue-600/70 dark:text-blue-400/70">/ {question.numeric.max ?? 5}</p>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                    {question.totalAnswers} réponse{question.totalAnswers > 1 ? "s" : ""} de {question.totalAnswers} client{question.totalAnswers > 1 ? "s" : ""}
                  </div>
                  <div className="mt-4 flex gap-1">
                    {Array.from({ length: Math.ceil(question.numeric.max ?? 5) }).map((_, i) => {
                      const starValue = i + 1;
                      const isFilled = starValue <= Math.round(question.numeric.average);
                      return (
                        <span
                          key={starValue}
                          className={`text-3xl transition-transform duration-200 hover:scale-110 ${
                            isFilled 
                              ? "text-yellow-400 drop-shadow-lg" 
                              : "text-gray-300 dark:text-gray-600"
                          }`}
                        >
                          ★
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}
            <div className={`grid gap-3 ${question.type === "rating" ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
              <div className={`group relative overflow-hidden rounded-xl border p-4 text-sm transition-all hover:shadow-md ${
                question.type === "rating" 
                  ? "border-blue-300/80 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm dark:border-blue-500/30 dark:from-blue-500/10 dark:to-indigo-500/10" 
                  : "border-gray-200/80 bg-gradient-to-br from-gray-50 to-gray-100/80 shadow-sm dark:border-gray-700/80 dark:from-gray-800/80 dark:to-gray-700/80"
              }`}>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {question.type === "rating" ? "Moyenne calculée" : "Moyenne"}
                </p>
                <p className={`text-2xl font-bold ${question.type === "rating" ? "text-blue-700 dark:text-blue-300" : "text-gray-900 dark:text-white"}`}>
                  {question.numeric.average.toFixed(2)}
                </p>
                {question.type === "rating" && (
                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                    ({question.totalAnswers} client{question.totalAnswers > 1 ? "s" : ""})
                  </p>
                )}
              </div>
              <div className="group relative overflow-hidden rounded-xl border border-gray-200/80 bg-gradient-to-br from-gray-50 to-gray-100/80 p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700/80 dark:from-gray-800/80 dark:to-gray-700/80">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Min</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {question.numeric.min ?? "—"}
                </p>
              </div>
              {question.type !== "rating" && (
                <div className="group relative overflow-hidden rounded-xl border border-gray-200/80 bg-gradient-to-br from-gray-50 to-gray-100/80 p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700/80 dark:from-gray-800/80 dark:to-gray-700/80">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Max</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {question.numeric.max ?? "—"}
                  </p>
                </div>
              )}
              {question.type === "rating" && (
                <div className="group relative overflow-hidden rounded-xl border border-gray-200/80 bg-gradient-to-br from-gray-50 to-gray-100/80 p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700/80 dark:from-gray-800/80 dark:to-gray-700/80">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Max</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {question.numeric.max ?? "—"}
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {hasNumericData && question.numeric && (
          <BarChartOne
            categories={question.numeric.distribution.map((point) => String(point.value))}
            series={[
              {
                name: "Occurrences",
                data: question.numeric.distribution.map((point) => point.count),
              },
            ]}
            colors={["#10b981"]}
            height={220}
            minWidth={Math.max(420, question.numeric.distribution.length * 120)}
          />
        )}

        {hasSamples && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-white/[0.04] dark:text-gray-300">
            <p className="mb-2 font-medium text-gray-800 dark:text-white/90">Exemples de réponses</p>
            <ul className="list-inside list-disc space-y-1">
              {question.samples.map((sample) => (
                <li key={sample} className="truncate">{sample}</li>
              ))}
            </ul>
          </div>
        )}

        {!hasChoiceData && !question.numeric && !hasSamples && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/80 p-4 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400">
            Aucune donnée exploitable pour cette question pour l&apos;instant.
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default function FormsPostsTable() {
  const [activeTab, setActiveTab] = useState<"form" | "post" | "survey">("form");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewFormData, setViewFormData] = useState<any | null>(null);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [statsByForm, setStatsByForm] = useState<Record<string, FormStatsResponse>>({});
  const [loadingStatsId, setLoadingStatsId] = useState<string | null>(null);
  const [statsError, setStatsError] = useState("");
  const [aiInsights, setAiInsights] = useState<Record<string, any>>({});
  const [loadingAI, setLoadingAI] = useState<string | null>(null);
  const [updatingTypeId, setUpdatingTypeId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res: any = await getAllFormTemplates();
        if (res.success) {
          const mappedItems: Item[] = res.data.map((f: any) => ({
            id: f.id,
            title: f.title,
            type: f.type,
            createdAt: new Date(f.createdAt).toLocaleDateString(),
          }));
          setItems(mappedItems);
        } else {
          console.error(res.error);
        }
      } catch (err) {
        console.error("Failed to fetch items:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!items.length) {
      if (selectedFormId !== null) setSelectedFormId(null);
      return;
    }
    if (selectedFormId) {
      const stillExists = items.some((item) => item.id === selectedFormId && item.type === activeTab);
      if (stillExists) return;
    }
    const firstInTab = items.find((item) => item.type === activeTab);
    setSelectedFormId(firstInTab ? firstInTab.id : null);
  }, [items, activeTab, selectedFormId]);

  useEffect(() => {
    if (!selectedFormId || statsByForm[selectedFormId]) return;

    let cancelled = false;
    const controller = new AbortController();
    setLoadingStatsId(selectedFormId);
    setStatsError("");

    const loadStats = async () => {
      try {
        const res = await fetch(`/api/forms/${selectedFormId}/responses`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json?.error || "Failed to load stats");
        }
        if (!cancelled) {
          setStatsByForm((prev) => ({ ...prev, [selectedFormId]: json as FormStatsResponse }));
        }
      } catch (error: any) {
        if (cancelled || error?.name === "AbortError") return;
        setStatsError(error?.message || "Failed to load stats");
      } finally {
        if (!cancelled) {
          setLoadingStatsId((prev) => (prev === selectedFormId ? null : prev));
        }
      }
    };

    loadStats();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [selectedFormId, statsByForm]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const res: any = await deleteFormTemplate(id);
      if (res.success) {
        setItems((prev) => prev.filter((item) => item.id !== id));
        setStatsByForm((prev) => {
          const copy = { ...prev };
          delete copy[id];
          return copy;
        });
        if (selectedFormId === id) {
          setSelectedFormId(null);
        }
        alert("Deleted successfully!");
      } else {
        alert("Failed to delete: " + res.error);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while deleting.");
    }
  };

  const handleChangeType = async (id: string, type: "form" | "survey") => {
    try {
      setUpdatingTypeId(id);
      const res = await updateFormTemplateType(id, type);
      if (!res.success) {
        alert(res.error || "Failed to update type");
        return;
      }

      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, type } : item))
      );

      setStatsByForm((prev) => {
        if (!prev[id]) return prev;
        return {
          ...prev,
          [id]: {
            ...prev[id],
            form: { ...prev[id].form, type },
          },
        };
      });
    } catch (err) {
      console.error(err);
      alert("Error updating type");
    } finally {
      setUpdatingTypeId(null);
    }
  };

  const handleAnalyzeWithAI = async (formId: string) => {
    const stats = statsByForm[formId];
    if (!stats || stats.totalResponses === 0) {
      alert("Aucune statistique disponible pour l'analyse.");
      return;
    }

    setLoadingAI(formId);
    try {
      const res = await fetch("/api/ai/analyze-stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stats,
          formTitle: stats.form.title,
          formType: stats.form.type,
        }),
      });

      const analysis = await res.json();
      // Toujours stocker l'analyse même en cas d'erreur (elle contient un message d'erreur formaté)
      setAiInsights((prev) => ({ ...prev, [formId]: analysis }));
      
      if (!res.ok && analysis.error) {
        console.error("AI analysis error:", analysis.error);
      }
    } catch (err: any) {
      console.error("AI analysis error:", err);
      // Stocker un message d'erreur formaté
      setAiInsights((prev) => ({
        ...prev,
        [formId]: {
          summary: "Erreur lors de l'analyse: " + (err?.message || "Erreur inconnue"),
          insights: [],
          recommendations: [],
          highlights: {}
        }
      }));
    } finally {
      setLoadingAI(null);
    }
  };

  const handleViewForm = async (id: string) => {
    try {
      const res = await getFormTemplateById(id);
      if (res.success) {
        setViewFormData(res.data);
      } else {
        alert("Failed to fetch form: " + res.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error fetching form");
    }
  };

  const filteredItems = useMemo(() => items.filter((item) => item.type === activeTab), [items, activeTab]);
  const selectedStats = selectedFormId ? statsByForm[selectedFormId] : null;
  const selectedForm = selectedFormId ? items.find((item) => item.id === selectedFormId) : null;

  const timelineCategories = useMemo(
    () =>
      selectedStats
        ? selectedStats.timeline.map((point) =>
            new Date(point.date).toLocaleDateString(undefined, { day: "2-digit", month: "short" })
          )
        : [],
    [selectedStats]
  );

  const timelineSeries = useMemo(
    () =>
      selectedStats
        ? [
            {
              name: "Soumissions",
              data: selectedStats.timeline.map((point) => point.count),
            },
          ]
        : [],
    [selectedStats]
  );

  if (loading) return <div className="p-5">Loading...</div>;

  return (
    <div className="p-5 w-full space-y-6">
      <div className="relative mb-6 rounded-xl border border-gray-200 bg-white/80 p-1.5 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/80">
        <div className="flex gap-1.5">
          {["form", "survey", "post"].map((tab) => (
            <button
              key={tab}
              className={`group relative flex-1 rounded-lg px-4 py-3 text-center text-sm font-semibold transition-all duration-300 ${
                activeTab === tab
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                  : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-gray-200"
              }`}
              onClick={() => setActiveTab(tab as "form" | "post" | "survey")}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {tab === "form" ? (
                  <>
                    <AiOutlineFileText className="h-4 w-4" />
                    Form
                  </>
                ) : tab === "survey" ? (
                  <>
                    <AiOutlineFileText className="h-4 w-4" />
                    Survey
                  </>
                ) : (
                  <>
                    <AiOutlineFile className="h-4 w-4" />
                    Post
                  </>
                )}
              </span>
              {activeTab === tab && (
                <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-5">
          <div className="rounded-2xl border border-gray-200/80 bg-white/90 p-6 shadow-lg shadow-gray-200/50 backdrop-blur-sm dark:border-gray-700/80 dark:bg-gray-800/90 dark:shadow-gray-900/50">
            <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white/90">
              {activeTab === "form" ? "📋 Forms" : activeTab === "survey" ? "📊 Surveys" : "📄 Posts"}
            </h3>
            {filteredItems.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Aucun élément pour ce type.</p>
            ) : (
              <ItemsTable
                items={filteredItems}
                onDelete={handleDelete}
                onView={handleViewForm}
                onSelect={setSelectedFormId}
                selectedId={selectedFormId}
                loadingStatsId={loadingStatsId}
                onChangeType={handleChangeType}
                updatingTypeId={updatingTypeId}
              />
            )}
          </div>
        </div>

        <div className="col-span-12 xl:col-span-7 space-y-6">
          <div className="rounded-2xl border border-gray-200/80 bg-white/90 p-6 shadow-lg shadow-gray-200/50 backdrop-blur-sm dark:border-gray-700/80 dark:bg-gray-800/90 dark:shadow-gray-900/50">
            {selectedForm ? (
              <>
                <div className="flex flex-col gap-3 border-b border-gray-200/80 pb-5 dark:border-gray-700/80 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent dark:from-white dark:to-gray-300">
                      {selectedForm.title}
                    </h3>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                        {selectedStats ? `${selectedStats.totalResponses} réponse(s)` : "Chargement des statistiques…"}
                      </span>
                    </div>
                  </div>
                  {selectedStats && selectedStats.totalResponses > 0 && (
                    <button
                      onClick={() => handleAnalyzeWithAI(selectedForm.id)}
                      disabled={loadingAI === selectedForm.id}
                      className="group relative overflow-hidden rounded-xl border border-purple-300/50 bg-gradient-to-br from-purple-500 via-indigo-500 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/40 disabled:scale-100 disabled:opacity-60 disabled:cursor-not-allowed dark:border-purple-400/30 dark:shadow-purple-500/20 dark:hover:shadow-purple-500/30"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {loadingAI === selectedForm.id ? (
                          <>
                            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Analyse en cours…
                          </>
                        ) : (
                          <>
                            <span className="text-lg">🤖</span>
                            Analyser avec IA
                          </>
                        )}
                      </span>
                      <span className="absolute inset-0 -z-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:animate-shimmer"></span>
                    </button>
                  )}
                </div>

                {selectedForm && aiInsights[selectedForm.id] && (
                  <div className="group relative mt-6 overflow-hidden rounded-2xl border border-purple-300/50 bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 p-6 shadow-xl shadow-purple-500/10 backdrop-blur-sm dark:border-purple-500/30 dark:from-purple-500/10 dark:via-indigo-500/10 dark:to-pink-500/10">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-indigo-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                    <div className="relative z-10">
                      <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/30">
                          <span className="text-xl">🤖</span>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-purple-900 dark:text-purple-200">Analyse IA</h4>
                          <p className="text-xs text-purple-600 dark:text-purple-400">Insights générés automatiquement</p>
                        </div>
                      </div>

                      {aiInsights[selectedForm.id].summary && (
                        <div className="mb-5 rounded-xl border border-purple-200/80 bg-white/90 p-4 shadow-sm backdrop-blur-sm dark:border-purple-500/30 dark:bg-gray-800/90">
                          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">Résumé</p>
                          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{aiInsights[selectedForm.id].summary}</p>
                        </div>
                      )}

                      {aiInsights[selectedForm.id].insights && Array.isArray(aiInsights[selectedForm.id].insights) && aiInsights[selectedForm.id].insights.length > 0 && (
                        <div className="mb-5">
                          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">Insights clés</p>
                          <ul className="space-y-2.5">
                            {aiInsights[selectedForm.id].insights.map((insight: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-3 rounded-lg border border-purple-100 bg-white/80 p-3 text-sm text-gray-700 backdrop-blur-sm transition-all hover:border-purple-200 hover:shadow-sm dark:border-purple-500/20 dark:bg-gray-800/80 dark:text-gray-300 dark:hover:border-purple-500/30">
                                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-xs font-bold text-white">•</span>
                                <span className="flex-1">{insight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {aiInsights[selectedForm.id].recommendations && Array.isArray(aiInsights[selectedForm.id].recommendations) && aiInsights[selectedForm.id].recommendations.length > 0 && (
                        <div className="mb-5">
                          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">Recommandations</p>
                          <ul className="space-y-2.5">
                            {aiInsights[selectedForm.id].recommendations.map((rec: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-3 rounded-lg border border-indigo-100 bg-white/80 p-3 text-sm text-gray-700 backdrop-blur-sm transition-all hover:border-indigo-200 hover:shadow-sm dark:border-indigo-500/20 dark:bg-gray-800/80 dark:text-gray-300 dark:hover:border-indigo-500/30">
                                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-xs font-bold text-white">→</span>
                                <span className="flex-1">{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {aiInsights[selectedForm.id].highlights && Object.keys(aiInsights[selectedForm.id].highlights).length > 0 && (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {Object.entries(aiInsights[selectedForm.id].highlights).map(([key, value]: [string, any]) => (
                            <div key={key} className="rounded-xl border border-purple-200/80 bg-white/90 p-4 shadow-sm backdrop-blur-sm transition-all hover:shadow-md dark:border-purple-500/30 dark:bg-gray-800/90">
                              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">{key}</p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{String(value)}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {statsError && (
                  <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
                    {statsError}
                  </div>
                )}

                {loadingStatsId === selectedForm.id && !statsError && (
                  <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">Chargement des statistiques…</div>
                )}

                {selectedStats && !statsError && (
                  <div className="mt-6 space-y-6">
                    {selectedStats.totalResponses === 0 ? (
                      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-white/[0.04] dark:text-gray-400">
                        Aucune réponse enregistrée pour le moment. Partagez le formulaire avec vos clients pour voir apparaître les statistiques ici.
                      </div>
                    ) : (
                      <>
                        {selectedStats.timeline.length > 0 && (
                          <LineChartOne
                            categories={timelineCategories}
                            series={timelineSeries}
                            colors={["#1d4ed8"]}
                            height={280}
                            showLegend={false}
                            minWidth={Math.max(480, timelineCategories.length * 100)}
                          />
                        )}
                        <div className="space-y-6">
                          {selectedStats.questions.map((question) => (
                            <QuestionStatsCard key={question.id} question={question} />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Sélectionnez un élément pour consulter ses statistiques détaillées.
              </div>
            )}
          </div>
        </div>
      </div>

      {viewFormData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => setViewFormData(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-gradient-to-br from-white to-gray-100 p-6 shadow-2xl dark:from-gray-900 dark:to-gray-800 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setViewFormData(null)}
              className="absolute right-3 top-3 text-gray-500 transition hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>

            <h3 className="mb-6 text-2xl font-bold text-center text-gray-800 dark:text-white">
              {viewFormData.form.title}
            </h3>

            <form className="space-y-6">
              {viewFormData.questions.length > 0 ? (
                viewFormData.questions.map((q: any) => (
                  <div
                    key={q.id}
                    className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                  >
                    <label className="mb-2 block font-medium text-gray-800 dark:text-gray-200">
                      {q.question}
                    </label>

                    {q.type === "text" && (
                      <input
                        type="text"
                        placeholder="Enter your answer"
                        className="w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900"
                      />
                    )}

                    {q.type === "radio" &&
                      q.elements?.map((el: string, i: number) => (
                        <label key={i} className="mb-1 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <input type="radio" name={q.id} className="text-blue-500" /> {el}
                        </label>
                      ))}

                    {q.type === "checkbox" &&
                      q.elements?.map((el: string, i: number) => (
                        <label key={i} className="mb-1 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <input type="checkbox" name={q.id} className="text-blue-500" /> {el}
                        </label>
                      ))}

                    {q.type === "rating" && (
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((r) => (
                          <span key={r}>⭐</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400">
                  No questions available for this form.
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
