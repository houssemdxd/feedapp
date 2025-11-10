/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { FormEvent, useMemo, useState } from "react";
import Button from "@/components/ui/button/Button";

type SurveyQuestion = {
  id: string;
  label: string;
  type: "text" | "textarea" | "radio" | "checkbox" | "rating";
  required?: boolean;
  options?: string[];
  max?: number;
};

export type SurveyDetails = {
  id: string;
  title: string;
  description?: string;
  accessCode: string;
  questions: SurveyQuestion[];
};

type SurveyResponseFormProps = {
  survey: SurveyDetails;
  onSubmitted?: () => void;
};

type AnswerValue = string | string[] | number | null;

function isEmpty(value: AnswerValue) {
  if (value === null || value === undefined) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "string") return value.trim().length === 0;
  return false;
}

export default function SurveyResponseForm({
  survey,
  onSubmitted,
}: SurveyResponseFormProps) {
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const questionMap = useMemo(() => {
    const map = new Map<string, SurveyQuestion>();
    survey.questions.forEach((question) => {
      map.set(question.id, question);
    });
    return map;
  }, [survey.questions]);

  const handleChange = (question: SurveyQuestion, value: AnswerValue) => {
    setAnswers((prev) => ({
      ...prev,
      [question.id]: value,
    }));
  };

  const handleCheckboxChange = (
    question: SurveyQuestion,
    option: string,
    checked: boolean
  ) => {
    setAnswers((prev) => {
      const current = Array.isArray(prev[question.id])
        ? (prev[question.id] as string[])
        : [];
      if (checked) {
        return {
          ...prev,
          [question.id]: Array.from(new Set([...current, option])),
        };
      }
      return {
        ...prev,
        [question.id]: current.filter((value) => value !== option),
      };
    });
  };

  const validate = () => {
    for (const question of survey.questions) {
      const value = answers[question.id];
      if (question.required !== false && isEmpty(value)) {
        return `Merci de compléter la question "${question.label}".`;
      }
    }
    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/surveys/${survey.id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: Array.from(questionMap.values()).map((question) => ({
            questionId: question.id,
            value: answers[question.id] ?? null,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Impossible d'enregistrer votre réponse.");
        return;
      }

      setSuccess(true);
      setAnswers({});
      if (onSubmitted) {
        onSubmitted();
      }
    } catch (submissionError: any) {
      console.error("Survey submission failed:", submissionError);
      setError("Une erreur inattendue est survenue. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          {survey.title}
        </h2>
        {survey.description && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {survey.description}
          </p>
        )}
        <p className="mt-2 text-xs font-medium uppercase tracking-wide text-brand-600 dark:text-brand-400">
          Code d&apos;accès&nbsp;: {survey.accessCode}
        </p>
      </div>

      {survey.questions.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-5 text-sm text-gray-600 shadow dark:border-gray-700 dark:bg-white/5 dark:text-gray-300">
          Ce sondage ne contient pas de questions configurées pour le moment.
        </div>
      ) : (
        <div className="space-y-5">
          {survey.questions.map((question) => (
            <div
              key={question.id}
              className="rounded-xl border border-gray-200 bg-white px-4 py-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.05]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {question.label}
                    {question.required !== false && (
                      <span className="ml-1 text-error-500">*</span>
                    )}
                  </p>
                </div>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs uppercase text-gray-500 dark:bg-white/10 dark:text-gray-400">
                  {question.type}
                </span>
              </div>

              {question.type === "text" && (
                <input
                  type="text"
                  value={(answers[question.id] as string) ?? ""}
                  onChange={(event) =>
                    handleChange(question, event.target.value)
                  }
                  className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-white/[0.08] dark:text-white"
                  placeholder="Votre réponse..."
                />
              )}

              {question.type === "textarea" && (
                <textarea
                  rows={4}
                  value={(answers[question.id] as string) ?? ""}
                  onChange={(event) =>
                    handleChange(question, event.target.value)
                  }
                  className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-white/[0.08] dark:text-white"
                  placeholder="Décrivez votre expérience..."
                />
              )}

              {question.type === "radio" && (
                <div className="mt-3 space-y-3">
                  {(question.options ?? []).map((option) => (
                    <label
                      key={`${question.id}-${option}`}
                      className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200"
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={() => handleChange(question, option)}
                        className="h-4 w-4 border-gray-300 text-brand-500 focus:ring-brand-500"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === "checkbox" && (
                <div className="mt-3 space-y-3">
                  {(question.options ?? []).map((option) => {
                    const checked = Array.isArray(answers[question.id])
                      ? (answers[question.id] as string[]).includes(option)
                      : false;
                    return (
                      <label
                        key={`${question.id}-${option}`}
                        className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) =>
                            handleCheckboxChange(
                              question,
                              option,
                              event.target.checked
                            )
                          }
                          className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                        />
                        <span>{option}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {question.type === "rating" && (
                <div className="mt-4 flex flex-col gap-2">
                  <input
                    type="range"
                    min={1}
                    max={question.max ?? 5}
                    value={
                      typeof answers[question.id] === "number"
                        ? (answers[question.id] as number)
                        : (question.max ?? 5)
                    }
                    onChange={(event) =>
                      handleChange(question, Number(event.target.value))
                    }
                    className="w-full accent-brand-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>1</span>
                    <span>{question.max ?? 5}</span>
                  </div>
                  <div className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                    Score&nbsp;:{" "}
                    {typeof answers[question.id] === "number"
                      ? answers[question.id]
                      : question.max ?? 5}
                    /{question.max ?? 5}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          Merci pour votre participation ! Vos réponses ont bien été enregistrées.
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting || survey.questions.length === 0}>
          {submitting ? "Envoi en cours..." : "Envoyer mes réponses"}
        </Button>
      </div>
    </form>
  );
}

