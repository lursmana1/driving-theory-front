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

/** A short muted note under the plan summary (picker hints). */
export function PlanNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-control bg-surface-muted px-3 py-2 text-sm text-fg-muted">
      {children}
    </p>
  );
}

type PlanProgressBarProps = {
  value: number;
  max: number;
  /** `light`: white-on-accent, for the plan hero. */
  tone?: "accent" | "success" | "light";
  className?: string;
  /** Accessible name. Without it the bar is decorative (a text next to it says the same). */
  label?: string;
};

/** Thin progress bar (answered questions, finished steps). */
export function PlanProgressBar({
  value,
  max,
  tone = "accent",
  className = "h-1.5",
  label,
}: PlanProgressBarProps) {
  const share = max > 0 ? Math.min(1, value / max) : 0;
  const a11y = label
    ? {
        role: "progressbar",
        "aria-label": label,
        "aria-valuemin": 0,
        "aria-valuemax": max,
        "aria-valuenow": Math.min(value, max),
      }
    : { "aria-hidden": true };
  return (
    <div
      {...a11y}
      className={`overflow-hidden rounded-full ${
        tone === "light" ? "bg-on-accent/20" : "bg-surface-sunken"
      } ${className}`}
    >
      <div
        className={`h-full rounded-full transition-all motion-reduce:transition-none ${
          tone === "success"
            ? "bg-success"
            : tone === "light"
              ? "bg-on-accent"
              : "bg-accent"
        }`}
        style={{ width: `${share * 100}%` }}
      />
    </div>
  );
}

/**
 * Phone-only action bar pinned to the bottom (safe-area aware), so the day's
 * primary action stays reachable while the list scrolls. Pages that show it
 * add bottom padding (`pb-28`) so nothing hides behind it.
 */
export function PlanStickyBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-overlay backdrop-blur lg:hidden">
      <div className="mx-auto max-w-xl">{children}</div>
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
