"use client";

import { Suspense, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/contexts/UserContext";
import { getCategories } from "@/api/categories";
import {
  getAttemptsHistory,
  type AttemptSummary,
} from "@/api/examAttempts";
import type { Category } from "@/lib/types/category";
import { DEFAULT_CATEGORY_ID } from "@/CONSTS/categories";
import ProfileOverviewSection from "@/components/Profile/ProfileOverviewSection";
import {
  EXAM_HISTORY_PAGE_SIZE,
  EXAM_HISTORY_TABLE_GRID,
  PAGE_PARAM,
} from "@/CONSTS/pagination";
import { formatAttemptDateTime } from "@/utills/helpers/formatDate";
import { subscribeStatsRefresh } from "@/lib/statsRefresh";
import Pagination from "@/components/Pagination/Pagination";

function formatDuration(seconds: number | null): string {
  if (seconds == null) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function computeStats(attempts: AttemptSummary[]) {
  const passed = attempts.filter((a) => a.passed === true).length;
  const failed = attempts.filter((a) => a.passed === false).length;
  const unfinished = attempts.filter((a) => a.passed == null).length;
  const decided = passed + failed;
  const passRate = decided > 0 ? Math.round((passed / decided) * 100) : 0;
  return { passed, failed, unfinished, passRate };
}

function getAttemptCategoryLabel(
  attempt: AttemptSummary,
  categoryById: Map<number, string>,
): string {
  const categoryId = attempt.categories?.[0];
  if (categoryId == null) return "—";
  return categoryById.get(categoryId) ?? `#${categoryId}`;
}

function ExamHistoryRow({
  attempt,
  locale,
  categoryLabel,
  t,
}: {
  attempt: AttemptSummary;
  locale: string;
  categoryLabel: string;
  t: (key: string) => string;
}) {
  const resultLabel =
    attempt.passed === true
      ? t("passed")
      : attempt.passed === false
        ? t("failed")
        : t("unfinished");
  const resultClass =
    attempt.passed === true
      ? "text-emerald-600"
      : attempt.passed === false
        ? "text-rose-600"
        : "text-amber-600";

  return (
    <li className="border-b border-slate-100 last:border-b-0">
      {/* Mobile: stacked card */}
      <div className="space-y-2 px-4 py-4 md:hidden">
        <time
          dateTime={attempt.completedAt ?? attempt.createdAt}
          className="block text-sm font-medium text-slate-800"
        >
          {formatAttemptDateTime(attempt, locale)}
        </time>
        <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
          <div>
            <dt className="text-slate-500">{t("colCategory")}</dt>
            <dd className="font-semibold text-slate-900">{categoryLabel}</dd>
          </div>
          <div>
            <dt className="text-slate-500">{t("colScore")}</dt>
            <dd className="font-semibold text-slate-900">
              {attempt.correctCount}/{attempt.questionCount}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">{t("colDuration")}</dt>
            <dd className="font-medium text-slate-700">
              {formatDuration(attempt.durationSeconds)}
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-slate-500">{t("colResult")}</dt>
            <dd className={`font-semibold ${resultClass}`}>{resultLabel}</dd>
          </div>
        </dl>
      </div>

      {/* Desktop: table row */}
      <div className={`hidden px-5 py-3.5 text-sm ${EXAM_HISTORY_TABLE_GRID}`}>
        <time dateTime={attempt.completedAt ?? attempt.createdAt} className="text-slate-700">
          {formatAttemptDateTime(attempt, locale)}
        </time>
        <span className="font-semibold text-slate-800">{categoryLabel}</span>
        <span className="text-right font-medium tabular-nums text-slate-900">
          {attempt.correctCount}/{attempt.questionCount}
        </span>
        <span className="text-right tabular-nums text-slate-600 whitespace-nowrap">
          {formatDuration(attempt.durationSeconds)}
        </span>
        <span className={`text-right font-medium whitespace-nowrap ${resultClass}`}>
          {resultLabel}
        </span>
      </div>
    </li>
  );
}

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
  /** All-categories total from GET /exam-attempts — includes unfinished; not comparable to per-category completedAttemptsTotal */
  const [historyTotal, setHistoryTotal] = useState(0);
  const [stats, setStats] = useState({
    passed: 0,
    failed: 0,
    unfinished: 0,
    passRate: 0,
  });
  const [historyStatsLoading, setHistoryStatsLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    let active = true;

    const loadStats = async () => {
      setHistoryStatsLoading(true);
      // Global exam counts: all categories, passed + failed + unfinished (answered attempts)
      const statsHistory = await getAttemptsHistory(1, 100).catch(() => ({
        data: [],
        total: 0,
        page: 1,
        totalPages: 1,
      }));
      if (!active) return;
      setHistoryTotal(statsHistory.total);
      setStats(computeStats(statsHistory.data));
      setHistoryStatsLoading(false);
    };

    loadStats();
    const unsubscribe = subscribeStatsRefresh(() => {
      if (active) loadStats();
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let active = true;

    const loadHistory = async () => {
      setHistoryLoading(true);
      const history = await getAttemptsHistory(
        page,
        EXAM_HISTORY_PAGE_SIZE,
      ).catch(() => ({
        data: [],
        total: 0,
        page: 1,
        totalPages: 1,
      }));
      if (!active) return;
      setAttempts(history.data);
      setHistoryTotal(history.total);
      setHistoryLoading(false);
    };

    loadHistory();
    const unsubscribe = subscribeStatsRefresh(() => {
      if (active) loadHistory();
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [user, page]);

  if (authLoading || !user) {
    return (
      <main className="section py-16">
        <div className="flex items-center justify-center text-slate-500">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
          <span className="ml-3">{t("loading")}</span>
        </div>
      </main>
    );
  }

  const displayName =
    [user.name, user.surname].filter(Boolean).join(" ") || user.email;
  const initials = initialsOf(displayName) || user.email[0]?.toUpperCase();

  const categoryById = new Map(categories.map((c) => [c.id, c.name]));

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
      {/* Identity header */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">
        <div className="h-20 bg-linear-to-r from-sky-500 to-violet-600 sm:h-24" />
        <div className="flex flex-col gap-4 px-4 pb-5 sm:px-6 sm:pb-6 md:flex-row md:items-end md:justify-between">
          <div className="flex items-end gap-3 sm:gap-4">
            <div className="-mt-8 flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-4 border-white bg-slate-800 text-xl font-bold text-white shadow-md sm:-mt-10 sm:h-20 sm:w-20 sm:rounded-2xl sm:text-2xl">
              {initials}
            </div>
            <div className="min-w-0 pb-1">
              <h1 className="truncate text-lg font-bold text-slate-900 sm:text-2xl">
                {displayName}
              </h1>
              <p className="truncate text-sm text-slate-500">{user.email}</p>
            </div>
          </div>
          <Link
            href="/auth/logout"
            className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 sm:w-auto"
          >
            {t("logout")}
          </Link>
        </div>
      </section>

      {/* Stat tiles */}
      <section className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 sm:gap-4">
        {statTiles.map((tile) => (
          <div
            key={tile.label}
            className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm sm:rounded-2xl sm:p-4"
          >
            <p className={`text-xl font-bold sm:text-3xl ${tile.tone}`}>
              {historyStatsLoading ? "—" : tile.value}
            </p>
            <p className="mt-1 text-[11px] leading-tight text-slate-500 sm:text-sm">
              {tile.label}
            </p>
          </div>
        ))}
      </section>

      <Suspense fallback={null}>
        <ProfileOverviewSection defaultCategoryId={readinessCategoryId} />
      </Suspense>

      {/* Exam history */}
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

        <div className={`hidden border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-medium text-slate-500 ${EXAM_HISTORY_TABLE_GRID}`}>
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
                categoryLabel={getAttemptCategoryLabel(attempt, categoryById)}
                t={t}
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
