"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/contexts/UserContext";
import { getCategories } from "@/api/categories";
import {
  getAttemptCategoryLabel,
  getAttemptsHistory,
  type AttemptSummary,
} from "@/api/examAttempts";
import type { Category } from "@/lib/types/category";
import {
  EXAM_HISTORY_PAGE_SIZE,
  EXAM_HISTORY_TABLE_GRID,
  PAGE_PARAM,
} from "@/CONSTS/pagination";
import { subscribeStatsRefresh } from "@/lib/statsRefresh";
import Pagination from "@/components/Pagination/Pagination";
import { ExamHistoryRow } from "@/components/Profile/ExamHistoryRow";
import { EMPTY_ATTEMPTS_PAGE } from "@/components/Profile/profileUtils";

export function ProfileExamHistory() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("Profile");
  const tExam = useTranslations("Exam");

  const page = Math.max(
    1,
    parseInt(searchParams.get(PAGE_PARAM) ?? "1", 10) || 1,
  );

  const [attempts, setAttempts] = useState<AttemptSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    const [cats, history] = await Promise.all([
      getCategories().catch(() => [] as Category[]),
      getAttemptsHistory(page, EXAM_HISTORY_PAGE_SIZE).catch(
        () => EMPTY_ATTEMPTS_PAGE,
      ),
    ]);

    setCategories(cats);
    setAttempts(history.data);
    setHistoryTotal(history.counts?.total ?? history.total);
    setLoading(false);
  }, [user, page]);

  useEffect(() => {
    if (!user) return;
    loadHistory();
    return subscribeStatsRefresh(loadHistory);
  }, [user, loadHistory]);

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
          className="inline-flex w-full items-center justify-center rounded-lg bg-linear-to-r from-sky-500 to-violet-600 px-3 py-2 text-xs font-semibold text-white transition hover:brightness-110 sm:w-auto sm:py-1.5 sm:text-sm"
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
            <Suspense fallback={null}>
              <Pagination
                page={page}
                total={historyTotal}
                pathname="/profile"
                pageSize={EXAM_HISTORY_PAGE_SIZE}
                layout="table"
              />
            </Suspense>
          </div>
          <div className="px-4 py-4 md:hidden">
            <Suspense fallback={null}>
              <Pagination
                page={page}
                total={historyTotal}
                pathname="/profile"
                pageSize={EXAM_HISTORY_PAGE_SIZE}
              />
            </Suspense>
          </div>
        </div>
      )}
    </section>
  );
}
