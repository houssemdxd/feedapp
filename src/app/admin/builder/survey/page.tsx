"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from "react";
import QRCode from "react-qr-code";
import PaletteSondage from "@/components/palette/SondagePalette";
import SondageCanvas from "@/components/sondage/SondageCanvas";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";

type CreatedSurvey = {
  id: string;
  title: string;
  accessCode: string;
  distributionChannel: string;
  questionCount: number;
};

const DISTRIBUTION_CHANNELS = [
  "In-app",
  "Email",
  "Website",
  "SMS",
  "Social",
];

function normalizeQuestions(components: any[]) {
  return components.map((component, index) => {
    const id = component.id || `q-${index}`;
    const label = component.label || `Question ${index + 1}`;
    const type = component.type || "text";

    const normalized: Record<string, unknown> = {
      id,
      label,
      type,
      required: component.required ?? true,
    };

    if (component.options && Array.isArray(component.options)) {
      normalized.options = component.options;
    }

    if (component.max) {
      normalized.max = component.max;
    }

    return normalized;
  });
}

export default function SurveyBuilderPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [distributionChannel, setDistributionChannel] = useState("In-app");
  const [customCode, setCustomCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdSurvey, setCreatedSurvey] = useState<CreatedSurvey | null>(null);
  const [sondageComponents, setSondageComponents] = useState<any[]>([]);

  const preparedQuestions = useMemo(
    () => normalizeQuestions(sondageComponents),
    [sondageComponents]
  );

  const shareUrl = useMemo(() => {
    if (!createdSurvey) return "";
    if (typeof window === "undefined") return "";
    const url = new URL(window.location.origin);
    url.pathname = "/client";
    url.searchParams.set("code", createdSurvey.accessCode);
    return url.toString();
  }, [createdSurvey]);

  const handleSubmit = async () => {
    setError(null);

    if (!title.trim()) {
      setError("Please provide a survey title.");
      return;
    }

    if (!preparedQuestions.length) {
      setError("Add at least one question before publishing your survey.");
      return;
    }

    setIsSubmitting(true);

    try {
      const questions = preparedQuestions;

      const response = await fetch("/api/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          distributionChannel,
          accessCode: customCode.trim() || undefined,
          questions,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to save this survey.");
        return;
      }

      setCreatedSurvey({
        id: data.survey.id,
        title: data.survey.title,
        accessCode: data.survey.accessCode,
        distributionChannel: data.survey.distributionChannel,
        questionCount: data.survey.questions?.length ?? questions.length,
      });
      setSondageComponents([]);
      setTitle("");
      setDescription("");
      setCustomCode("");
    } catch (submissionError: any) {
      console.error("Failed to create survey", submissionError);
      setError("Unexpected error while creating the survey. Try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Survey Builder" />

      <div className="mb-6 grid gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white/90">
              Survey title
            </label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Customer Satisfaction - Q4"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-white/[0.04] dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white/90">
              Description
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              placeholder="Add some context to help respondents understand the goal of this survey."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-white/[0.04] dark:text-white"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white/90">
                Distribution channel
              </label>
              <select
                value={distributionChannel}
                onChange={(event) => setDistributionChannel(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-white/[0.04] dark:text-white"
              >
                {DISTRIBUTION_CHANNELS.map((channel) => (
                  <option key={channel} value={channel}>
                    {channel}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white/90">
                Custom access code (optional)
              </label>
              <input
                value={customCode}
                onChange={(event) =>
                  setCustomCode(event.target.value.toUpperCase())
                }
                placeholder="EX: SURV01"
                maxLength={10}
                className="w-full uppercase rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-white/[0.04] dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl bg-brand-50 p-5 dark:bg-brand-500/10">
          <div>
            <h3 className="text-base font-semibold text-brand-700 dark:text-brand-300">
              How it works
            </h3>
            <ol className="mt-3 space-y-2 text-sm text-brand-700/80 dark:text-brand-300/80">
              <li>1. Compose your questions using the survey palette.</li>
              <li>
                2. Share the generated access code or QR code with your clients.
              </li>
              <li>
                3. Track the collected answers from the Forms Dashboard charts.
              </li>
            </ol>
          </div>

          <div className="mt-4 rounded-lg bg-white px-4 py-3 text-sm text-brand-700 shadow-sm dark:bg-white/90 dark:text-brand-600">
            Clients can enter the access code from their app or scan the QR code
            that you will receive right after publishing your survey.
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.06]">
          <PaletteSondage
            onAdd={(elements: any[]) => setSondageComponents(elements)}
          />
        </div>

        <div className="xl:col-span-2 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.06]">
          <div className="flex flex-col">
            <SondageCanvas
              components={sondageComponents}
              setComponents={setSondageComponents}
            />

            {error && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                {error}
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {preparedQuestions.length} question
                {preparedQuestions.length === 1 ? "" : "s"} ready to publish.
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="min-w-[160px]"
              >
                {isSubmitting ? "Publishing..." : "Publish survey"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {createdSurvey && (
        <div className="mt-8 grid gap-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:grid-cols-[minmax(0,1fr)_280px]">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Survey published successfully
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Share this access code or the QR code with your clients. Responses
              will start populating your Forms Dashboard in real time.
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-3 sm:gap-6">
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 dark:border-gray-700 dark:bg-white/10 dark:text-white/90">
                <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  Access code
                </span>
                <span className="text-2xl tracking-widest">
                  {createdSurvey.accessCode}
                </span>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 dark:border-gray-700 dark:bg-white/10 dark:text-white/90">
                <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  Channel
                </span>
                {createdSurvey.distributionChannel}
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 dark:border-gray-700 dark:bg-white/10 dark:text-white/90">
                <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  Total questions
                </span>
                {createdSurvey.questionCount}
              </div>
            </div>

            {shareUrl && (
              <div className="mt-4 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-700 dark:bg-brand-500/10 dark:text-brand-200">
                Shareable link:{" "}
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium underline hover:text-brand-600 dark:hover:text-brand-100"
                >
                  {shareUrl}
                </a>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-5 text-center dark:border-gray-600 dark:bg-white/5">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-300">
              Scan to answer
            </span>
            <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-white">
              <QRCode value={shareUrl || createdSurvey.accessCode} size={160} />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-300">
              Clients can also enter the code manually inside their dashboard.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
