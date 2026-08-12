"use client";

import dynamic from "next/dynamic";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/contexts/UserContext";
import { getCategories } from "@/api/categories";
import {
  getAttemptCategoryLabel,
  getAttemptsHistory,
  type AttemptSummary,
} from "@/api/examAttempts";
import type { Category } from "@/lib/types/category";
import { DEFAULT_CATEGORY_ID } from "@/CONSTS/categories";
import {
  EXAM_HISTORY_PAGE_SIZE,
  EXAM_HISTORY_TABLE_GRID,
  PAGE_PARAM,
} from "@/CONSTS/pagination";
import { subscribeStatsRefresh } from "@/lib/statsRefresh";
import Pagination from "@/components/Pagination/Pagination";
import { ExamHistoryRow } from "@/components/Profile/ExamHistoryRow";
import { ProfileOverviewSkeleton } from "@/components/Profile/ProfileOverviewSkeleton";
import {
  computeAttemptStats,
  EMPTY_ATTEMPTS_PAGE,
  profileInitials,
} from "@/components/Profile/profileUtils";

const ProfileOverviewSection = dynamic(
  () => import("@/components/Profile/ProfileOverviewSection"),
  { loading: () => <ProfileOverviewSkeleton /> },
);

export default function ProfileClient() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("Profile");
  const tExam = useTranslations("Exam");

  const page = Math.max(
    1,
    parseInt(searchParams.get(PAGE_PARAM) ?? "1", 10) || 1,
  );
  const readinessCategoryId = Math.max(
    0,
    parseInt(searchParams.get("category") ?? String(DEFAULT_CATEGORY_ID), 10) ||
      DEFAULT_CATEGORY_ID,
  );

  const [attempts, setAttempts] = useState<AttemptSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  /** All-categories total from GET /exam-attempts — includes unfinished */
  const [historyTotal, setHistoryTotal] = useState(0);
  const [stats, setStats] = useState({
    passed: 0,
    failed: 0,
    unfinished: 0,
    passRate: 0,
  });
  const [historyStatsLoading, setHistoryStatsLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    if (!user) return;

    setHistoryLoading(true);
    setHistoryStatsLoading(true);

    const [cats, history, statsHistory] = await Promise.all([
      getCategories().catch(() => [] as Category[]),
      getAttemptsHistory(page, EXAM_HISTORY_PAGE_SIZE).catch(
        () => EMPTY_ATTEMPTS_PAGE,
      ),
      getAttemptsHistory(1, 100).catch(() => EMPTY_ATTEMPTS_PAGE),
    ]);

    setCategories(cats);
    setAttempts(history.data);
    setHistoryTotal(history.total);
    setStats(computeAttemptStats(statsHistory.data));
    setHistoryLoading(false);
    setHistoryStatsLoading(false);
  }, [user, page]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    loadProfile();
    return subscribeStatsRefresh(loadProfile);
  }, [user, loadProfile]);

  if (!authLoading && !user) {
    return null;
  }

  const displayName = user
    ? [user.name, user.surname].filter(Boolean).join(" ") || user.email
    : "";
  const initials = user
    ? profileInitials(displayName) || user.email[0]?.toUpperCase()
    : "";
  const email = user?.email ?? "";

  const historyLabels = {
    colCategory: t("colCategory"),
    colScore: t("colScore"),
    colDuration: t("colDuration"),
    colResult: t("colResult"),
    passed: t("passed"),
    failed: t("failed"),
    unfinished: t("unfinished"),
  };

  const statTiles = [
    { label: t("statTotal"), value: historyTotal, tone: "text-slate-900" },
    { label: t("statPassed"), value: stats.passed, tone: "text-emerald-600" },
    { label: t("statFailed"), value: stats.failed, tone: "text-rose-600" },
    {
      label: t("statUnfinished"),
      value: stats.unfinished,
      tone: "text-amber-600",
    },
    {
      label: t("statPassRate"),
      value: `${stats.passRate}%`,
      tone: "text-sky-600",
    },
  ];

  return (
    <main className="section space-y-6 py-6 font-georgian sm:space-y-8 sm:py-8">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">
        <div className="h-20 bg-linear-to-r from-sky-500 to-violet-600 sm:h-24" />
        <div className="flex flex-col gap-4 px-4 pb-5 sm:px-6 sm:pb-6 md:flex-row md:items-end md:justify-between">
          <div className="flex items-end gap-3 sm:gap-4">
            <div className="-mt-8 flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-4 border-white bg-slate-800 text-xl font-bold text-white shadow-md sm:-mt-10 sm:h-20 sm:w-20 sm:rounded-2xl sm:text-2xl">
              {authLoading ? (
                <span className="h-6 w-6 animate-pulse rounded-full bg-slate-600" />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0 pb-1">
              {authLoading ? (
                <div className="space-y-2">
                  <div className="h-6 w-32 animate-pulse rounded bg-slate-200 sm:h-7 sm:w-40" />
                  <div className="h-4 w-44 animate-pulse rounded bg-slate-100" />
                </div>
              ) : (
                <>
                  <h1 className="truncate text-lg font-bold text-slate-900 sm:text-2xl">
                    {displayName}
                  </h1>
                  <p className="truncate text-sm text-slate-500">{email}</p>
                </>
              )}
            </div>
          </div>
          {!authLoading && (
            <Link
              href="/auth/logout"
              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 sm:w-auto"
            >
              {t("logout")}
            </Link>
          )}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 sm:gap-4">
        {statTiles.map((tile) => (
          <div
            key={tile.label}
            className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm sm:rounded-2xl sm:p-4"
          >
            <p className={`text-xl font-bold sm:text-3xl ${tile.tone}`}>
              {historyStatsLoading || authLoading ? "—" : tile.value}
            </p>
            <p className="mt-1 text-[11px] leading-tight text-slate-500 sm:text-sm">
              {tile.label}
            </p>
          </div>
        ))}
      </section>

      <ProfileOverviewSection
        defaultCategoryId={readinessCategoryId}
        categories={categories}
      />

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
          {historyLoading ? (
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

        {!historyLoading && historyTotal > EXAM_HISTORY_PAGE_SIZE && (
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
    </main>
  );
}
