"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { PlanDay } from "@/lib/types/studyPlan";
import { PLAN_COUNTDOWN_TICK_MS } from "@/CONSTS/studyPlan";
import { msToNextStudyDay } from "@/utills/helpers/studyPlanProgress";
import { outlinePillBase } from "@/layoutComponents/Header/headerStyles";
import { LineIcon } from "@/components/Icon/LineIcon";
import { useDayTopics } from "./planLabels";

type PlanNextDayProps = {
  /** The day that opens next; null when the plan is over. */
  nextDay: PlanDay | null;
  categoryId: number;
  /** The finished day whose open mistakes the "fix" button opens. */
  mistakes?: { dayIndex: number; count: number };
  /** "light" sits on the accent hero, "plain" on a normal card. */
  tone?: "light" | "plain";
};

function formatLeft(ms: number): string {
  const minutes = Math.max(0, Math.ceil(ms / 60_000));
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`;
}

/**
 * "Done for today" block: countdown to the next day (hh:mm), tomorrow's
 * topics, and what to do meanwhile (that day's mistakes, a full mock).
 */
export function PlanNextDay({
  nextDay,
  categoryId,
  mistakes,
  tone = "plain",
}: PlanNextDayProps) {
  const t = useTranslations("StudyPlan");
  const topicsOf = useDayTopics();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), PLAN_COUNTDOWN_TICK_MS);
    return () => clearInterval(timer);
  }, []);

  const light = tone === "light";
  const muted = light ? "text-on-accent/80" : "text-fg-subtle";
  const topics = nextDay
    ? nextDay.kind === "review"
      ? [t("reviewDay")]
      : topicsOf(nextDay)
    : [];
  const pill = light
    ? "inline-flex h-10 items-center justify-center gap-2 rounded-full bg-on-accent/15 px-4 text-sm font-semibold transition hover:bg-on-accent/25"
    : `h-10 gap-2 px-4 ${outlinePillBase}`;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-x-4 gap-y-1">
        <div>
          <p
            className={`text-2xs font-semibold uppercase tracking-wider ${muted}`}
          >
            {t("nextDayIn")}
          </p>
          <p className="font-mono text-3xl font-bold tabular-nums">
            {formatLeft(msToNextStudyDay(now))}
          </p>
        </div>
        {topics.length > 0 && (
          <p className={`pb-1 text-sm ${muted}`}>
            {t("tomorrow")}: {topics.join(" · ")}
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {mistakes && mistakes.count > 0 && (
          <Link href={`/plan/day/${mistakes.dayIndex}?fix=1`} className={pill}>
            <LineIcon name="repeat" className="h-4 w-4" />
            {t("meanwhileMistakes", { count: mistakes.count })}
          </Link>
        )}
        <Link href={`/exam?category=${categoryId}`} className={pill}>
          <LineIcon name="timer" className="h-4 w-4" />
          {t("meanwhileExam")}
        </Link>
      </div>
    </div>
  );
}
