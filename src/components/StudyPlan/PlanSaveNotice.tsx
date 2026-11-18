"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { StudyPlanMode } from "@/utills/helpers/hooks/useStudyPlan";
import { LineIcon } from "@/components/Icon/LineIcon";

export type PlanSaveState = {
  mode: StudyPlanMode;
  offline?: boolean;
  saveFailed?: boolean;
};

type PlanSaveNoticeProps = PlanSaveState & { className?: string };

/** Where the plan is kept: this browser (guest) or the account. */
export function PlanSaveNotice({
  mode,
  offline,
  saveFailed,
  className = "",
}: PlanSaveNoticeProps) {
  const t = useTranslations("StudyPlan");

  if (saveFailed || offline) {
    return (
      <p className={`text-xs text-warning-strong ${className}`}>
        {saveFailed ? t("saveFailedNotice") : t("offlineNotice")}
      </p>
    );
  }
  if (mode === "account") {
    return (
      <p className={`text-xs text-fg-subtle ${className}`}>
        <LineIcon
          name="cloud"
          className="mr-1 inline h-4 w-4 align-text-bottom"
        />
        {t("accountNotice")}
      </p>
    );
  }
  return (
    <p className={`text-xs text-fg-subtle ${className}`}>
      {t("localNotice")}{" "}
      <Link href="/auth" className="font-semibold text-accent hover:underline">
        {t("signInToSave")}
        <LineIcon
          name="arrowRight"
          className="ml-1 inline h-3.5 w-3.5 align-text-bottom"
        />
      </Link>
    </p>
  );
}
