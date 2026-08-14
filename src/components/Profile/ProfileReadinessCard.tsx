"use client";

import { useTranslations } from "next-intl";
import CategoryPickerBar from "@/components/categoryComponents/CategoryPickerBar/CategoryPickerBar";
import type { Category } from "@/lib/types/category";
import type { ReadinessScore } from "@/lib/types/userStats";
import { ProfileSectionSpinner } from "@/components/Profile/ProfileSectionSpinner";
import { ProgressRing } from "@/components/Profile/ProgressRing";

type ProfileReadinessCardProps = {
  categories: Category[];
  categoryId: number;
  queryParams: Record<string, string>;
  authLoading: boolean;
  readiness: ReadinessScore | null;
  readinessLoading: boolean;
  readinessError: boolean;
  poolExposure: number | null;
};

export function ProfileReadinessCard({
  categories,
  categoryId,
  queryParams,
  authLoading,
  readiness,
  readinessLoading,
  readinessError,
  poolExposure,
}: ProfileReadinessCardProps) {
  const t = useTranslations("Profile");

  return (
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
  );
}
