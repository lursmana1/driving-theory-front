"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { PlanDay } from "@/lib/types/studyPlan";
import type { DayStatus } from "@/utills/helpers/studyPlanProgress";
import { LineIcon } from "@/components/Icon/LineIcon";
import { useDayTopics, usePlanDateFormat } from "./planLabels";

type PlanDayListProps = {
  days: PlanDay[];
  /** Real dates per day (from the saved start day); falls back to `day.date`. */
  dateOf?: (day: PlanDay) => string;
  /** Without it the list is a read-only preview. */
  statusOf?: (day: PlanDay) => DayStatus;
  currentIndex?: number | null;
};

const DAYS_PER_WEEK = 7;

function nodeClass(status: DayStatus | undefined, current: boolean): string {
  if (status === "done") return "bg-success text-on-accent";
  if (current) return "bg-accent text-on-accent shadow-glow";
  if (status === "locked") return "border border-line bg-surface text-fg-faint";
  return "border border-line-strong bg-surface text-fg";
}

/**
 * The plan as a timeline: one node per day on a vertical line, grouped by
 * week. Done days are green, today is accent, locked days are muted.
 */
export function PlanDayList({
  days,
  dateOf,
  statusOf,
  currentIndex,
}: PlanDayListProps) {
  const t = useTranslations("StudyPlan");
  const formatDay = usePlanDateFormat();
  const topicsOf = useDayTopics();

  const weeks: PlanDay[][] = [];
  for (let i = 0; i < days.length; i += DAYS_PER_WEEK) {
    weeks.push(days.slice(i, i + DAYS_PER_WEEK));
  }

  return (
    <div className="space-y-6">
      {weeks.map((week, w) => (
        <section key={w} className="space-y-2">
          {weeks.length > 1 && (
            <h3 className="text-2xs font-bold uppercase tracking-wider text-fg-faint">
              {t("weekLabel", { n: w + 1 })}
            </h3>
          )}
          <ol className="relative">
            {week.map((day, i) => {
              const status = statusOf?.(day);
              const current = currentIndex === day.index;
              const clickable = !!status && status !== "locked";
              const topics = topicsOf(day);
              const last = i === week.length - 1;
              const row = (
                <div
                  className={`group flex gap-3 rounded-card px-2 py-2 transition-colors ${
                    clickable ? "hover:bg-surface-muted" : ""
                  } ${current ? "bg-accent-soft" : ""}`}
                >
                  <div className="relative flex w-10 shrink-0 justify-center">
                    {!last && (
                      <span
                        className={`absolute top-10 -bottom-4 w-0.5 ${
                          status === "done" ? "bg-success" : "bg-line"
                        }`}
                        aria-hidden
                      />
                    )}
                    <span
                      className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${nodeClass(status, current)}`}
                      aria-hidden
                    >
                      {status === "done" ? (
                        <LineIcon
                          name="check"
                          className="h-5 w-5"
                          strokeWidth={3}
                        />
                      ) : status === "locked" ? (
                        <LineIcon name="lock" className="h-4 w-4" />
                      ) : day.kind === "review" ? (
                        <LineIcon name="flag" className="h-4 w-4" />
                      ) : (
                        day.index + 1
                      )}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 py-0.5">
                    <div className="flex items-baseline justify-between gap-3">
                      <p
                        className={`text-sm font-semibold ${
                          status === "locked" ? "text-fg-subtle" : "text-fg"
                        }`}
                      >
                        {t("dayLabel", { n: day.index + 1 })}
                        <span className="ml-2 text-xs font-normal text-fg-subtle">
                          {formatDay(dateOf ? dateOf(day) : day.date)}
                        </span>
                      </p>
                      <span
                        className={`shrink-0 text-xs ${
                          current
                            ? "font-semibold text-accent"
                            : status === "done"
                              ? "font-medium text-success"
                              : "text-fg-faint"
                        }`}
                      >
                        {current
                          ? t("statusToday")
                          : status === "done"
                            ? t("statusDone")
                            : t("minutes", { minutes: day.minutes })}
                      </span>
                    </div>
                    {day.kind === "review" ? (
                      <p className="mt-1 text-xs text-fg-muted">
                        {t("reviewDay")}
                      </p>
                    ) : (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {topics.map((topic) => (
                          <span
                            key={topic}
                            className="rounded-full bg-surface-sunken px-2 py-0.5 text-2xs text-fg-muted"
                          >
                            {topic}
                          </span>
                        ))}
                        <span className="px-1 py-0.5 text-2xs text-fg-faint">
                          {t("stepQuestions", { count: day.newQuestions })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
              return (
                <li key={day.index} className="pb-2">
                  {clickable ? (
                    <Link href={`/plan/day/${day.index}`} className="block">
                      {row}
                    </Link>
                  ) : (
                    row
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
