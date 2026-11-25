"use client";

import { useLocale, useTranslations } from "next-intl";
import type { SavedStudyPlan } from "@/lib/types/studyPlan";
import { PLAN_CATCH_UP_DAYS_PER_STUDY_DAY } from "@/CONSTS/studyPlan";
import { plannedEndDay } from "@/utills/helpers/studyPlanProgress";
import { outlinePillBase } from "@/layoutComponents/Header/headerStyles";
import { LineIcon } from "@/components/Icon/LineIcon";
import { addPlanDays, formatPlanDayLong } from "./planDates";

type PlanBehindNoticeProps = {
  plan: SavedStudyPlan;
  dayCount: number;
  /** Days behind the plan's dates (> 0). */
  behind: number;
  /** Days "move the plan" shifts by (`daysToMove`). */
  moveBy: number;
  /** False past the largest saved shift: only catching up is offered. */
  canMove: boolean;
  onMove: () => void;
};

/**
 * Behind the plan's dates: two ways on, side by side. Catch up (up to
 * `PLAN_CATCH_UP_DAYS_PER_STUDY_DAY` plan days a day, nothing to press: the
 * next day simply opens) keeps the end date; "move the plan" shifts the
 * remaining days and the end date. A plan with an exam date warns when
 * moving would end it after the exam.
 */
export function PlanBehindNotice({
  plan,
  dayCount,
  behind,
  moveBy,
  canMove,
  onMove,
}: PlanBehindNoticeProps) {
  const t = useTranslations("StudyPlan");
  const locale = useLocale();
  const end = plannedEndDay(plan, dayCount);
  const movedEnd = addPlanDays(end, moveBy);
  const pastExam = !!plan.examDay && movedEnd > plan.examDay;

  return (
    <section
      aria-labelledby="plan-behind-title"
      className="space-y-4 rounded-panel border border-line bg-surface p-5 shadow-card sm:p-6"
    >
      <div className="space-y-1">
        <h2 id="plan-behind-title" className="text-lg font-bold text-fg">
          {t("behindTitle", { count: behind })}
        </h2>
        <p className="text-sm text-fg-muted">{t("behindBody")}</p>
      </div>
      <div className={`grid gap-3 ${canMove ? "sm:grid-cols-2" : ""}`}>
        <div className="space-y-2 rounded-card border border-line bg-surface-muted p-4">
          <p className="flex items-center gap-2 font-semibold text-fg">
            <LineIcon name="timer" className="h-5 w-5 text-accent" />
            {t("behindCatchUpTitle")}
          </p>
          <p className="text-sm text-fg-muted">
            {t("behindCatchUp", {
              perDay: PLAN_CATCH_UP_DAYS_PER_STUDY_DAY,
              date: formatPlanDayLong(end, locale),
            })}
          </p>
        </div>
        {canMove && (
          <div className="flex flex-col gap-3 rounded-card border border-line bg-surface-muted p-4">
            <p className="flex items-center gap-2 font-semibold text-fg">
              <LineIcon name="flag" className="h-5 w-5 text-accent" />
              {t("behindMoveTitle")}
            </p>
            <p className="text-sm text-fg-muted">
              {t("behindMove", {
                count: moveBy,
                date: formatPlanDayLong(movedEnd, locale),
              })}
            </p>
            {pastExam && (
              <p className="text-sm font-medium text-warning-strong">
                {t("behindExamWarning", {
                  date: formatPlanDayLong(plan.examDay!, locale),
                })}
              </p>
            )}
            <button
              type="button"
              onClick={onMove}
              className={`mt-auto h-11 self-start px-5 text-sm ${outlinePillBase}`}
            >
              {t("behindMoveButton")}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
