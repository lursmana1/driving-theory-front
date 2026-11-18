"use client";

import { useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";

/** Query key of the open step on `/plan/day/[n]`: a step index or `mistakes`. */
export const PLAN_STEP_QUERY = "step";
export const PLAN_STEP_MISTAKES = "mistakes";
/** Old link form of the mistakes round, still accepted. */
const LEGACY_FIX_QUERY = "fix";

export type PlanStepParam = number | typeof PLAN_STEP_MISTAKES | null;

function parseStep(params: URLSearchParams): PlanStepParam {
  const raw = params.get(PLAN_STEP_QUERY);
  if (raw === PLAN_STEP_MISTAKES || params.get(LEGACY_FIX_QUERY) === "1") {
    return PLAN_STEP_MISTAKES;
  }
  return raw != null && /^\d+$/.test(raw) ? Number(raw) : null;
}

function urlWith(step: Exclude<PlanStepParam, null> | null): URL {
  const url = new URL(window.location.href);
  url.searchParams.delete(LEGACY_FIX_QUERY);
  if (step == null) url.searchParams.delete(PLAN_STEP_QUERY);
  else url.searchParams.set(PLAN_STEP_QUERY, String(step));
  return url;
}

/**
 * The day's open step lives in the URL (`?step=2`), so the phone's Back
 * (Android button, iOS swipe) closes the step instead of leaving the day,
 * and a refresh reopens it. Native `history` calls: Next keeps
 * `useSearchParams` in sync without a server round trip.
 */
export function usePlanStepParam() {
  const params = useSearchParams();
  const active = parseStep(new URLSearchParams(params.toString()));
  /** Whether this page pushed the step entry (then closing = Back). */
  const pushed = useRef(false);

  const open = useCallback(
    (step: Exclude<PlanStepParam, null>) => {
      const url = urlWith(step);
      // Step to step (test → mistakes round) replaces: one Back still
      // returns to the day.
      if (active == null) {
        window.history.pushState(null, "", url);
        pushed.current = true;
      } else {
        window.history.replaceState(null, "", url);
      }
    },
    [active],
  );

  const close = useCallback(() => {
    if (pushed.current) {
      pushed.current = false;
      window.history.back();
      return;
    }
    // Opened from a link (`?step=` / `?fix=1`): drop the param in place, so
    // Back still goes to the page the user came from.
    window.history.replaceState(null, "", urlWith(null));
  }, []);

  return { active, open, close };
}
