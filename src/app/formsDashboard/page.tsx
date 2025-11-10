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

type EngagementAsset = {
  id: string;
  title: string;
  type: "Form" | "Survey" | "Post";
  responses: number;
  completionRate: number;
  lastUpdated: string;
  accessCode?: string;
  distributionChannel?: string;
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

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Active Engagement Assets
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Gardez un aperçu centralisé de vos formulaires, sondages et posts.
            </p>
            {analytics?.lastActivity && (
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                Dernière activité&nbsp;:
                {" "}
                {new Date(analytics.lastActivity).toLocaleString("fr-FR")}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-brand-50 px-3 py-1 font-medium text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              {assets.length} éléments
            </span>
            <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-600 dark:bg-white/10 dark:text-gray-300">
              {totalResponses} réponses collectées
            </span>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
            Chargement des analytics...
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </div>
        ) : assets.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
            Aucun formulaire ou sondage n&apos;a encore collecté de réponses.
            Publiez un nouveau sondage pour commencer à recevoir des insights.
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
                    Access code
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
                    Channel
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 text-start text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
                  >
                    Last update
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
                      {asset.accessCode ?? "—"}
                    </TableCell>
                    <TableCell className="py-4 text-sm font-semibold text-gray-800 dark:text-white/90">
                      {asset.responses.toLocaleString("fr-FR")}
                    </TableCell>
                    <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-300">
                      {asset.completionRate}%
                    </TableCell>
                    <TableCell className="py-4 text-sm text-gray-700 dark:text-gray-300">
                      {asset.distributionChannel ?? "In-app"}
                    </TableCell>
                    <TableCell className="py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(asset.lastUpdated).toLocaleString("fr-FR")}
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
              Répartition des réponses
            </h4>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Visualisez le volume des réponses selon le type de contenu partagé.
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
              Indicateurs de performance
            </h4>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Les meilleurs taux de complétion vous permettent d&apos;identifier
              les expériences les plus engageantes.
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
                        {asset.type} • {asset.distributionChannel ?? "In-app"}
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

      {statisticsCleared && (
        <div className="rounded-2xl border border-dashed border-error-200 bg-error-50/80 p-6 text-sm text-error-700 dark:border-error-500/40 dark:bg-error-500/10 dark:text-error-200">
          Les statistiques ont été supprimées. Relancez une nouvelle collecte
          pour générer des insights mis à jour.
        </div>
      )}
    </div>
  );
}
