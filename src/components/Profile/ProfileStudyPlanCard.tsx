"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getCategoryById } from "@/CONSTS/categories";
import { useStudyPlan } from "@/utills/helpers/hooks/useStudyPlan";
import { usePlanToday } from "@/utills/helpers/hooks/usePlanToday";
import {
  examCtaPillBase,
  outlinePillBase,
} from "@/layoutComponents/Header/headerStyles";
import { PlanProgressBar } from "@/components/StudyPlan/PlanPrimitives";

/**
 * The study plan on the profile: today's day and the plan's progress, or an
 * invitation to start one. Quiet while the plan loads.
 */
export function ProfileStudyPlanCard() {
  const t = useTranslations("Profile");
  const { plan, ready } = useStudyPlan();
  const today = usePlanToday();

  if (!ready) return null;

  if (!plan) {
    return (
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-surface p-4 shadow-card sm:p-5">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-fg sm:text-lg">
            {t("planTitle")}
          </h2>
          <p className="text-sm text-fg-muted">{t("planEmptyBody")}</p>
        </div>
        <Link
          href="/plan"
          className={`inline-flex h-11 shrink-0 items-center px-5 text-sm ${outlinePillBase}`}
        >
          {t("planEmptyCta")}
        </Link>
      </section>
    );
  }
  if (!today) return null;

  const category = getCategoryById(today.categoryId)?.name ?? "";
  const n = (today.dayIndex ?? 0) + 1;
  const status =
    today.status === "finished"
      ? t("planFinished")
      : today.status === "doneToday"
        ? t("planDoneToday", { n })
        : today.behind > 0
          ? t("planBehind", { count: today.behind })
          : today.stepsTotal > 0
            ? t("planSteps", { done: today.stepsDone, total: today.stepsTotal })
            : t("planReviewDay");

  return (
    <section className="space-y-4 rounded-card border border-line bg-surface p-4 shadow-card sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-fg sm:text-lg">
            {t("planTitle")}
            {category && (
              <span className="font-normal text-fg-subtle"> · {category}</span>
            )}
          </h2>
          <p className="text-sm text-fg-muted">
            {today.status !== "finished" &&
              `${t("planDay", { n, total: today.dayCount })} · `}
            {status}
          </p>
        </div>
        {today.status === "open" ? (
          <Link
            href={`/plan/day/${today.dayIndex}`}
            className={`inline-flex h-11 shrink-0 items-center px-5 text-sm ${examCtaPillBase}`}
          >
            {today.stepsDone > 0 ? t("planContinue") : t("planStart")}
          </Link>
        ) : (
          <Link
            href="/plan"
            className={`inline-flex h-11 shrink-0 items-center px-5 text-sm ${outlinePillBase}`}
          >
            {t("planOpen")}
          </Link>
        )}
      </div>
      <PlanProgressBar
        value={today.daysDone}
        max={today.dayCount}
        className="h-2"
        label={t("planDaysDone", {
          done: today.daysDone,
          total: today.dayCount,
        })}
      />
    </section>
  );
}
