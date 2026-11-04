"use client";

import { useTranslations } from "next-intl";
import { examCtaPillBase } from "@/layoutComponents/Header/headerStyles";

/** Big number over a small label (picker summary, day test intro). */
export function PlanStat({
  value,
  label,
}: {
  value: React.ReactNode;
  label: string;
}) {
  return (
    <div className="rounded-control bg-surface-muted px-3 py-3 text-center">
      <p className="text-2xl font-bold tabular-nums text-fg">{value}</p>
      <p className="text-2xs text-fg-subtle">{label}</p>
    </div>
  );
}

type PlanProgressBarProps = {
  value: number;
  max: number;
  tone?: "accent" | "success";
  className?: string;
};

/** Thin progress bar (answered questions, finished steps). */
export function PlanProgressBar({
  value,
  max,
  tone = "accent",
  className = "h-1.5",
}: PlanProgressBarProps) {
  const share = max > 0 ? Math.min(1, value / max) : 0;
  return (
    <div
      className={`overflow-hidden rounded-full bg-surface-sunken ${className}`}
    >
      <div
        className={`h-full rounded-full transition-all ${
          tone === "success" ? "bg-success" : "bg-accent"
        }`}
        style={{ width: `${share * 100}%` }}
      />
    </div>
  );
}

/** "Could not load the plan" + retry. */
export function PlanLoadError({
  onRetry,
  className = "",
}: {
  onRetry: () => void;
  className?: string;
}) {
  const t = useTranslations("StudyPlan");
  return (
    <div className={`space-y-3 text-center ${className}`}>
      <p className="text-sm text-danger">{t("error")}</p>
      <button
        type="button"
        onClick={onRetry}
        className={`h-10 px-5 text-sm ${examCtaPillBase}`}
      >
        {t("retry")}
      </button>
    </div>
  );
}
