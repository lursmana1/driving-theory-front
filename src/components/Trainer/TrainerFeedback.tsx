"use client";

import { useLocale, useTranslations } from "next-intl";
import { formatDayMonthOn } from "@/utills/helpers/formatDate";
import type { TrainerResult } from "@/utills/helpers/hooks/useTrainerSession";

type TrainerFeedbackProps = {
  /** Server reply for the picked answer; undefined while it is saving. */
  result: TrainerResult | undefined;
  /** Saving the answer failed. */
  failed: boolean;
  onRetry: () => void;
};

/** What this answer did to the question's review schedule. */
export function TrainerFeedback({
  result,
  failed,
  onRetry,
}: TrainerFeedbackProps) {
  const t = useTranslations("Trainer");
  const locale = useLocale();

  if (failed) {
    return (
      <p role="alert" className="text-sm font-medium text-danger">
        {t("saveFailed")}{" "}
        <button
          type="button"
          onClick={onRetry}
          className="font-semibold underline underline-offset-2"
        >
          {t("retry")}
        </button>
      </p>
    );
  }
  if (!result) {
    return <p className="text-sm text-fg-subtle">{t("saving")}</p>;
  }

  const { before, response } = result;
  const progress = response.progress;
  // dayjs, not Intl: browsers without Georgian ICU data print "October 28"
  const date = progress?.dueAt ? formatDayMonthOn(progress.dueAt, locale) : "";

  let tone = "text-success-strong";
  let message: string;
  if (response.correct !== true) {
    tone = "text-danger";
    message = t("feedbackWrong");
  } else if (progress?.status === "cleared") {
    message = t("feedbackCleared");
  } else if (before.due && progress?.status === "mistake") {
    message = t("feedbackAdvanced", { date, left: progress.reviewsLeft });
  } else {
    tone = "text-fg-muted";
    message = t("feedbackEarly", { date });
  }

  return (
    <p role="status" className={`text-sm font-medium ${tone}`}>
      {message}
    </p>
  );
}
