"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import PaletteSondage from "@/components/palette/SondagePalette";
import SondageCanvas from "@/components/sondage/SondageCanvas";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";

type CreatedSurvey = {
  id: string;
  title: string;
  questionCount: number;
};

const ACCESS_CODE_ENDPOINT = "/api/user/access-code";

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
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdSurvey, setCreatedSurvey] = useState<CreatedSurvey | null>(null);
  const [sondageComponents, setSondageComponents] = useState<any[]>([]);
  const [organizationCode, setOrganizationCode] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);

  const preparedQuestions = useMemo(
    () => normalizeQuestions(sondageComponents),
    [sondageComponents]
  );

  useEffect(() => {
    const fetchOrganizationCode = async () => {
      try {
        const response = await fetch(ACCESS_CODE_ENDPOINT);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Unable to fetch organization code.");
        }
        if (data.generatedCode) {
          setOrganizationCode(data.generatedCode);
        } else {
          setCodeError(
            "No organization code found. Please generate one in Preferences."
          );
        }
      } catch (err) {
        console.error("Failed to load organization code", err);
        setCodeError(
          "Unable to load organization code. Please refresh or check your preferences."
        );
      }
    };

    fetchOrganizationCode();
  }, []);

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
        questionCount: data.survey.questions?.length ?? questions.length,
      });
      setSondageComponents([]);
      setTitle("");
      setDescription("");
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

        </div>

        <div className="flex flex-col justify-between rounded-xl bg-brand-50 p-5 dark:bg-brand-500/10">
          <div>
            <h3 className="text-base font-semibold text-brand-700 dark:text-brand-300">
              How it works
            </h3>
            <ol className="mt-3 space-y-2 text-sm text-brand-700/80 dark:text-brand-300/80">
              <li>1. Compose your questions using the survey palette.</li>
              <li>
                2. Share your organization access code with clients so they can open all published experiences.
              </li>
              <li>
                3. Track the collected answers from the Forms Dashboard charts.
              </li>
            </ol>
          </div>

          <div className="mt-4 rounded-lg bg-white px-4 py-3 text-sm text-brand-700 shadow-sm dark:bg-white/90 dark:text-brand-600">
            Clients only need your organization code once to see every form or survey you publish.
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
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Survey published successfully
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Share your organization access code with clients. Responses will start populating your Forms Dashboard in real time.
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-3 sm:gap-6">
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 dark:border-gray-700 dark:bg-white/10 dark:text-white/90">
                <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  Survey title
                </span>
                <span>{createdSurvey.title || "Untitled survey"}</span>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 dark:border-gray-700 dark:bg-white/10 dark:text-white/90">
                <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  Total questions
                </span>
                {createdSurvey.questionCount}
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 dark:border-gray-700 dark:bg-white/10 dark:text-white/90">
                <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  Organization access code
                </span>
                <span className="text-2xl tracking-widest">
                  {organizationCode ?? "N/A"}
                </span>
              </div>
            </div>

            {codeError && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                {codeError}
              </div>
            )}
            {!codeError && !organizationCode && (
              <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 dark:border-gray-700 dark:bg-white/5 dark:text-gray-300">
                Loading organization code...
              </div>
            )}
            {organizationCode && (
              <span className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-200">
                Share this code with your clients: {organizationCode}
            </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
