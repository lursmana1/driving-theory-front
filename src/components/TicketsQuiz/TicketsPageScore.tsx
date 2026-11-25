"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  examCtaPillBase,
  outlinePillBase,
} from "@/layoutComponents/Header/headerStyles";
import { LineIcon } from "@/components/Icon/LineIcon";

export type PageScore = { total: number; correct: number; wrong: number };

/**
 * Score of the tickets on this page, above the list: answered of total,
 * right, wrong. Rendered from the server on (0 / N), so it never shifts the
 * page.
 */
export function TicketsScoreBar({ total, correct, wrong }: PageScore) {
  const t = useTranslations("Tickets");
  return (
    <div
      className="flex items-center justify-between gap-3 rounded-card border border-line bg-surface px-4 py-2.5 text-sm shadow-card"
      aria-live="polite"
    >
      <span className="font-semibold text-fg">
        {t("scoreAnswered", { done: correct + wrong, total })}
      </span>
      <span className="flex items-center gap-3">
        <span className="flex items-center gap-1 text-success-strong">
          <LineIcon name="check" className="h-4 w-4" />
          <span className="sr-only">{t("scoreCorrect")}</span>
          {correct}
        </span>
        <span className="flex items-center gap-1 text-danger">
          <LineIcon name="x" className="h-4 w-4" />
          <span className="sr-only">{t("scoreWrong")}</span>
          {wrong}
        </span>
      </span>
    </div>
  );
}

type TicketsPageSummaryProps = PageScore & {
  onRetryWrong: () => void;
  /** Next page of the same listing; null on the last page. */
  nextHref: string | null;
};

/** End of a fully answered page: the result, retry the wrong ones, next page. */
export function TicketsPageSummary({
  total,
  correct,
  wrong,
  onRetryWrong,
  nextHref,
}: TicketsPageSummaryProps) {
  const t = useTranslations("Tickets");
  return (
    <section
      role="status"
      className="space-y-4 rounded-panel border border-line bg-surface p-5 text-center shadow-card sm:p-6"
    >
      <p className="text-lg font-bold text-fg">
        {t("summaryResult", { correct, total })}
      </p>
      <p className="text-sm text-fg-muted">
        {wrong === 0
          ? t("summaryPerfect")
          : t("summaryWrong", { count: wrong })}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {wrong > 0 && (
          <button
            type="button"
            onClick={onRetryWrong}
            className={`h-11 gap-2 px-5 text-sm ${outlinePillBase}`}
          >
            <LineIcon name="repeat" className="h-4 w-4" />
            {t("retryWrong")}
          </button>
        )}
        {nextHref && (
          <Link
            href={nextHref}
            className={`inline-flex h-11 items-center gap-2 px-5 text-sm ${examCtaPillBase}`}
          >
            {t("nextPage")}
            <LineIcon name="arrowRight" className="h-4 w-4" />
          </Link>
        )}
      </div>
    </section>
  );
}
