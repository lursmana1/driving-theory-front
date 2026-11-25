"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  examCtaPillBase,
  outlinePillBase,
} from "@/layoutComponents/Header/headerStyles";
import { LineIcon } from "@/components/Icon/LineIcon";

const backClass =
  "-ml-2 inline-flex h-11 items-center gap-1.5 rounded-full pr-3 pl-2 text-sm font-medium text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg";

/** The plan's back control: a 44 px target, a link or a button. */
export function PlanBackButton({
  href,
  onClick,
  children,
}: {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const content = (
    <>
      <LineIcon name="arrowLeft" className="h-5 w-5" />
      {children}
    </>
  );
  return href ? (
    <Link href={href} className={backClass}>
      {content}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={backClass}>
      {content}
    </button>
  );
}

type PlanConfirmSheetProps = {
  open: boolean;
  title: string;
  body: string;
  /** Safe choice, gets the focus (and Esc / backdrop). */
  stayLabel: string;
  leaveLabel: string;
  onStay: () => void;
  onLeave: () => void;
};

/**
 * In-page confirm (never `window.confirm`, which blocks the tab): a bottom
 * sheet on phones, a centred dialog from `sm:`.
 */
export function PlanConfirmSheet({
  open,
  title,
  body,
  stayLabel,
  leaveLabel,
  onStay,
  onLeave,
}: PlanConfirmSheetProps) {
  const stayRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    stayRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onStay();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      previous?.focus?.({ preventScroll: true });
    };
  }, [open, onStay]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-fg/40" aria-hidden onClick={onStay} />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="plan-confirm-title"
        aria-describedby="plan-confirm-body"
        className="relative w-full max-w-md space-y-4 rounded-t-panel bg-surface p-5 pb-safe-sheet shadow-overlay sm:rounded-panel sm:p-6"
      >
        <div className="space-y-1.5">
          <h2 id="plan-confirm-title" className="text-lg font-bold text-fg">
            {title}
          </h2>
          <p id="plan-confirm-body" className="text-sm text-fg-muted">
            {body}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row-reverse">
          <button
            ref={stayRef}
            type="button"
            onClick={onStay}
            className={`h-12 px-6 text-base sm:h-11 sm:text-sm ${examCtaPillBase}`}
          >
            {stayLabel}
          </button>
          <button
            type="button"
            onClick={onLeave}
            className={`h-12 px-6 text-danger sm:h-11 ${outlinePillBase}`}
          >
            {leaveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

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
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 px-4 pt-3 pb-safe-bar shadow-overlay backdrop-blur lg:hidden">
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

/**
 * Days that started fresh because their tickets changed (`usePlanSync`).
 * Shown once, while the page is open.
 */
export function PlanUpdatedNotice({
  days,
  className = "",
}: {
  /** 0-based day indexes. */
  days: readonly number[];
  className?: string;
}) {
  const t = useTranslations("StudyPlan");
  if (days.length === 0) return null;
  return (
    <p
      role="status"
      className={`rounded-card border border-line bg-surface-muted px-4 py-3 text-sm text-fg-muted ${className}`}
    >
      {t("daysUpdated", {
        count: days.length,
        days: days.map((d) => d + 1).join(", "),
      })}
    </p>
  );
}
