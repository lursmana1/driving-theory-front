"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import SignLinkedText from "@/components/Signs/SignLinkedText";

type QuestionExplanationProps = {
  questionId: string | number;
  questionIndex?: number;
  explanation: string | null | undefined;
  compact?: boolean;
  actions?: React.ReactNode;
};

export default function QuestionExplanation({
  questionId,
  questionIndex,
  explanation,
  compact = false,
  actions,
}: QuestionExplanationProps) {
  const t = useTranslations("Tickets");
  const [showExplanation, setShowExplanation] = useState(false);
  const hasExplanation = !!explanation?.trim();

  return (
    <>
      <div
        className={`flex items-center justify-between rounded-control border border-stage-line bg-stage-deep/40 px-3 py-2 ${compact ? "mb-3" : "mb-4"}`}
      >
        <span className="font-georgian text-sm font-medium text-stage-fg">
          {questionIndex != null ? `${questionIndex}. ` : ""}#{questionId}
        </span>
        <div className="flex items-center gap-2">
          {actions}
          {hasExplanation ? (
            <button
              type="button"
              onClick={() => setShowExplanation((v) => !v)}
              aria-label="Show explanation"
              aria-expanded={showExplanation}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                showExplanation
                  ? "bg-success/80 text-on-accent"
                  : "bg-stage-fg/25 text-stage-fg hover:bg-stage-fg/40"
              }`}
            >
              ?
            </button>
          ) : null}
        </div>
      </div>

      {hasExplanation && showExplanation && (
        <div
          className={`absolute z-20 overflow-hidden rounded-control border border-line bg-surface-muted shadow-overlay ${
            compact
              ? "inset-x-3 top-16 sm:inset-x-4 sm:top-20"
              : "inset-x-4 top-20"
          }`}
        >
          <div className="flex items-center justify-between border-b border-line bg-surface px-5 py-3">
            <h3 className="font-georgian text-base font-bold text-stage-success-strong">
              {t("ticketExplanation")}:
            </h3>
            <button
              type="button"
              onClick={() => setShowExplanation(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-fg-subtle transition hover:bg-surface-strong hover:text-fg-muted"
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
            <p className="font-georgian text-sm leading-relaxed text-fg-muted">
              <SignLinkedText text={explanation ?? ""} />
            </p>
          </div>
        </div>
      )}
    </>
  );
}
