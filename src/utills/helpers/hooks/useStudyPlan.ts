"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { useAuth } from "@/contexts/UserContext";
import { deleteMyPlan, getMyPlan, saveMyPlan } from "@/api/studyPlans";
import type { DayTestResult, SavedStudyPlan } from "@/lib/types/studyPlan";
import { studyDayOf } from "@/utills/helpers/studyPlanProgress";

/**
 * Two modes, one API:
 * - guest: the plan lives in this browser (localStorage);
 * - signed in: the plan lives on the server (`/study-plans/me`), so it
 *   follows the user to any device. A guest plan is moved to the account
 *   the first time the user signs in without a server plan.
 * If the server can't be reached, a signed-in user falls back to the
 * browser copy instead of losing the page.
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

// ---- account store (server), shared by every hook instance ----

type AccountState = {
  userId: number;
  status: "loading" | "ready" | "failed";
  plan: SavedStudyPlan | null;
  saveFailed: boolean;
};

let account: AccountState | null = null;
const accountListeners = new Set<() => void>();
/** Saves go out one after another, so the last write always wins. */
let saveQueue: Promise<void> = Promise.resolve();

function setAccount(next: AccountState) {
  account = next;
  accountListeners.forEach((fn) => fn());
}

const getAccount = () => account;
const getServerAccount = () => null;

function subscribeAccount(onChange: () => void) {
  accountListeners.add(onChange);
  return () => {
    accountListeners.delete(onChange);
  };
}

function loadAccount(userId: number) {
  if (account?.userId === userId && account.status !== "failed") return;
  setAccount({ userId, status: "loading", plan: null, saveFailed: false });
  void (async () => {
    try {
      let plan = await getMyPlan();
      const guestPlan = parse(readRaw());
      if (!plan && guestPlan) {
        // First sign-in with a guest plan: move it to the account.
        await saveMyPlan(guestPlan);
        writeLocal(null);
        plan = guestPlan;
      }
      if (account?.userId === userId) {
        setAccount({ userId, status: "ready", plan, saveFailed: false });
      }
    } catch {
      if (account?.userId === userId) {
        setAccount({ userId, status: "failed", plan: null, saveFailed: false });
      }
    }
  })();
}

function commitAccount(userId: number, plan: SavedStudyPlan | null) {
  if (account?.userId !== userId) return;
  setAccount({ ...account, plan, saveFailed: false });
  saveQueue = saveQueue
    .then(() => (plan ? saveMyPlan(plan) : deleteMyPlan()))
    .catch(() => {
      if (account?.userId === userId) {
        setAccount({ ...account, saveFailed: true });
      }
    });
}

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
    if (userId != null) loadAccount(userId);
  }, [userId]);

  const accountForUser =
    userId != null && accountState?.userId === userId ? accountState : null;
  const mode: StudyPlanMode =
    accountForUser && accountForUser.status !== "failed" ? "account" : "guest";
  const ready =
    localRaw !== NOT_READ &&
    !authLoading &&
    (userId == null ||
      (accountForUser != null && accountForUser.status !== "loading"));
  const plan = mode === "account" ? (accountForUser?.plan ?? null) : localPlan;

  const commit = useCallback(
    (next: SavedStudyPlan | null) => {
      if (mode === "account" && userId != null) commitAccount(userId, next);
      else writeLocal(next);
    },
    [mode, userId],
  );

  /** Reads the latest stored plan, so quick updates never overwrite each other. */
  const update = useCallback(
    (fn: (prev: SavedStudyPlan) => SavedStudyPlan) => {
      const current =
        mode === "account" ? (account?.plan ?? null) : parse(readRaw());
      if (!current) return;
      const next = fn(current);
      // Unchanged (e.g. a mistake already listed): no save round-trip.
      if (next !== current) commit(next);
    },
    [mode, commit],
  );

  const start = useCallback(
    (input: StudyPlanChoice) =>
      commit({ version: 1, ...input, done: {}, tests: {}, mistakes: {} }),
    [commit],
  );

  const reset = useCallback(() => commit(null), [commit]);

  const markStepDone = useCallback(
    (dayIndex: number, stepIndex: number) =>
      update((prev) => withStepDone(prev, dayIndex, stepIndex, studyDayOf())),
    [update],
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
      const today = studyDayOf();
      update((prev) => {
        const next = withMistakes(
          withTest(prev, dayIndex, result),
          dayIndex,
          wrongIds,
        );
        return result.passed
          ? withStepDone(next, dayIndex, stepIndex, today)
          : next;
      });
    },
    [update],
  );

  /** Adds question ids to the day's mistakes (no duplicates). */
  const addMistakes = useCallback(
    (dayIndex: number, ids: number[]) =>
      update((prev) => withMistakes(prev, dayIndex, ids)),
    [update],
  );

  /** Removes a fixed question (answered right in the mistakes round). */
  const fixMistake = useCallback(
    (dayIndex: number, id: number) =>
      update((prev) => withoutMistake(prev, dayIndex, id)),
    [update],
  );

  return {
    plan,
    ready,
    mode,
    /** Signed in but the server couldn't be reached: using the browser copy. */
    offline: userId != null && accountForUser?.status === "failed",
    saveFailed: accountForUser?.saveFailed ?? false,
    start,
    reset,
    markStepDone,
    recordTest,
    addMistakes,
    fixMistake,
  };
}

// Pure progress updates. Each returns `prev` itself when nothing changes, so
// `update` can skip the save.

function withStepDone(
  prev: SavedStudyPlan,
  dayIndex: number,
  stepIndex: number,
  today: string,
): SavedStudyPlan {
  const day = String(dayIndex);
  const step = String(stepIndex);
  if (prev.done[day]?.[step]) return prev;
  return {
    ...prev,
    done: { ...prev.done, [day]: { ...prev.done[day], [step]: today } },
  };
}

/** Keeps the best try, so a weaker retry never lowers the day's score. */
function withTest(
  prev: SavedStudyPlan,
  dayIndex: number,
  result: DayTestResult,
): SavedStudyPlan {
  const key = String(dayIndex);
  const best = prev.tests[key];
  if (best && best.correct >= result.correct) return prev;
  return { ...prev, tests: { ...prev.tests, [key]: result } };
}

function withMistakes(
  prev: SavedStudyPlan,
  dayIndex: number,
  ids: number[],
): SavedStudyPlan {
  const key = String(dayIndex);
  const list = prev.mistakes?.[key] ?? [];
  const merged = [...new Set([...list, ...ids])];
  if (merged.length === list.length) return prev;
  return { ...prev, mistakes: { ...prev.mistakes, [key]: merged } };
}

function withoutMistake(
  prev: SavedStudyPlan,
  dayIndex: number,
  id: number,
): SavedStudyPlan {
  const key = String(dayIndex);
  const list = prev.mistakes?.[key] ?? [];
  if (!list.includes(id)) return prev;
  const mistakes = { ...prev.mistakes };
  const rest = list.filter((x) => x !== id);
  if (rest.length) mistakes[key] = rest;
  else delete mistakes[key];
  return { ...prev, mistakes };
}
