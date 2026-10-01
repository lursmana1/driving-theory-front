"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  getAttemptCategoryLabel,
  type AttemptSummary,
} from "@/api/examAttempts";
import type { Category } from "@/lib/types/category";
import {
  EXAM_HISTORY_PAGE_SIZE,
  EXAM_HISTORY_TABLE_GRID,
} from "@/CONSTS/pagination";
import Pagination from "@/components/Pagination/Pagination";
import { ExamHistoryRow } from "@/components/Profile/ExamHistoryRow";

type ProfileExamHistoryProps = {
  page: number;
  attempts: AttemptSummary[];
  categories: Category[];
  historyTotal: number;
  loading: boolean;
};

export function ProfileExamHistory({
  page,
  attempts,
  categories,
  historyTotal,
  loading,
}: ProfileExamHistoryProps) {
  const locale = useLocale();
  const t = useTranslations("Profile");
  const tExam = useTranslations("Exam");

  const historyLabels = {
    colCategory: t("colCategory"),
    colScore: t("colScore"),
    colDuration: t("colDuration"),
    colResult: t("colResult"),
    passed: t("passed"),
    failed: t("failed"),
    unfinished: t("unfinished"),
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <h2 className="text-base font-bold text-slate-900 sm:text-lg">
          {t("recentTitle")}
        </h2>
        <Link
          href="/subjectpicker"
          className="inline-flex w-full items-center justify-center rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white transition hover:bg-accent-strong sm:w-auto sm:py-1.5 sm:text-sm"
        >
          {tExam("startNew")}
        </Link>
      </div>

      <div
        className={`hidden border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-medium text-slate-500 ${EXAM_HISTORY_TABLE_GRID}`}
      >
        <span>{t("colDate")}</span>
        <span>{t("colCategory")}</span>
        <span className="text-right whitespace-nowrap">{t("colScore")}</span>
        <span className="text-right whitespace-nowrap">{t("colDuration")}</span>
        <span className="text-right whitespace-nowrap">{t("colResult")}</span>
      </div>

      <ul>
        {loading ? (
          <li className="px-4 py-12 text-center text-slate-400 sm:px-5">
            {t("loading")}
          </li>
        ) : attempts.length === 0 ? (
          <li className="px-4 py-12 text-center text-slate-500 sm:px-5">
            {tExam("historyEmpty")}
          </li>
        ) : (
          attempts.map((attempt) => (
            <ExamHistoryRow
              key={attempt.id}
              attempt={attempt}
              locale={locale}
              categoryLabel={getAttemptCategoryLabel(attempt, categories)}
              labels={historyLabels}
            />
          ))
        )}
      </ul>

      {!loading && historyTotal > EXAM_HISTORY_PAGE_SIZE && (
        <div className="border-t border-slate-100 bg-slate-50/50">
          <div className={`hidden px-5 py-3 ${EXAM_HISTORY_TABLE_GRID}`}>
            <Pagination
              page={page}
              total={historyTotal}
              pathname="/profile"
              pageSize={EXAM_HISTORY_PAGE_SIZE}
              layout="table"
            />
          </div>
          <div className="px-4 py-4 md:hidden">
            <Pagination
              page={page}
              total={historyTotal}
              pathname="/profile"
              pageSize={EXAM_HISTORY_PAGE_SIZE}
            />
          </div>
        </div>
      )}
    </section>
  );
}
