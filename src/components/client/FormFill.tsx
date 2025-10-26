"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Question = {
  id: string;
  question: string;
  type: string; // input | radio | checkbox | textarea | rating | slider | color | toggle | time | email | number | text | image
  elements: string[];
};

type FormDataPayload = {
  form: { id: string; title: string; type?: string };
  questions: Question[];
};

export default function FormFill({ formId }: { formId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<FormDataPayload | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/forms/${formId}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load form");
        const json = (await res.json()) as FormDataPayload;
        setData(json);
        // init answers
        const init: Record<string, string | string[]> = {};
        json.questions.forEach((q) => {
          switch (q.type) {
            case "checkbox":
              init[q.id] = [];
              break;
            case "slider": {
              const min = Number(q.elements?.[0] ?? 0);
              init[q.id] = String(isNaN(min) ? 0 : min);
              break;
            }
            case "rating": {
              // default 0; elements[0]=max (e.g., 5)
              init[q.id] = "0";
              break;
            }
            case "color": {
              init[q.id] = q.elements?.[0] || "#000000";
              break;
            }
            case "toggle": {
              init[q.id] = "false"; // stringified boolean
              break;
            }
            case "number": {
              // default empty to force user input unless a default provided
              init[q.id] = q.elements?.[0] ?? ""; // could be min or default
              break;
            }
            case "time":
            case "email":
            case "textarea":
            case "input":
            case "radio":
            default:
              init[q.id] = "";
          }
        });
        setAnswers(init);
        // Check duplicate submission for current user
        try {
          const meRes = await fetch(`/api/forms/${formId}/responses/me`, { cache: "no-store" });
          if (meRes.ok) {
            const me = await meRes.json();
            if (me?.submitted) setAlreadySubmitted(true);
          }
        } catch {}
      } catch (e: any) {
        setError(e?.message || "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [formId]);

  const onChange = (q: Question, value: string, checked?: boolean) => {
    setAnswers((prev) => {
      const next = { ...prev };
      if (q.type === "checkbox") {
        const arr = Array.isArray(next[q.id]) ? (next[q.id] as string[]) : [];
        if (checked) next[q.id] = [...arr, value];
        else next[q.id] = arr.filter((v) => v !== value);
      } else {
        next[q.id] = value;
      }
      return next;
    });
  };

  const canSubmit = useMemo(() => {
    if (!data) return false;
    return data.questions.every((q) => {
      const v = answers[q.id];
      // Static informational types are never required
      if (q.type === "text" || q.type === "image") return true;
      if (q.type === "checkbox") return Array.isArray(v) && (v as string[]).length > 0; // au moins un choix
      if (q.type === "radio") return typeof v === "string" && (v as string).length > 0; // un choix
      if (q.type === "slider") return typeof v === "string" && (v as string).length > 0; // valeur choisie
      if (q.type === "rating") return typeof v === "string" && (v as string).length > 0; // valeur numérique
      if (q.type === "toggle") return typeof v === "string" && (v as string).length > 0; // true/false
      if (q.type === "number") return typeof v === "string" && (v as string).toString().length > 0;
      if (q.type === "email") return typeof v === "string" && /.+@.+\..+/.test(v as string);
      if (q.type === "time") return typeof v === "string" && (v as string).length > 0;
      if (q.type === "color") return typeof v === "string" && /^#([0-9a-fA-F]{3}){1,2}$/.test(v as string);
      // textarea, input
      return typeof v === "string" && (v as string).trim().length > 0; // non vide
    });
  }, [data, answers]);

  const handleSubmit = async () => {
    if (!data) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/forms/${data.form.id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          setAlreadySubmitted(true);
          return;
        }
        throw new Error(json?.error || "Submission failed");
      }
      setSubmitted(true);
      // Optionally navigate back after a delay
      setTimeout(() => router.back(), 800);
    } catch (e: any) {
      setError(e?.message || "Erreur d'envoi");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Chargement…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!data) return null;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-semibold">{data.form.title}</h1>

      {alreadySubmitted && (
        <div className="p-4 border rounded bg-yellow-50 text-yellow-800">
          Vous avez déjà répondu à ce formulaire. Vous ne pouvez pas le soumettre à nouveau.
        </div>
      )}

      <div className="space-y-6">
        {data.questions.map((q) => (
          <div key={q.id} className="space-y-2">
            <div className="font-medium text-gray-900 dark:text-gray-100">{q.question}</div>
            {q.type === "input" && (
              <input
                type="text"
                value={(answers[q.id] as string) || ""}
                onChange={(e) => onChange(q, e.target.value)}
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Votre réponse"
              />
            )}
            {q.type === "radio" && (
              <div className="flex flex-wrap gap-3">
                {q.elements.map((opt) => (
                  <label key={opt} className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name={q.id}
                      checked={answers[q.id] === opt}
                      onChange={() => onChange(q, opt)}
                    />
                    <span className="text-gray-900 dark:text-gray-100">{opt}</span>
                  </label>
                ))}
              </div>
            )}
            {q.type === "textarea" && (
              <textarea
                value={(answers[q.id] as string) || ""}
                onChange={(e) => onChange(q, e.target.value)}
                className="w-full min-h-28 border rounded px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Votre réponse"
              />
            )}
            {q.type === "slider" && (
              <div className="flex items-center gap-3">
                {(() => {
                  const min = Number(q.elements?.[0] ?? 0);
                  const max = Number(q.elements?.[1] ?? 10);
                  const step = Number(q.elements?.[2] ?? 1);
                  const safeMin = isNaN(min) ? 0 : min;
                  const safeMax = isNaN(max) ? 10 : max;
                  const safeStep = isNaN(step) ? 1 : step;
                  const val = String(answers[q.id] ?? safeMin);
                  return (
                    <>
                      <input
                        type="range"
                        min={safeMin}
                        max={safeMax}
                        step={safeStep}
                        value={val}
                        onChange={(e) => onChange(q, e.target.value)}
                        className="w-full"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 w-12 text-right">{val}</span>
                    </>
                  );
                })()}
              </div>
            )}
            {q.type === "rating" && (
              <div className="flex items-center gap-2">
                {(() => {
                  const max = Number(q.elements?.[0] ?? 5);
                  const safeMax = isNaN(max) ? 5 : max;
                  const value = Number(answers[q.id] || 0);
                  return (
                    <div className="flex gap-1">
                      {Array.from({ length: safeMax }).map((_, i) => {
                        const idx = i + 1;
                        const filled = idx <= value;
                        return (
                          <button
                            key={idx}
                            type="button"
                            className={`text-xl ${filled ? "text-yellow-500" : "text-gray-300"}`}
                            onClick={() => onChange(q, String(idx))}
                            aria-label={`Rate ${idx}`}
                          >
                            ★
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}
            {q.type === "color" && (
              <input
                type="color"
                value={(answers[q.id] as string) || "#000000"}
                onChange={(e) => onChange(q, e.target.value)}
                className="h-10 w-16 p-1 bg-transparent border border-gray-300 dark:border-gray-700 rounded"
              />
            )}
            {q.type === "toggle" && (
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={(answers[q.id] as string) === "true"}
                  onChange={(e) => onChange(q, e.target.checked ? "true" : "false")}
                  className="sr-only"
                />
                <span className={`relative inline-block h-6 w-11 rounded-full transition-colors ${ (answers[q.id] as string) === "true" ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600" }`}>
                  <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${ (answers[q.id] as string) === "true" ? "translate-x-5" : "translate-x-0" }`} />
                </span>
                <span className="text-sm text-gray-700 dark:text-gray-300">{(answers[q.id] as string) === "true" ? "On" : "Off"}</span>
              </label>
            )}
            {q.type === "time" && (
              <input
                type="time"
                value={(answers[q.id] as string) || ""}
                onChange={(e) => onChange(q, e.target.value)}
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            )}
            {q.type === "email" && (
              <input
                type="email"
                value={(answers[q.id] as string) || ""}
                onChange={(e) => onChange(q, e.target.value)}
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="email@example.com"
              />
            )}
            {q.type === "number" && (
              <input
                type="number"
                value={(answers[q.id] as string) || ""}
                onChange={(e) => onChange(q, e.target.value)}
                min={Number.isNaN(Number(q.elements?.[0])) ? undefined : Number(q.elements?.[0])}
                max={Number.isNaN(Number(q.elements?.[1])) ? undefined : Number(q.elements?.[1])}
                step={Number.isNaN(Number(q.elements?.[2])) ? undefined : Number(q.elements?.[2])}
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Entrez un nombre"
              />
            )}
            {(q.type === "text" || q.type === "tr_text") && (
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {q.elements?.[0] || ""}
              </div>
            )}
            {q.type === "image" && q.elements?.[0] && (
              <img src={q.elements[0]} alt="image" className="max-h-48 rounded border border-gray-200 dark:border-gray-700" />
            )}
            {q.type === "checkbox" && (
              <div className="flex flex-wrap gap-3">
                {q.elements.map((opt) => (
                  <label key={opt} className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={Array.isArray(answers[q.id]) && (answers[q.id] as string[]).includes(opt)}
                      onChange={(e) => onChange(q, opt, e.target.checked)}
                    />
                    <span className="text-gray-900 dark:text-gray-100">{opt}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {!!error && <div className="text-red-600">{error}</div>}
      {submitted && <div className="text-green-600">Réponses envoyées, merci.</div>}

      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || submitting || alreadySubmitted}
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
        >
          {submitting ? "Envoi…" : "Soumettre"}
        </button>
        <button onClick={() => router.back()} className="px-4 py-2 rounded border border-gray-300 dark:border-gray-700">
          Annuler
        </button>
      </div>
    </div>
  );
}
