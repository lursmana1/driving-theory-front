import type { SavedStudyPlan } from "@/lib/types/studyPlan";
import {
  STUDY_PLAN_MAX_STEPS_PER_DAY,
  STUDY_PLAN_TEST_MAX_QUESTIONS,
} from "@/CONSTS/studyPlan";
import { withMistakes, withTest } from "./studyPlanActions";

/**
 * Two copies of the same plan in one browser: the account plan and a plan
 * in the guest key (a guest plan from before sign-in, or progress the old
 * frontend kept there while the account was unreachable).
 */

const STUDY_DAY = /^\d{4}-\d{2}-\d{2}$/;

/** Same plan choice: progress of one can be merged into the other. */
export function isSamePlan(a: SavedStudyPlan, b: SavedStudyPlan): boolean {
  return (
    a.categoryId === b.categoryId &&
    a.dayCount === b.dayCount &&
    a.startDay === b.startDay
  );
}

/**
 * Adds another copy's progress of the same plan (`isSamePlan`) to `prev`:
 * every done step (earliest date wins), the better test per day, and the
 * mistakes of both. Used once to recover progress the old frontend kept
 * only in this browser while the account couldn't be reached. The other
 * copy comes from browser storage, so anything out of shape is skipped and
 * the result always passes the server's checks. Returns `prev` itself when
 * nothing is added.
 */
export function mergeProgress(
  prev: SavedStudyPlan,
  other: SavedStudyPlan,
): SavedStudyPlan {
  const inPlan = (key: string, max: number) =>
    /^(0|[1-9]\d{0,2})$/.test(key) && Number(key) < max;
  let next = prev;

  for (const [day, steps] of Object.entries(other.done ?? {})) {
    if (!inPlan(day, prev.dayCount) || !steps || typeof steps !== "object") {
      continue;
    }
    for (const [step, on] of Object.entries(steps)) {
      if (!inPlan(step, STUDY_PLAN_MAX_STEPS_PER_DAY)) continue;
      if (typeof on !== "string" || !STUDY_DAY.test(on)) continue;
      const mine = next.done[day]?.[step];
      if (mine && mine <= on) continue;
      next = {
        ...next,
        done: { ...next.done, [day]: { ...next.done[day], [step]: on } },
      };
    }
  }

  for (const [day, test] of Object.entries(other.tests ?? {})) {
    if (!inPlan(day, prev.dayCount) || !test || typeof test !== "object") {
      continue;
    }
    const { correct, total, passed } = test;
    if (
      !Number.isInteger(correct) ||
      !Number.isInteger(total) ||
      correct < 0 ||
      correct > total ||
      total > STUDY_PLAN_TEST_MAX_QUESTIONS ||
      typeof passed !== "boolean"
    ) {
      continue;
    }
    next = withTest(next, Number(day), { correct, total, passed });
  }

  for (const [day, ids] of Object.entries(other.mistakes ?? {})) {
    if (!inPlan(day, prev.dayCount) || !Array.isArray(ids)) continue;
    const valid = ids.filter(
      (id): id is number => Number.isInteger(id) && id > 0,
    );
    if (valid.length) next = withMistakes(next, Number(day), valid);
  }
  return next;
}

/**
 * A plan found in the guest key when the account plan arrives:
 * - `moved`: the account has none (and nothing unsaved), so it moves there;
 * - `recovered`: the same plan, and it adds progress (`mergeProgress`);
 * - `same`: the same plan with nothing new (only cleared).
 * Null: nothing there, or another plan (e.g. someone else's guest plan on a
 * shared browser), left alone. `send` is the plan to save, if any.
 */
export function adoptBrowserPlan(
  serverPlan: SavedStudyPlan | null,
  browserPlan: SavedStudyPlan | null,
  unsaved: boolean,
): {
  kind: "moved" | "recovered" | "same";
  send: SavedStudyPlan | null;
} | null {
  if (!browserPlan) return null;
  if (!serverPlan) {
    return unsaved ? null : { kind: "moved", send: browserPlan };
  }
  if (!isSamePlan(serverPlan, browserPlan)) return null;
  const merged = mergeProgress(serverPlan, browserPlan);
  return merged === serverPlan
    ? { kind: "same", send: null }
    : { kind: "recovered", send: merged };
}
