"use client";

import React, { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/button/Button";
import RecentFormsTable from "@/components/client/RecentFormsTable";
import SurveyResponseForm, {
  SurveyDetails,
} from "@/components/client/SurveyResponseForm";

type LookupStatus = "idle" | "loading" | "error" | "success";

type OrganizationInfo = {
  id: string;
  name: string;
  code: string;
};

export default function ClientDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [accessCode, setAccessCode] = useState("");
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [status, setStatus] = useState<LookupStatus>("idle");
  const [organization, setOrganization] = useState<OrganizationInfo | null>(null);
  const [surveys, setSurveys] = useState<SurveyDetails[]>([]);
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const resetState = useCallback(() => {
    setAccessCode("");
    setLookupError(null);
    setStatus("idle");
    setOrganization(null);
    setSurveys([]);
    setSelectedSurveyId(null);
    setHasSubmitted(false);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("code");
      router.replace(`${url.pathname}${url.search}`, { scroll: false });
    }
  }, [router]);

  const fetchOrganizationContent = useCallback(
    async (code: string) => {
      const normalized = code.trim().toUpperCase();
      if (!normalized) {
        setLookupError("Please enter an access code.");
        return;
      }

      setStatus("loading");
      setLookupError(null);

      try {
        const response = await fetch(`/api/surveys/access-code/${normalized}`);
        const data = await response.json();

        if (!response.ok) {
          setStatus("error");
          setLookupError(data.error || "No organization matches this access code.");
          setOrganization(null);
          setSurveys([]);
          setSelectedSurveyId(null);
          return;
        }

        const sortedSurveys: SurveyDetails[] = Array.isArray(data.surveys)
          ? data.surveys
          : [];

        setOrganization(data.organization ?? null);
        setSurveys(sortedSurveys);
        setSelectedSurveyId(sortedSurveys[0]?.id ?? null);
        setAccessCode(normalized);
        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);
          url.searchParams.set("code", normalized);
          router.replace(`${url.pathname}${url.search}`, { scroll: false });
        }
        setStatus("success");
        setHasSubmitted(false);
      } catch (error) {
        console.error("Failed to load survey:", error);
        setStatus("error");
        setLookupError(
          "Unable to load this survey right now. Please try again later."
        );
        setOrganization(null);
        setSurveys([]);
        setSelectedSurveyId(null);
      }
    },
    [router]
  );

  useEffect(() => {
    const codeParam = searchParams.get("code");
    if (codeParam) {
      const normalized = codeParam.trim().toUpperCase();
      setAccessCode(normalized);
      fetchOrganizationContent(normalized);
    }
  }, [fetchOrganizationContent, searchParams]);

  const handleSubmitCode = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    fetchOrganizationContent(accessCode);
  };

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          {!organization ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Participate in a survey
                </h2>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Enter the access code provided by the organization or scan the QR
                  code from your device.
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmitCode}>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white/90">
                    Access code
                  </label>
                  <input
                    value={accessCode}
                    onChange={(event) =>
                      setAccessCode(event.target.value.toUpperCase())
                    }
                    placeholder="e.g. SURV01"
                    maxLength={10}
                    className="w-full uppercase rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-white/[0.04] dark:text-white"
                  />
                </div>

                {lookupError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                    {lookupError}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <Button type="submit" disabled={status === "loading"}>
                    {status === "loading" ? "Searching..." : "Find survey"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetState}
                    disabled={status === "loading" && !lookupError}
                  >
                    Reset
                  </Button>
                </div>
              </form>

              <div className="rounded-xl bg-gray-50 px-4 py-3 text-xs text-gray-600 dark:bg-white/5 dark:text-gray-300">
                Tip: You can also scan a QR code to autofill the code on mobile.
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                    {organization.name}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Access code: {organization.code}
                  </p>
                  {hasSubmitted && (
                    <p className="mt-1 text-xs font-medium uppercase text-emerald-600 dark:text-emerald-400">
                      Response submitted — thank you for participating.
                    </p>
                  )}
                </div>
                <Button variant="outline" onClick={resetState}>
                  Use another code
                </Button>
              </div>

              {surveys.length === 0 ? (
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-600 dark:border-gray-700 dark:bg-white/5 dark:text-gray-300">
                  This organization has not published any surveys yet.
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    {surveys.map((survey) => {
                      const isSelected = survey.id === selectedSurveyId;
                      return (
                        <button
                          key={survey.id}
                          onClick={() => {
                            setSelectedSurveyId(survey.id);
                            setHasSubmitted(false);
                          }}
                          className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                            isSelected
                              ? "border-brand-500 bg-brand-500 text-white"
                              : "border-gray-200 bg-white text-gray-700 hover:border-brand-500 hover:text-brand-600 dark:border-gray-700 dark:bg-white/[0.03] dark:text-gray-300"
                          }`}
                        >
                          {survey.title || "Untitled survey"}
                        </button>
                      );
                    })}
                  </div>

                  {selectedSurveyId ? (
                    <SurveyResponseForm
                      survey={
                        surveys.find((survey) => survey.id === selectedSurveyId) ??
                        surveys[0]
                      }
                      onSubmitted={() => setHasSubmitted(true)}
                    />
                  ) : null}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="col-span-12 xl:col-span-5">
        <RecentFormsTable />
      </div>
    </div>
  );
}
