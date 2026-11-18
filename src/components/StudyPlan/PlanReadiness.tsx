"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/UserContext";
import {
  getAttemptsHistory,
  resolveAttemptCategoryId,
} from "@/api/examAttempts";
import { PLAN_READY_MOCKS_IN_A_ROW } from "@/CONSTS/studyPlan";
import { subscribeStatsRefresh } from "@/lib/statsRefresh";
import { LineIcon } from "@/components/Icon/LineIcon";

type PlanReadinessProps = {
  /** Passed simulations in a row (`useMockStreak`); null for guests / loading. */
  streak: number | null;
  /** Tickets the plan has shown so far, out of `total`. */
  seen: number;
  total: number;
  daysDone: number;
  dayCount: number;
  className?: string;
};

/** Recent full exams of this category, newest first (signed-in users only). */
const HISTORY_PAGE = 20;

/**
 * Passed simulations in a row, counted from the newest finished attempt of
 * the category; null while loading or for guests. Call it once per page and
 * pass the value down, so two cards never fetch twice.
 */
export function useMockStreak(categoryId: number): number | null {
  const { user } = useAuth();
  const enabled = !!user;
  const [streak, setStreak] = useState<number | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(
    () => subscribeStatsRefresh(() => setRefreshToken((n) => n + 1)),
    [],
  );

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    void getAttemptsHistory(1, HISTORY_PAGE)
      .then((history) => {
        if (cancelled) return;
        const recent = history.data
          .filter(
            (a) =>
              a.completedAt &&
              a.passed != null &&
              resolveAttemptCategoryId(a) === categoryId,
          )
          .sort((a, b) => (a.completedAt! < b.completedAt! ? 1 : -1));
        let n = 0;
        for (const a of recent) {
          if (!a.passed) break;
          n++;
        }
        setStreak(n);
      })
      .catch(() => {
        if (!cancelled) setStreak(0);
      });
    return () => {
      cancelled = true;
    };
  }, [categoryId, enabled, refreshToken]);

  return enabled ? streak : null;
}

type Light = "started" | "almost" | "ready";

/**
 * Readiness light, the Fahren-Lernen model: yellow once every ticket was
 * seen, green once a few full simulations in a row were passed. Coverage
 * and readiness are two different things and the card says so.
 */
export function PlanReadiness({
  streak,
  seen,
  total,
  daysDone,
  dayCount,
  className = "",
}: PlanReadinessProps) {
  const t = useTranslations("StudyPlan");
  const { user } = useAuth();
  const covered = total > 0 && seen >= total;
  const mocksDone = Math.min(streak ?? 0, PLAN_READY_MOCKS_IN_A_ROW);
  const light: Light =
    mocksDone >= PLAN_READY_MOCKS_IN_A_ROW
      ? "ready"
      : covered
        ? "almost"
        : "started";

  const steps: { key: string; done: boolean; text: string }[] = [
    {
      key: "days",
      done: daysDone >= dayCount,
      text: t("readinessStepDays", { done: daysDone, total: dayCount }),
    },
    {
      key: "coverage",
      done: covered,
      text: t("readinessStepCoverage", { seen, total }),
    },
    {
      key: "mocks",
      done: light === "ready",
      text: t("readinessStepMocks", {
        count: PLAN_READY_MOCKS_IN_A_ROW,
        done: mocksDone,
      }),
    },
  ];

  const lightClass =
    light === "ready"
      ? "bg-success"
      : light === "almost"
        ? "bg-warning"
        : "bg-line-strong";

  return (
    <section
      aria-label={t("readinessTitle")}
      className={`space-y-3 rounded-card border border-line bg-surface p-4 shadow-card ${className}`}
    >
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className={`h-3 w-3 shrink-0 rounded-full ${lightClass}`}
        />
        <p className="text-sm font-semibold text-fg">{t("readinessTitle")}</p>
      </div>
      <ol className="space-y-1.5">
        {steps.map((step) => (
          <li key={step.key} className="flex items-start gap-2 text-xs">
            <span
              aria-hidden
              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                step.done
                  ? "bg-success text-on-accent"
                  : "border border-line text-transparent"
              }`}
            >
              <LineIcon name="check" className="h-3 w-3" strokeWidth={3} />
            </span>
            <span className={step.done ? "text-fg" : "text-fg-muted"}>
              {step.text}
              {step.done && (
                <span className="sr-only"> ({t("statusDone")})</span>
              )}
            </span>
          </li>
        ))}
      </ol>
      <p className="text-xs leading-relaxed text-fg-subtle">
        {light === "ready"
          ? t("readinessReady")
          : light === "almost"
            ? t("readinessAlmost")
            : t("readinessStarted")}
        {!user && ` ${t("readinessGuest")}`}
      </p>
    </section>
  );
}
