"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getPlanPreview } from "@/api/studyPlans";
import { getCategoryById } from "@/CONSTS/categories";
import {
  PLAN_HERO_TOPICS,
  STUDY_PLAN_SHIFT_MAX_DAYS,
} from "@/CONSTS/studyPlan";
import type { PlanDay, SavedStudyPlan } from "@/lib/types/studyPlan";
import {
  currentDayIndex,
  dayStatus,
  daysBehind,
  dayMistakes,
  extraRoundDone,
  isDayDone,
  extraTicketsDone,
  planCoverage,
  daysToMove,
  shownDay,
} from "@/utills/helpers/studyPlanProgress";
import {
  examCtaPillBase,
  outlinePillBase,
} from "@/layoutComponents/Header/headerStyles";
import { ProfileSectionSpinner } from "@/components/Profile/ProfileSectionSpinner";
import { usePlanRequest } from "@/utills/helpers/hooks/usePlanRequest";
import { useStudyDay } from "@/utills/helpers/hooks/useStudyDay";
import { usePlanSync } from "@/utills/helpers/hooks/usePlanSync";
import { LineIcon } from "@/components/Icon/LineIcon";
import { PlanDayList } from "./PlanDayList";
import { PlanRing } from "./PlanRing";
import { PlanNextDay } from "./PlanNextDay";
import {
  PlanLoadError,
  PlanProgressBar,
  PlanStickyBar,
  PlanUpdatedNotice,
} from "./PlanPrimitives";
import { PlanSaveNotice, type PlanSaveState } from "./PlanSaveNotice";
import { PlanReadiness, useMockStreak } from "./PlanReadiness";
import { daysBetween, formatPlanDayLong } from "./planDates";
import { PlanBehindNotice } from "./PlanBehindNotice";
import { useDayTopics } from "./planLabels";

type PlanHomeProps = {
  plan: SavedStudyPlan;
  onReset: () => void;
  /** Move the remaining days later by this many days (behind the plan). */
  onMove: (behind: number) => void;
  save: PlanSaveState;
};

/** Plan home: today's day as a hero, the day timeline, a mock-exam card. */
export function PlanHome({ plan, onReset, onMove, save }: PlanHomeProps) {
  const t = useTranslations("StudyPlan");
  const locale = useLocale();
  const today = useStudyDay();
  const topicsOf = useDayTopics();
  const [confirmReset, setConfirmReset] = useState(false);
  const mockStreak = useMockStreak(plan.categoryId);
  const request = usePlanRequest(`${plan.categoryId}:${plan.dayCount}`, () =>
    getPlanPreview(plan.categoryId, { days: plan.dayCount }),
  );
  const preview = request.data;
  const updatedDays = usePlanSync(plan, preview?.days);

  if (request.error) {
    return <PlanLoadError onRetry={request.retry} className="py-10" />;
  }
  if (!preview) return <ProfileSectionSpinner label={t("loading")} />;

  const days = preview.days;
  const current = currentDayIndex(plan, days);
  const currentDay = current != null ? days[current] : null;
  const doneCount = days.filter((d) => isDayDone(plan, d)).length;
  const dateOf = (day: PlanDay) => shownDay(plan, day);
  const behind = daysBehind(plan, days, today);
  const moveBy = daysToMove(plan, days, today);
  const currentOpen =
    current != null && dayStatus(plan, days, current, today) === "open";
  const categoryName = getCategoryById(plan.categoryId)?.name ?? "";
  const extraDone = extraTicketsDone(plan, days);
  const seen = planCoverage(plan, days);
  const total = preview.totalQuestions;
  const remaining = Math.max(0, total - seen);
  // Learn days from today on: the pace that still covers everything.
  const learnDaysLeft =
    current == null
      ? 0
      : days.filter((d) => d.kind === "learn" && d.index >= current).length;
  const pace = learnDaysLeft > 0 ? Math.ceil(remaining / learnDaysLeft) : 0;
  const pastHalf = total > 0 && seen / total >= 0.5;
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
                    : t("todayHeadline", { count: topics.length })}
            </h2>
            {currentDay && currentOpen && currentDay.kind === "learn" && (
              <ul
                className="flex flex-wrap gap-1.5"
                aria-label={t("todayTopics")}
              >
                {topics.slice(0, PLAN_HERO_TOPICS).map((topic) => (
                  <li
                    key={topic}
                    className="rounded-full bg-on-accent/15 px-2.5 py-1 text-xs font-medium"
                  >
                    {topic}
                  </li>
                ))}
                {topics.length > PLAN_HERO_TOPICS && (
                  <li className="rounded-full bg-on-accent/15 px-2.5 py-1 text-xs font-medium">
                    +{topics.length - PLAN_HERO_TOPICS}
                  </li>
                )}
                {currentDay.newQuestions > 0 && (
                  <li className="px-1 py-1 text-xs text-on-accent/80">
                    {t("stepQuestions", { count: currentDay.newQuestions })}
                  </li>
                )}
              </ul>
            )}
          </div>
          <PlanRing
            done={doneCount}
            total={days.length}
            label={t("daysDone", { done: doneCount, total: days.length })}
          />
        </div>

        {/*
         * Ticket coverage: what the plan has shown so far; the extra rounds fill
         * the rest. Before the half-way point the done count leads, after it the
         * remaining count (small-area rule), and a pace line keeps it attainable.
         */}
        <div className="mt-5 space-y-1.5">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="font-semibold">{t("coverageLabel")}</span>
            <span className="tabular-nums text-on-accent/85">
              {pastHalf
                ? t("coverageRemaining", { count: remaining })
                : t("coverageOf", { seen, total })}
            </span>
          </div>
          <PlanProgressBar
            value={seen}
            max={total}
            tone="light"
            className="h-2"
            label={t("coverageOf", { seen, total })}
          />
          {remaining > 0 && (
            <p className="text-xs text-on-accent/80">
              {/* Behind: the banner below says where the plan stands. */}
              {pace > 0 &&
                behind === 0 &&
                `${t("coveragePace", { count: pace })} `}
              {t("coverageHint")}
            </p>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {currentDay == null ? null : currentOpen ? (
            <Link
              href={`/plan/day/${currentDay.index}`}
              className="hidden h-12 items-center justify-center gap-2 rounded-full bg-surface px-7 text-base font-semibold text-fg shadow-card transition hover:bg-surface-muted lg:inline-flex"
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

      <PlanUpdatedNotice days={updatedDays} />

      {behind > 0 && (
        <PlanBehindNotice
          plan={plan}
          dayCount={days.length}
          behind={behind}
          moveBy={moveBy}
          canMove={(plan.shift ?? 0) + moveBy <= STUDY_PLAN_SHIFT_MAX_DAYS}
          onMove={() => onMove(moveBy)}
        />
      )}

      {/* Phones: the readiness light sits right under the hero, not after 14 days of list. */}
      <PlanReadiness
        streak={mockStreak}
        seen={seen}
        total={total}
        daysDone={doneCount}
        dayCount={days.length}
        className="lg:hidden"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* min-w-0: a grid column must not grow to the one-line day summaries. */}
        <div className="min-w-0 lg:col-span-2">
          <PlanDayList
            days={days}
            dateOf={dateOf}
            currentIndex={currentOpen ? current : null}
            statusOf={(day) => dayStatus(plan, days, day.index, today)}
            extraDoneOf={(day) => extraRoundDone(plan, day)}
          />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <PlanReadiness
            streak={mockStreak}
            seen={seen}
            total={total}
            daysDone={doneCount}
            dayCount={days.length}
            className="hidden lg:block"
          />
          {preview.optionalQuestions > 0 && (
            <section className="space-y-2 rounded-card border border-accent/40 bg-accent-soft/40 p-4 shadow-card">
              <p className="flex items-center gap-2 text-sm font-semibold text-fg">
                <LineIcon name="star" className="h-4 w-4 text-accent" />
                {t("extraSectionTitle")}
              </p>
              <PlanProgressBar
                value={extraDone}
                max={preview.optionalQuestions}
                className="h-1.5"
                label={t("extraProgressBody", {
                  done: extraDone,
                  total: preview.optionalQuestions,
                })}
              />
              <p className="text-xs text-fg-muted">
                {t("extraProgressBody", {
                  done: extraDone,
                  total: preview.optionalQuestions,
                })}
              </p>
            </section>
          )}
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
                    className={`h-11 px-4 text-danger ${outlinePillBase}`}
                  >
                    {t("resetYes")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className={`h-11 px-4 ${outlinePillBase}`}
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

      {currentDay && currentOpen && (
        <PlanStickyBar>
          <Link
            href={`/plan/day/${currentDay.index}`}
            className={`inline-flex h-12 w-full items-center justify-center gap-2 text-base shadow-raised ${examCtaPillBase}`}
          >
            {t("startDay", { n: currentDay.index + 1 })}
            <LineIcon name="arrowRight" className="h-5 w-5" />
          </Link>
        </PlanStickyBar>
      )}
    </div>
  );
}
