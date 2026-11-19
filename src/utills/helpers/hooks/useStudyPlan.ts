"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { useAuth } from "@/contexts/UserContext";
import type { DayTestResult, SavedStudyPlan } from "@/lib/types/studyPlan";
import { studyDayOf } from "@/utills/helpers/studyPlanProgress";
import {
  applyAction,
  type PlanAction,
} from "@/utills/helpers/studyPlanActions";
import {
  accountPlan,
  clearAccount,
  getAccount,
  getServerAccount,
  loadAccount,
  queueAction,
  replacePlan,
  retryAccountNow,
  subscribeAccount,
  type GuestHandoff,
} from "@/utills/helpers/studyPlanAccount";
import { trackPlanEvent } from "@/utills/helpers/planAnalytics";

/**
 * Two modes, one API:
 * - guest: the plan lives in this browser (localStorage);
 * - signed in: the plan lives on the server (`/study-plans/me`), so it
 *   follows the user to any device (`studyPlanAccount.ts`). Unsaved changes
 *   wait in this browser and go out when the server is reachable; a guest
 *   plan moves to the account on the first sign-in without a server plan.
 */

// ---- guest store (localStorage) ----

const STORAGE_KEY = "prava.studyPlan.v1";
const LOCAL_EVENT = "prava:study-plan";
/** Server render / before hydration: not read yet. */
const NOT_READ = "\u0000";

const getServerRaw = () => NOT_READ;

function readRaw(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function parse(raw: string): SavedStudyPlan | null {
  if (!raw || raw === NOT_READ) return null;
  try {
    const parsed = JSON.parse(raw) as SavedStudyPlan;
    return parsed?.version === 1 ? parsed : null;
  } catch {
    return null;
  }
}

function writeLocal(plan: SavedStudyPlan | null) {
  try {
    if (plan) localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Private mode / storage full: progress just isn't kept.
  }
  window.dispatchEvent(new Event(LOCAL_EVENT));
}

function subscribeLocal(onChange: () => void) {
  window.addEventListener(LOCAL_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(LOCAL_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

const guestHandoff: GuestHandoff = {
  read: () => parse(readRaw()),
  clear: () => writeLocal(null),
};

// ---- hook ----

/** What the picker chooses; progress starts empty. */
export type StudyPlanChoice = Pick<
  SavedStudyPlan,
  "categoryId" | "dayCount" | "startDay" | "examDay"
>;

export type StudyPlanMode = "guest" | "account";

export function useStudyPlan() {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id ?? null;

  const localRaw = useSyncExternalStore(subscribeLocal, readRaw, getServerRaw);
  const localPlan = useMemo(() => parse(localRaw), [localRaw]);
  const accountState = useSyncExternalStore(
    subscribeAccount,
    getAccount,
    getServerAccount,
  );

  useEffect(() => {
    if (userId != null) loadAccount(userId, guestHandoff);
    // Signed out: drop the plan in memory, so the next sign-in fetches
    // afresh and nothing of the old user lingers in this tab.
    else if (!authLoading) clearAccount();
  }, [userId, authLoading]);

  const accountForUser =
    userId != null && accountState?.userId === userId ? accountState : null;
  const mode: StudyPlanMode = userId != null ? "account" : "guest";
  const ready =
    localRaw !== NOT_READ &&
    !authLoading &&
    (userId == null ||
      (accountForUser != null && accountForUser.status !== "loading"));
  const shownAccountPlan = useMemo(
    () => (accountForUser ? accountPlan(accountForUser) : null),
    [accountForUser],
  );
  const plan = mode === "account" ? shownAccountPlan : localPlan;
  const offline = accountForUser?.status === "offline";

  /** Applies one change; false when it changed nothing. */
  const act = useCallback(
    (action: PlanAction): boolean => {
      if (mode === "account" && userId != null) {
        return queueAction(userId, action);
      }
      const current = parse(readRaw());
      if (!current) return false;
      const next = applyAction(current, action);
      if (next === current) return false;
      writeLocal(next);
      return true;
    },
    [mode, userId],
  );

  const replace = useCallback(
    (next: SavedStudyPlan | null) => {
      if (mode === "account" && userId != null) replacePlan(userId, next);
      else writeLocal(next);
    },
    [mode, userId],
  );

  const start = useCallback(
    (input: StudyPlanChoice) => {
      replace({ version: 1, ...input, done: {}, tests: {}, mistakes: {} });
      trackPlanEvent("plan_start", {
        category: input.categoryId,
        days: input.dayCount,
        length: input.examDay ? "examDate" : "preset",
        mode,
      });
    },
    [replace, mode],
  );

  const reset = useCallback(() => {
    replace(null);
    trackPlanEvent("plan_reset", { mode });
  }, [replace, mode]);

  const markStepDone = useCallback(
    (dayIndex: number, stepIndex: number) => {
      const changed = act({
        op: "step",
        day: dayIndex,
        step: stepIndex,
        on: studyDayOf(),
      });
      if (changed) {
        trackPlanEvent("plan_step_done", { day: dayIndex + 1, mode });
      }
    },
    [act, mode],
  );

  /**
   * A finished day test, saved in one write: the best try, its wrong answers
   * as day mistakes, and the step done only when it passed.
   */
  const recordTest = useCallback(
    (
      dayIndex: number,
      stepIndex: number,
      result: DayTestResult,
      wrongIds: number[],
    ) => {
      act({
        op: "test",
        day: dayIndex,
        step: stepIndex,
        result,
        wrongIds,
        on: studyDayOf(),
      });
      trackPlanEvent("plan_day_test", {
        day: dayIndex + 1,
        passed: result.passed,
        score:
          result.total > 0
            ? Math.round((result.correct / result.total) * 100)
            : 0,
        mode,
      });
    },
    [act, mode],
  );

  /** Adds question ids to the day's mistakes (no duplicates). */
  const addMistakes = useCallback(
    (dayIndex: number, ids: number[]) => {
      act({ op: "mistakes", day: dayIndex, ids });
    },
    [act],
  );

  /** Removes a fixed question (answered right in the mistakes round). */
  const fixMistake = useCallback(
    (dayIndex: number, questionId: number) => {
      act({ op: "fix", day: dayIndex, questionId });
    },
    [act],
  );

  return {
    plan,
    ready,
    mode,
    /** Signed in but the server can't be reached: showing the browser copy. */
    offline,
    /** Offline with no copy of the plan in this browser: nothing to show. */
    unreachable: offline && !accountForUser?.known,
    saveFailed: accountForUser?.saveFailed ?? false,
    /** Try the server again now (after `offline` / `saveFailed`). */
    retry: retryAccountNow,
    start,
    reset,
    markStepDone,
    recordTest,
    addMistakes,
    fixMistake,
  };
}
