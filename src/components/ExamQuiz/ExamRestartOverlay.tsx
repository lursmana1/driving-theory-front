"use client";

import { useTranslations } from "next-intl";

export default function ExamRestartOverlay() {
  const t = useTranslations("Exam");

  return (
    <div
      className="absolute inset-0 z-100 flex flex-col items-center justify-center bg-stage animate-fade-in"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-stage-fg/30 border-t-stage-fg" />
      <p className="mt-4 font-georgian text-sm text-stage-fg/90">
        {t("loadingNewQuestions")}
      </p>
    </div>
  );
}
