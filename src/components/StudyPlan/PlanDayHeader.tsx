"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LineIcon } from "@/components/Icon/LineIcon";
import { PlanProgressBar } from "./PlanPrimitives";
import { usePlanDateFormat } from "./planLabels";

type PlanDayHeaderProps = {
  index: number;
  dayCount: number;
  /** `YYYY-MM-DD` of this day in the user's plan. */
  date: string;
  requiredDone: number;
  requiredTotal: number;
};

/** Back link, date, "Day n / total" and the required-steps bar. */
export function PlanDayHeader({
  index,
  dayCount,
  date,
  requiredDone,
  requiredTotal,
}: PlanDayHeaderProps) {
  const t = useTranslations("StudyPlan");
  const formatDay = usePlanDateFormat();

  return (
    <div className="space-y-3">
      <Link
        href="/plan"
        className="inline-flex items-center gap-1 text-sm text-fg-subtle hover:text-fg"
      >
        <LineIcon name="arrowLeft" className="h-4 w-4" />
        {t("backToPlan")}
      </Link>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">
          {formatDay(date)}
        </p>
        <h1 className="text-2xl font-bold text-fg sm:text-3xl">
          {t("dayOfTotal", { n: index + 1, total: dayCount })}
        </h1>
      </div>
      {requiredTotal > 0 && (
        <div>
          <PlanProgressBar
            value={requiredDone}
            max={requiredTotal}
            tone="success"
            className="h-2"
            label={t("stepsDone", { done: requiredDone, total: requiredTotal })}
          />
          <p className="mt-1.5 text-xs text-fg-subtle">
            {t("stepsDone", { done: requiredDone, total: requiredTotal })}
          </p>
        </div>
      )}
    </div>
  );
}
