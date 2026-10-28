"use client";

import { useTranslations } from "next-intl";
import CategoryPickerBar from "@/components/categoryComponents/CategoryPickerBar/CategoryPickerBar";
import type { Category } from "@/lib/types/category";
import type { ReadinessScore } from "@/lib/types/userStats";
import { getReadinessHeadlineKey } from "@/components/Profile/profileUtils";
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
  const headlineKey = readiness
    ? getReadinessHeadlineKey(readiness)
    : undefined;

  return (
    <section className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
      <div className="border-b border-line-subtle px-4 py-4 sm:px-5">
        <h2 className="text-base font-bold text-fg sm:text-lg">
          {t("readinessTitle")}
        </h2>
      </div>

      {categories.length > 0 && (
        <div className="border-b border-line-subtle py-3">
          <CategoryPickerBar
            categories={categories}
            activeCategoryId={categoryId}
            pathname="/profile"
            searchParams={queryParams}
            inCard
          />
        </div>
      )}

      <div className="px-4 py-5 sm:px-6 sm:py-6">
        {authLoading || readinessLoading ? (
          <ProfileSectionSpinner label={t("loading")} />
        ) : readinessError ? (
          <p className="py-6 text-center text-sm text-fg-subtle">
            {t("readinessError")}
          </p>
        ) : readiness ? (
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
            <ProgressRing score={readiness.readinessScore} />
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold text-fg">
                  {readiness.categoryName}
                </h3>
                {readiness.readyForExam && (
                  <span className="rounded-full bg-success-muted px-3 py-0.5 text-xs font-semibold text-success-strong">
                    {t("readyBadge")}
                  </span>
                )}
              </div>
              <p className="text-base font-medium text-fg-muted">
                {headlineKey ? t(headlineKey) : readiness.label}
              </p>
              <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                {readiness.subjectsCovered != null &&
                  readiness.subjectsTotal != null && (
                    <div className="rounded-control bg-surface-muted px-3 py-2">
                      <dt className="text-xs text-fg-subtle">
                        {t("subjectsCovered")}
                      </dt>
                      <dd className="font-semibold text-fg">
                        {readiness.subjectsCovered}/{readiness.subjectsTotal}
                      </dd>
                    </div>
                  )}
                {readiness.weakSubjectsCount != null && (
                  <div className="rounded-control bg-surface-muted px-3 py-2">
                    <dt className="text-xs text-fg-subtle">
                      {t("weakSubjects")}
                    </dt>
                    <dd className="font-semibold text-danger">
                      {readiness.weakSubjectsCount}
                    </dd>
                  </div>
                )}
                {poolExposure != null && (
                  <div className="rounded-control bg-surface-muted px-3 py-2">
                    <dt className="text-xs text-fg-subtle">
                      {t("poolExposure")}
                    </dt>
                    <dd className="font-semibold text-accent">
                      {Math.round(poolExposure * 100)}%
                    </dd>
                  </div>
                )}
                {readiness.completedAttemptsTotal != null && (
                  <div className="rounded-control bg-surface-muted px-3 py-2">
                    <dt className="text-xs text-fg-subtle">
                      {t("attemptsUsed")}
                    </dt>
                    <dd className="font-semibold text-fg">
                      {readiness.completedAttemptsTotal}
                    </dd>
                  </div>
                )}
              </dl>
              {headlineKey === "readinessLabelNone" && (
                <p className="text-sm text-warning">
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
