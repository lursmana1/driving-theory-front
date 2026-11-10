"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getPlanPreview } from "@/api/studyPlans";
import { getCategoryById } from "@/CONSTS/categories";
import type { PlanDay, SavedStudyPlan } from "@/lib/types/studyPlan";
import {
  currentDayIndex,
  dayStatus,
  dayMistakes,
  isDayDone,
} from "@/utills/helpers/studyPlanProgress";
import { outlinePillBase } from "@/layoutComponents/Header/headerStyles";
import { ProfileSectionSpinner } from "@/components/Profile/ProfileSectionSpinner";
import { usePlanRequest } from "@/utills/helpers/hooks/usePlanRequest";
import { useStudyDay } from "@/utills/helpers/hooks/useStudyDay";
import { LineIcon } from "@/components/Icon/LineIcon";
import { PlanDayList } from "./PlanDayList";
import { PlanRing } from "./PlanRing";
import { PlanNextDay } from "./PlanNextDay";
import { PlanLoadError } from "./PlanPrimitives";
import { PlanSaveNotice, type PlanSaveState } from "./PlanSaveNotice";
import { addPlanDays, daysBetween, formatPlanDayLong } from "./planDates";
import { useDayTopics } from "./planLabels";

type PlanHomeProps = {
  plan: SavedStudyPlan;
  onReset: () => void;
  save: PlanSaveState;
};

/** Plan home: today's day as a hero, the day timeline, a mock-exam card. */
export function PlanHome({ plan, onReset, save }: PlanHomeProps) {
  const t = useTranslations("StudyPlan");
  const locale = useLocale();
  const today = useStudyDay();
  const topicsOf = useDayTopics();
  const [confirmReset, setConfirmReset] = useState(false);
  const request = usePlanRequest(`${plan.categoryId}:${plan.dayCount}`, () =>
    getPlanPreview(plan.categoryId, { days: plan.dayCount }),
  );
  const preview = request.data;

  if (request.error) {
    return <PlanLoadError onRetry={request.retry} className="py-10" />;
  }
  if (!preview) return <ProfileSectionSpinner label={t("loading")} />;

  const days = preview.days;
  const current = currentDayIndex(plan, days);
  const currentDay = current != null ? days[current] : null;
  const doneCount = days.filter((d) => isDayDone(plan, d)).length;
  const dateOf = (day: PlanDay) => addPlanDays(plan.startDay, day.index);
  const currentOpen =
    current != null && dayStatus(plan, days, current, today) === "open";
  const categoryName = getCategoryById(plan.categoryId)?.name ?? "";
  const toExam = plan.examDay ? daysBetween(today, plan.examDay) : null;
  const topics = currentDay ? topicsOf(currentDay) : [];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-panel bg-linear-to-br from-accent to-accent-strong p-5 text-on-accent shadow-raised sm:p-7">
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-on-accent/75">
              {categoryName && `${categoryName} · `}
              {current != null
                ? t("dayOfTotal", { n: current + 1, total: days.length })
                : t("statusDone")}
            </p>
            <h2 className="text-xl font-bold leading-snug sm:text-2xl">
              {currentDay == null
                ? t("planFinished")
                : !currentOpen
                  ? t("doneForToday")
                  : currentDay.kind === "review"
                    ? t("reviewDay")
                    : topics.join(" · ")}
            </h2>
            {currentDay && currentOpen && (
              <p className="text-sm text-on-accent/80">
                {currentDay.newQuestions > 0 &&
                  `${t("stepQuestions", { count: currentDay.newQuestions })} · `}
                {t("minutes", { minutes: currentDay.minutes })}
              </p>
            )}
          </div>
          <PlanRing done={doneCount} total={days.length} />
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {currentDay == null ? null : currentOpen ? (
            <Link
              href={`/plan/day/${currentDay.index}`}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-surface px-7 text-base font-semibold text-fg shadow-card transition hover:bg-surface-muted"
            >
              {t("startDay", { n: currentDay.index + 1 })}
              <LineIcon name="arrowRight" className="h-5 w-5" />
            </Link>
          ) : (
            <PlanNextDay
              nextDay={currentDay}
              categoryId={plan.categoryId}
              mistakes={
                currentDay.index > 0
                  ? {
                      dayIndex: currentDay.index - 1,
                      count: dayMistakes(plan, currentDay.index - 1).length,
                    }
                  : undefined
              }
              tone="light"
            />
          )}
          {plan.examDay && toExam != null && toExam >= 0 && (
            <p className="text-sm text-on-accent/85">
              {t("examCountdown", {
                days: toExam,
                date: formatPlanDayLong(plan.examDay, locale),
              })}
            </p>
          )}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PlanDayList
            days={days}
            dateOf={dateOf}
            currentIndex={currentOpen ? current : null}
            statusOf={(day) => dayStatus(plan, days, day.index, today)}
          />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <section className="space-y-3 rounded-card border border-line bg-surface p-4 shadow-card">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent"
              aria-hidden
            >
              <LineIcon name="timer" className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-fg">{t("fullExam")}</p>
              <p className="text-xs leading-relaxed text-fg-subtle">
                {t("fullExamBody")}
              </p>
            </div>
            <Link
              href={`/exam?category=${plan.categoryId}`}
              className={`h-10 w-full px-5 ${outlinePillBase}`}
            >
              {t("fullExamCta")}
            </Link>
          </section>

          <section className="space-y-2 rounded-card border border-line bg-surface-muted p-4 text-xs text-fg-subtle">
            <p>{t("dayRule")}</p>
            <PlanSaveNotice {...save} />
            {confirmReset ? (
              <div className="space-y-2 pt-1">
                <p className="text-sm text-fg">{t("resetConfirm")}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onReset}
                    className={`h-9 px-4 text-danger ${outlinePillBase}`}
                  >
                    {t("resetYes")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className={`h-9 px-4 ${outlinePillBase}`}
                  >
                    {t("resetNo")}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="font-medium text-fg-muted underline-offset-2 hover:text-fg hover:underline"
              >
                {t("resetPlan")}
              </button>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
