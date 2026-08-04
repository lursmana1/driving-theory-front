"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/contexts/UserContext";
import {
  getAttemptsHistory,
  getWeakQuestions,
  getWeakSubjects,
  type AttemptSummary,
  type WeakQuestion,
  type WeakSubject,
} from "@/api/examAttempts";
import { getLocalizedSubjects } from "@/CONSTS/subjects";
import {
  EXAM_HISTORY_PAGE_SIZE,
  PAGE_PARAM,
} from "@/CONSTS/pagination";
import { formatDate } from "@/utills/helpers/formatDate";
import Pagination from "@/components/Pagination/Pagination";
import { WeakQuestionsChart } from "@/components/ExamHistory/WeakQuestionsChart";
import { WeakSubjectsChart } from "@/components/ExamHistory/WeakSubjectsChart";

function formatDuration(seconds: number | null): string {
  if (seconds == null) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
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
  const decided = passed + failed;
  const passRate = decided > 0 ? Math.round((passed / decided) * 100) : 0;
  return { passed, failed, passRate };
}

function ExamHistoryRow({
  attempt,
  locale,
  t,
}: {
  attempt: AttemptSummary;
  locale: string;
  t: (key: string) => string;
}) {
  const resultLabel =
    attempt.passed === true
      ? t("passed")
      : attempt.passed === false
        ? t("failed")
        : "—";
  const resultClass =
    attempt.passed === true
      ? "text-emerald-600"
      : attempt.passed === false
        ? "text-rose-600"
        : "text-slate-400";

  return (
    <li className="border-b border-slate-100 last:border-b-0">
      {/* Mobile: stacked card */}
      <div className="space-y-2 px-4 py-4 sm:hidden">
        <time dateTime={attempt.createdAt} className="block text-sm font-medium text-slate-800">
          {formatDate(attempt.createdAt, locale, "D MMM YYYY, HH:mm")}
        </time>
        <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
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
      <div className="hidden grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-5 py-3.5 text-sm sm:grid">
        <time dateTime={attempt.createdAt} className="text-slate-700">
          {formatDate(attempt.createdAt, locale, "D MMM YYYY, HH:mm")}
        </time>
        <span className="text-right font-medium text-slate-900">
          {attempt.correctCount}/{attempt.questionCount}
        </span>
        <span className="text-right text-slate-600">
          {formatDuration(attempt.durationSeconds)}
        </span>
        <span className={`text-right font-medium ${resultClass}`}>
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

  const [attempts, setAttempts] = useState<AttemptSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ passed: 0, failed: 0, passRate: 0 });
  const [weakQuestions, setWeakQuestions] = useState<WeakQuestion[]>([]);
  const [weakSubjects, setWeakSubjects] = useState<WeakSubject[]>([]);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);

  const subjects = useMemo(() => getLocalizedSubjects(locale), [locale]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    let active = true;

    (async () => {
      setOverviewLoading(true);
      const [statsHistory, wq, ws] = await Promise.all([
        getAttemptsHistory(1, 100).catch(() => ({
          data: [],
          total: 0,
          page: 1,
          totalPages: 1,
        })),
        getWeakQuestions().catch(() => []),
        getWeakSubjects().catch(() => []),
      ]);
      if (!active) return;
      setTotal(statsHistory.total);
      setStats(computeStats(statsHistory.data));
      setWeakQuestions(wq);
      setWeakSubjects(ws);
      setOverviewLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let active = true;

    (async () => {
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
      setTotal(history.total);
      setHistoryLoading(false);
    })();

    return () => {
      active = false;
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

  const statTiles = [
    { label: t("statTotal"), value: total, tone: "text-slate-900" },
    { label: t("statPassed"), value: stats.passed, tone: "text-emerald-600" },
    { label: t("statFailed"), value: stats.failed, tone: "text-rose-600" },
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
      <section className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
        {statTiles.map((tile) => (
          <div
            key={tile.label}
            className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm sm:rounded-2xl sm:p-4"
          >
            <p className={`text-xl font-bold sm:text-3xl ${tile.tone}`}>
              {overviewLoading ? "—" : tile.value}
            </p>
            <p className="mt-1 text-[11px] leading-tight text-slate-500 sm:text-sm">
              {tile.label}
            </p>
          </div>
        ))}
      </section>

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

        <div className="hidden border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-medium text-slate-500 md:grid md:grid-cols-[1fr_auto_auto_auto] md:gap-4">
          <span>{t("colDate")}</span>
          <span className="text-right">{t("colScore")}</span>
          <span className="text-right">{t("colDuration")}</span>
          <span className="text-right">{t("colResult")}</span>
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
                t={t}
              />
            ))
          )}
        </ul>

        {!historyLoading && total > EXAM_HISTORY_PAGE_SIZE && (
          <div className="border-t border-slate-100 px-4 py-4 sm:px-5">
            <Suspense fallback={null}>
              <Pagination
                page={page}
                total={total}
                pathname="/profile"
                pageSize={EXAM_HISTORY_PAGE_SIZE}
              />
            </Suspense>
          </div>
        )}
      </section>

      {/* Charts */}
      {!overviewLoading &&
        (weakQuestions.length > 0 || weakSubjects.length > 0) && (
          <section className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2">
            <WeakQuestionsChart
              data={weakQuestions}
              title={tExam("weakQuestionsTitle")}
              questionLabel={tExam("question")}
              wrongLabel={tExam("wrongCount")}
            />
            <WeakSubjectsChart
              data={weakSubjects}
              subjects={subjects}
              weakQuestions={weakQuestions}
              title={tExam("weakSubjectsTitle")}
              weakQuestionsTitle={tExam("weakQuestionsTitle")}
              questionLabel={tExam("question")}
              wrongLabel={tExam("wrongCount")}
              correctLabel={tExam("correctCount")}
              totalLabel={tExam("totalQuestions")}
              unansweredLabel={tExam("unanswered")}
            />
          </section>
        )}
    </main>
  );
}
