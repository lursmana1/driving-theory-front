"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { getCategories } from "@/api/categories";
import {
  getUserStatsOverview,
  isAuthError,
  type OverviewWeakQuestion,
  type OverviewWeakSubject,
} from "@/api/userStats";
import type { ReadinessScore } from "@/lib/types/userStats";
import { subscribeStatsRefresh } from "@/lib/statsRefresh";
import CategoryPickerBar from "@/components/categoryComponents/CategoryPickerBar/CategoryPickerBar";
import { WeakQuestionsChart } from "@/components/ExamHistory/WeakQuestionsChart";
import { WeakSubjectsChart } from "@/components/ExamHistory/WeakSubjectsChart";
import type { Category } from "@/lib/types/category";
import { DEFAULT_CATEGORY_ID, resolveCategoryId } from "@/CONSTS/categories";
import { resolveSubjectDisplayName } from "@/CONSTS/subjects";

type ProfileOverviewSectionProps = {
  defaultCategoryId?: number;
};

const WEAK_STATS_TOP_N = 5;

function topByWrongCount<T extends { wrongCount: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.wrongCount - a.wrongCount).slice(0, WEAK_STATS_TOP_N);
}

function ProgressRing({ score }: { score: number }) {
  const clamped = Math.min(100, Math.max(0, score));
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="url(#readinessGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
        <defs>
          <linearGradient id="readinessGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-slate-900">{clamped}</span>
        <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">%</span>
      </div>
    </div>
  );
}

export default function ProfileOverviewSection({
  defaultCategoryId = DEFAULT_CATEGORY_ID,
}: ProfileOverviewSectionProps) {
  const t = useTranslations("Profile");
  const tExam = useTranslations("Exam");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const categoryId = resolveCategoryId(
    searchParams.get("category")
      ? Number(searchParams.get("category"))
      : defaultCategoryId,
  );

  const [categories, setCategories] = useState<Category[]>([]);
  const [readiness, setReadiness] = useState<ReadinessScore | null>(null);
  const [weakQuestions, setWeakQuestions] = useState<OverviewWeakQuestion[]>([]);
  const [weakSubjects, setWeakSubjects] = useState<OverviewWeakSubject[]>([]);
  const [poolExposure, setPoolExposure] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const overview = await getUserStatsOverview(categoryId);
      setReadiness(overview.readiness);
      // Per-category completed exams only — readiness.completedAttemptsTotal (≠ top-bar historyTotal)
      setWeakQuestions(Array.isArray(overview.weakQuestions) ? overview.weakQuestions : []);
      setWeakSubjects(Array.isArray(overview.weakSubjects) ? overview.weakSubjects : []);
      setPoolExposure(overview.questionPool?.exposureRate ?? null);
      setLoading(false);
    } catch (err) {
      if (!isAuthError(err)) setError(true);
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    loadOverview();
    return subscribeStatsRefresh(loadOverview);
  }, [loadOverview]);

  const subjectNames = weakSubjects.map((s) => ({
    id: s.subjectId,
    name: resolveSubjectDisplayName(s.subjectId, s.name, locale),
  }));

  const topWeakQuestions = useMemo(
    () => topByWrongCount(weakQuestions),
    [weakQuestions],
  );
  const topWeakSubjects = useMemo(
    () => topByWrongCount(weakSubjects),
    [weakSubjects],
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
          <h2 className="text-base font-bold text-slate-900 sm:text-lg">{t("readinessTitle")}</h2>
          <p className="mt-1 text-sm text-slate-500">{t("readinessSubtitle")}</p>
        </div>

        {categories.length > 0 && (
          <div className="border-b border-slate-100 px-2 py-3 sm:px-4">
            <CategoryPickerBar
              categories={categories}
              activeCategoryId={categoryId}
              pathname="/profile"
            />
          </div>
        )}

        <div className="px-4 py-5 sm:px-6 sm:py-6">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-slate-400">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
              <span className="ml-3 text-sm">{t("loading")}</span>
            </div>
          ) : error ? (
            <p className="py-6 text-center text-sm text-slate-500">{t("readinessError")}</p>
          ) : readiness ? (
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
              <ProgressRing score={readiness.readinessScore} />
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">{readiness.categoryName}</h3>
                  {readiness.readyForExam && (
                    <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-semibold text-emerald-700">
                      {t("readyBadge")}
                    </span>
                  )}
                </div>
                <p className="text-base font-medium text-slate-700">{readiness.label}</p>
                <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  {readiness.subjectsCovered != null && readiness.subjectsTotal != null && (
                    <div className="rounded-xl bg-slate-50 px-3 py-2">
                      <dt className="text-xs text-slate-500">{t("subjectsCovered")}</dt>
                      <dd className="font-semibold text-slate-900">
                        {readiness.subjectsCovered}/{readiness.subjectsTotal}
                      </dd>
                    </div>
                  )}
                  {readiness.weakSubjectsCount != null && (
                    <div className="rounded-xl bg-slate-50 px-3 py-2">
                      <dt className="text-xs text-slate-500">{t("weakSubjects")}</dt>
                      <dd className="font-semibold text-rose-600">{readiness.weakSubjectsCount}</dd>
                    </div>
                  )}
                  {poolExposure != null && (
                    <div className="rounded-xl bg-slate-50 px-3 py-2">
                      <dt className="text-xs text-slate-500">{t("poolExposure")}</dt>
                      <dd className="font-semibold text-sky-600">
                        {Math.round(poolExposure * 100)}%
                      </dd>
                    </div>
                  )}
                  {readiness.completedAttemptsTotal != null && (
                    <div className="rounded-xl bg-slate-50 px-3 py-2">
                      <dt className="text-xs text-slate-500">{t("attemptsUsed")}</dt>
                      <dd className="font-semibold text-slate-900">
                        {readiness.completedAttemptsTotal}
                      </dd>
                    </div>
                  )}
                </dl>
                {readiness.confidence === "none" && (
                  <p className="text-sm text-amber-600">{t("readinessNoneHint")}</p>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {!loading && (topWeakQuestions.length > 0 || topWeakSubjects.length > 0) && (
        <section className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2">
          {topWeakQuestions.length > 0 && (
            <WeakQuestionsChart
              data={topWeakQuestions}
              title={tExam("weakQuestionsTitle")}
              questionLabel={tExam("question")}
              wrongLabel={tExam("wrongCount")}
            />
          )}
          {topWeakSubjects.length > 0 && (
            <WeakSubjectsChart
              data={topWeakSubjects}
              subjects={subjectNames}
              weakQuestions={weakQuestions}
              title={tExam("weakSubjectsTitle")}
              questionLabel={tExam("question")}
              wrongLabel={tExam("wrongCount")}
              correctLabel={tExam("correctCount")}
              totalLabel={tExam("totalQuestions")}
              unansweredLabel={tExam("unanswered")}
            />
          )}
        </section>
      )}
    </div>
  );
}
