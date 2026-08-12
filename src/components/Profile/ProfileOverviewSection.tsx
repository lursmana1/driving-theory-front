"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import {
  getQuestionPool,
  getReadiness,
  getWeakQuestions,
  getWeakSubjects,
  isAuthError,
  type OverviewWeakQuestion,
  type OverviewWeakSubject,
} from "@/api/userStats";
import type { ReadinessScore } from "@/lib/types/userStats";
import { subscribeStatsRefresh } from "@/lib/statsRefresh";
import { useAuth } from "@/contexts/UserContext";
import CategoryPickerBar from "@/components/categoryComponents/CategoryPickerBar/CategoryPickerBar";
import type { Category } from "@/lib/types/category";
import { DEFAULT_CATEGORY_ID, resolveCategoryId } from "@/CONSTS/categories";
import { resolveSubjectDisplayName } from "@/CONSTS/subjects";
import { getCategories } from "@/api/categories";
import { ProfileSectionSpinner } from "@/components/Profile/ProfileSectionSpinner";
import { ProgressRing } from "@/components/Profile/ProgressRing";
import { topByWrongCount } from "@/components/Profile/profileUtils";

const WeakQuestionsChart = dynamic(
  () =>
    import("@/components/ExamHistory/WeakQuestionsChart").then(
      (m) => m.WeakQuestionsChart,
    ),
  { loading: () => null },
);

const WeakSubjectsChart = dynamic(
  () =>
    import("@/components/ExamHistory/WeakSubjectsChart").then(
      (m) => m.WeakSubjectsChart,
    ),
  { loading: () => null },
);

type ProfileOverviewSectionProps = {
  defaultCategoryId?: number;
  categories?: Category[];
};

const WEAK_STATS_TOP_N = 5;

export default function ProfileOverviewSection({
  defaultCategoryId = DEFAULT_CATEGORY_ID,
  categories: categoriesProp,
}: ProfileOverviewSectionProps) {
  const { user, loading: authLoading } = useAuth();
  const t = useTranslations("Profile");
  const tExam = useTranslations("Exam");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const queryParams = useMemo(
    () => Object.fromEntries(searchParams.entries()),
    [searchParams],
  );
  const categoryId = resolveCategoryId(
    searchParams.get("category")
      ? Number(searchParams.get("category"))
      : defaultCategoryId,
  );

  const [fallbackCategories, setFallbackCategories] = useState<Category[]>([]);
  const categories = categoriesProp?.length
    ? categoriesProp
    : fallbackCategories;

  const [readiness, setReadiness] = useState<ReadinessScore | null>(null);
  const [weakQuestions, setWeakQuestions] = useState<OverviewWeakQuestion[]>(
    [],
  );
  const [weakSubjects, setWeakSubjects] = useState<OverviewWeakSubject[]>([]);
  const [poolExposure, setPoolExposure] = useState<number | null>(null);
  const [readinessLoading, setReadinessLoading] = useState(true);
  const [readinessError, setReadinessError] = useState(false);
  const [weakQuestionsLoading, setWeakQuestionsLoading] = useState(true);
  const [weakSubjectsLoading, setWeakSubjectsLoading] = useState(true);

  const loadStats = useCallback(
    async (cancelled: { current: boolean }) => {
      setReadiness(null);
      setWeakQuestions([]);
      setWeakSubjects([]);
      setPoolExposure(null);
      setReadinessLoading(true);
      setReadinessError(false);
      setWeakQuestionsLoading(true);
      setWeakSubjectsLoading(true);

      const [readinessResult, poolResult, weakQResult, weakSResult] =
        await Promise.allSettled([
          getReadiness(categoryId),
          getQuestionPool(categoryId),
          getWeakQuestions(categoryId),
          getWeakSubjects(categoryId),
        ]);

      if (cancelled.current) return;

      if (readinessResult.status === "fulfilled") {
        setReadiness(readinessResult.value);
        setReadinessError(false);
      } else if (!isAuthError(readinessResult.reason)) {
        setReadinessError(true);
      }
      setReadinessLoading(false);

      if (poolResult.status === "fulfilled") {
        setPoolExposure(poolResult.value.exposureRate ?? null);
      } else {
        setPoolExposure(null);
      }

      if (weakQResult.status === "fulfilled") {
        setWeakQuestions(weakQResult.value);
      } else {
        setWeakQuestions([]);
      }
      setWeakQuestionsLoading(false);

      if (weakSResult.status === "fulfilled") {
        setWeakSubjects(weakSResult.value);
      } else {
        setWeakSubjects([]);
      }
      setWeakSubjectsLoading(false);
    },
    [categoryId],
  );

  useEffect(() => {
    if (categoriesProp?.length) return;
    getCategories()
      .then(setFallbackCategories)
      .catch(() => setFallbackCategories([]));
  }, [categoriesProp]);

  useEffect(() => {
    if (authLoading || !user) return;

    const cancelled = { current: false };
    void loadStats(cancelled);
    const unsub = subscribeStatsRefresh(() => loadStats(cancelled));

    return () => {
      cancelled.current = true;
      unsub();
    };
  }, [authLoading, user, loadStats]);

  const subjectNames = weakSubjects.map((s) => ({
    id: s.subjectId,
    name: resolveSubjectDisplayName(s.subjectId, s.name, locale),
  }));

  const topWeakQuestions = useMemo(
    () => topByWrongCount(weakQuestions, WEAK_STATS_TOP_N),
    [weakQuestions],
  );
  const topWeakSubjects = useMemo(
    () => topByWrongCount(weakSubjects, WEAK_STATS_TOP_N),
    [weakSubjects],
  );

  const chartsLoading = weakQuestionsLoading || weakSubjectsLoading;
  const showChartsSection =
    chartsLoading || topWeakQuestions.length > 0 || topWeakSubjects.length > 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
          <h2 className="text-base font-bold text-slate-900 sm:text-lg">
            {t("readinessTitle")}
          </h2>
        </div>

        {categories.length > 0 && (
          <div className="border-b border-slate-100 px-2 py-3 sm:px-4">
            <CategoryPickerBar
              categories={categories}
              activeCategoryId={categoryId}
              pathname="/profile"
              searchParams={queryParams}
            />
          </div>
        )}

        <div className="px-4 py-5 sm:px-6 sm:py-6">
          {authLoading || readinessLoading ? (
            <ProfileSectionSpinner label={t("loading")} />
          ) : readinessError ? (
            <p className="py-6 text-center text-sm text-slate-500">
              {t("readinessError")}
            </p>
          ) : readiness ? (
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
              <ProgressRing score={readiness.readinessScore} />
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    {readiness.categoryName}
                  </h3>
                  {readiness.readyForExam && (
                    <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-semibold text-emerald-700">
                      {t("readyBadge")}
                    </span>
                  )}
                </div>
                <p className="text-base font-medium text-slate-700">
                  {readiness.label}
                </p>
                <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  {readiness.subjectsCovered != null &&
                    readiness.subjectsTotal != null && (
                      <div className="rounded-xl bg-slate-50 px-3 py-2">
                        <dt className="text-xs text-slate-500">
                          {t("subjectsCovered")}
                        </dt>
                        <dd className="font-semibold text-slate-900">
                          {readiness.subjectsCovered}/{readiness.subjectsTotal}
                        </dd>
                      </div>
                    )}
                  {readiness.weakSubjectsCount != null && (
                    <div className="rounded-xl bg-slate-50 px-3 py-2">
                      <dt className="text-xs text-slate-500">
                        {t("weakSubjects")}
                      </dt>
                      <dd className="font-semibold text-rose-600">
                        {readiness.weakSubjectsCount}
                      </dd>
                    </div>
                  )}
                  {poolExposure != null && (
                    <div className="rounded-xl bg-slate-50 px-3 py-2">
                      <dt className="text-xs text-slate-500">
                        {t("poolExposure")}
                      </dt>
                      <dd className="font-semibold text-sky-600">
                        {Math.round(poolExposure * 100)}%
                      </dd>
                    </div>
                  )}
                  {readiness.completedAttemptsTotal != null && (
                    <div className="rounded-xl bg-slate-50 px-3 py-2">
                      <dt className="text-xs text-slate-500">
                        {t("attemptsUsed")}
                      </dt>
                      <dd className="font-semibold text-slate-900">
                        {readiness.completedAttemptsTotal}
                      </dd>
                    </div>
                  )}
                </dl>
                {readiness.confidence === "none" && (
                  <p className="text-sm text-amber-600">
                    {t("readinessNoneHint")}
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {showChartsSection && (
        <section className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2">
          {weakQuestionsLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <ProfileSectionSpinner label={t("loading")} />
            </div>
          ) : (
            topWeakQuestions.length > 0 && (
              <WeakQuestionsChart
                data={topWeakQuestions}
                categoryId={categoryId}
                title={tExam("weakQuestionsTitle")}
                questionLabel={tExam("question")}
                wrongLabel={tExam("wrongCount")}
              />
            )
          )}
          {weakSubjectsLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <ProfileSectionSpinner label={t("loading")} />
            </div>
          ) : (
            topWeakSubjects.length > 0 && (
              <WeakSubjectsChart
                data={topWeakSubjects}
                subjects={subjectNames}
                weakQuestions={weakQuestions}
                categoryId={categoryId}
                title={tExam("weakSubjectsTitle")}
                questionLabel={tExam("question")}
                wrongLabel={tExam("wrongCount")}
                correctLabel={tExam("correctCount")}
                totalLabel={tExam("totalQuestions")}
                unansweredLabel={tExam("unanswered")}
              />
            )
          )}
        </section>
      )}
    </div>
  );
}
