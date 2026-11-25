"use client";

import { useLocale, useTranslations } from "next-intl";
import { getCategoryById } from "@/CONSTS/categories";
import {
  useStudyPlan,
  type StudyPlanMode,
} from "@/utills/helpers/hooks/useStudyPlan";
import { usePlanHistory } from "@/utills/helpers/hooks/usePlanHistory";
import { formatPlanDayLong } from "./planDates";

type PlanHistoryListProps = {
  /** Null while the plan's mode isn't known yet (nothing is loaded). */
  mode: StudyPlanMode | null;
  className?: string;
};

/**
 * Plans the user left (picked another or reset), newest first. Hidden when
 * there are none. Copy in `Profile.*` (a client namespace on every page),
 * since it shows on `/plan` and `/profile`.
 */
export function PlanHistoryList({
  mode,
  className = "",
}: PlanHistoryListProps) {
  const t = useTranslations("Profile");
  const locale = useLocale();
  const { unsaved } = useStudyPlan();
  const items = usePlanHistory(mode, unsaved);
  if (!items || items.length === 0) return null;

  return (
    <section
      aria-labelledby="plan-history-title"
      className={`space-y-3 rounded-card border border-line bg-surface p-4 shadow-card sm:p-5 ${className}`}
    >
      <h2 id="plan-history-title" className="text-base font-bold text-fg">
        {t("planHistoryTitle")}
      </h2>
      <ul className="divide-y divide-line">
        {items.map((item) => (
          <li
            key={`${item.endedAt}-${item.startDay}`}
            className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2.5 text-sm"
          >
            <span className="font-medium text-fg">
              {t("planHistoryName", {
                category: getCategoryById(item.categoryId)?.name ?? "",
                days: item.dayCount,
              })}
            </span>
            <span className="text-fg-muted">
              {t("planHistoryDates", {
                start: formatPlanDayLong(item.startDay, locale),
                end: formatPlanDayLong(item.endedAt.slice(0, 10), locale),
              })}
              {" · "}
              {item.daysCompleted > 0
                ? t("planHistoryCompleted", {
                    done: item.daysCompleted,
                    total: item.dayCount,
                  })
                : t("planHistoryActive", { count: item.daysActive })}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
