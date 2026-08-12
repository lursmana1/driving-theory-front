"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type QuestionExplanationProps = {
  questionId: string | number;
  questionIndex?: number;
  explanation: string | null | undefined;
  compact?: boolean;
};

export default function QuestionExplanation({
  questionId,
  questionIndex,
  explanation,
  compact = false,
}: QuestionExplanationProps) {
  const t = useTranslations("Tickets");
  const [showExplanation, setShowExplanation] = useState(false);
  const hasExplanation = !!explanation?.trim();

  return (
    <>
      <div
        className={`flex items-center justify-between ${compact ? "mb-3" : "mb-3 sm:mb-4"}`}
      >
        <span className="font-georgian text-sm font-medium text-white">
          {questionIndex != null ? `${questionIndex}. ` : ""}#{questionId}
        </span>
        {hasExplanation ? (
          <button
            type="button"
            onClick={() => setShowExplanation((v) => !v)}
            aria-label="Show explanation"
            aria-expanded={showExplanation}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
              showExplanation
                ? "bg-emerald-500/80 text-white"
                : "bg-white/25 text-white hover:bg-white/40"
            }`}
          >
            ?
          </button>
        ) : (
          <span className="h-8 w-8" />
        )}
      </div>

      {hasExplanation && showExplanation && (
        <div
          className={`absolute z-20 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-2xl ${
            compact
              ? "inset-x-3 top-16 sm:inset-x-4 sm:top-20"
              : "inset-x-4 top-20"
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3">
            <h3 className="font-georgian text-base font-bold text-emerald-700">
              {t("ticketExplanation")}:
            </h3>
            <button
              type="button"
              onClick={() => setShowExplanation(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div
            className={`overflow-y-auto p-5 ${
              compact ? "max-h-56 sm:max-h-64" : "max-h-72"
            }`}
          >
            <p className="font-georgian text-sm leading-relaxed text-slate-700">
              {explanation}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
