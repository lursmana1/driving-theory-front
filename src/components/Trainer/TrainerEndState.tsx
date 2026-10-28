"use client";

import { useLocale, useTranslations } from "next-intl";
import { formatDate } from "@/utills/helpers/formatDate";
import { Link } from "@/i18n/navigation";
import {
  examCtaPillBase,
  outlinePillBase,
} from "@/layoutComponents/Header/headerStyles";
import type { TrainerSummary } from "@/lib/types/trainer";
import type { TrainerSessionTotals } from "@/utills/helpers/hooks/useTrainerSession";

const primaryClass = `inline-flex h-11 items-center px-5 text-sm ${examCtaPillBase}`;
const secondaryClass = `h-11 px-5 ${outlinePillBase}`;

type TrainerEndStateProps = { categoryId: number } & (
  | { kind: "empty"; summary: TrainerSummary | null }
  | { kind: "done"; totals: TrainerSessionTotals; onAgain: () => void }
);

/** No mistakes to drill, or the end of a batch. */
export function TrainerEndState(props: TrainerEndStateProps) {
  const t = useTranslations("Trainer");
  const locale = useLocale();
  const { categoryId } = props;

  let title: string;
  let text: string;
  let actions: React.ReactNode;
  if (props.kind === "empty") {
    const next = props.summary?.nextDueAt;
    title = t("emptyTitle");
    text = next
      ? t("emptyNextDue", { date: formatDate(next, locale, "D MMMM") })
      : t("emptyBody");
    actions = (
      <>
        <Link href={`/exam?category=${categoryId}`} className={primaryClass}>
          {t("toExam")}
        </Link>
        <Link href={`/tickets/${categoryId}`} className={secondaryClass}>
          {t("toTickets")}
        </Link>
      </>
    );
  } else {
    const { totals } = props;
    title = t("doneTitle");
    text = t("doneStats", {
      answered: totals.answered,
      correct: totals.correct,
      cleared: totals.cleared,
    });
    if (totals.skipped > 0) {
      text += ` ${t("doneSkipped", { count: totals.skipped })}`;
    }
    actions = (
      <>
        <button type="button" onClick={props.onAgain} className={primaryClass}>
          {t("again")}
        </button>
        <Link href={`/profile?category=${categoryId}`} className={secondaryClass}>
          {t("backToProfile")}
        </Link>
      </>
    );
  }

  return (
    <div className="space-y-4 rounded-card border border-line bg-surface p-6 text-center shadow-card">
      <h2 className="text-lg font-bold text-fg">{title}</h2>
      <p className="text-sm text-fg-muted">{text}</p>
      <div className="flex flex-wrap justify-center gap-3">{actions}</div>
    </div>
  );
}
