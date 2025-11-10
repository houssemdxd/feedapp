"use client";

import React, { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/button/Button";
import RecentFormsTable from "@/components/client/RecentFormsTable";
import SurveyResponseForm, {
  SurveyDetails,
} from "@/components/client/SurveyResponseForm";

type LookupStatus = "idle" | "loading" | "error" | "success";

export default function ClientDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [accessCode, setAccessCode] = useState("");
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [status, setStatus] = useState<LookupStatus>("idle");
  const [currentSurvey, setCurrentSurvey] = useState<SurveyDetails | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const resetState = useCallback(() => {
    setAccessCode("");
    setLookupError(null);
    setStatus("idle");
    setCurrentSurvey(null);
    setHasSubmitted(false);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("code");
      router.replace(`${url.pathname}${url.search}`, { scroll: false });
    }
  }, [router]);

  const fetchSurvey = useCallback(
    async (code: string) => {
      const normalized = code.trim().toUpperCase();
      if (!normalized) {
        setLookupError("Renseignez un code d'accès.");
        return;
      }

      setStatus("loading");
      setLookupError(null);

      try {
        const response = await fetch(
          `/api/surveys/access-code/${normalized}`
        );
        const data = await response.json();

        if (!response.ok) {
          setStatus("error");
          setLookupError(data.error || "Ce code ne correspond à aucun sondage.");
          setCurrentSurvey(null);
          return;
        }

        setCurrentSurvey(data.survey);
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
          "Impossible de charger ce sondage pour le moment. Réessayez plus tard."
        );
        setCurrentSurvey(null);
      }
    },
    [router]
  );

  useEffect(() => {
    const codeParam = searchParams.get("code");
    if (codeParam) {
      const normalized = codeParam.trim().toUpperCase();
      setAccessCode(normalized);
      fetchSurvey(normalized);
    }
  }, [fetchSurvey, searchParams]);

  const handleSubmitCode = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    fetchSurvey(accessCode);
  };

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          {!currentSurvey ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Participer à un sondage
                </h2>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Entrez le code d&apos;accès partagé par l&apos;organisation ou
                  scannez le QR code depuis votre appareil mobile.
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmitCode}>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white/90">
                    Code d&apos;accès
                  </label>
                  <input
                    value={accessCode}
                    onChange={(event) =>
                      setAccessCode(event.target.value.toUpperCase())
                    }
                    placeholder="Ex: SURV01"
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
                    {status === "loading"
                      ? "Recherche en cours..."
                      : "Trouver le sondage"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetState}
                    disabled={status === "loading" && !lookupError}
                  >
                    Réinitialiser
                  </Button>
                </div>
              </form>

              <div className="rounded-xl bg-gray-50 px-4 py-3 text-xs text-gray-600 dark:bg-white/5 dark:text-gray-300">
                Conseil&nbsp;: Vous pouvez aussi scanner un QR code depuis votre
                mobile pour pré-remplir automatiquement le code.
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                    Répondre au sondage
                  </h2>
                  {hasSubmitted && (
                    <p className="mt-1 text-xs font-medium uppercase text-emerald-600 dark:text-emerald-400">
                      Réponse envoyée — merci pour votre participation.
                    </p>
                  )}
                </div>
                <Button variant="outline" onClick={resetState}>
                  Utiliser un autre code
                </Button>
              </div>

              <SurveyResponseForm
                survey={currentSurvey}
                onSubmitted={() => setHasSubmitted(true)}
              />
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
