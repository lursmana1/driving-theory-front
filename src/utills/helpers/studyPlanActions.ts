import type { DayTestResult, SavedStudyPlan } from "@/lib/types/studyPlan";
import {
  STUDY_PLAN_DAY_MISTAKES_MAX,
  STUDY_PLAN_MAX_STEPS_PER_DAY,
  STUDY_PLAN_MISTAKES_TOTAL_MAX,
} from "@/CONSTS/studyPlan";

/**
 * One progress change. Kept as data (not only applied) so a signed-in
 * user's unsaved changes can be applied again on top of a newer server
 * plan: after a 409 (another tab / device saved first) or after being
 * offline. Every action is idempotent, so sending one twice is harmless.
 */
export type PlanAction =
  | { op: "step"; day: number; step: number; on: string }
  | {
      op: "test";
      day: number;
      step: number;
      result: DayTestResult;
      wrongIds: number[];
      on: string;
    }
  | { op: "mistakes"; day: number; ids: number[] }
  | { op: "fix"; day: number; questionId: number };

/** Returns `prev` itself when the action changes nothing. */
export function applyAction(
  prev: SavedStudyPlan,
  action: PlanAction,
): SavedStudyPlan {
  switch (action.op) {
    case "step":
      return withStepDone(prev, action.day, action.step, action.on);
    case "test": {
      // One write: the best try, its wrong answers as day mistakes, and the
      // step done only when it passed.
      const next = withMistakes(
        withTest(prev, action.day, action.result),
        action.day,
        action.wrongIds,
      );
      return action.result.passed
        ? withStepDone(next, action.day, action.step, action.on)
        : next;
    }
    case "mistakes":
      return withMistakes(prev, action.day, action.ids);
    case "fix":
      return withoutMistake(prev, action.day, action.questionId);
  }
}

/** Applies the actions in order; no plan stays no plan. */
export function replayActions(
  plan: SavedStudyPlan | null,
  actions: readonly PlanAction[],
): SavedStudyPlan | null {
  if (!plan) return null;
  return actions.reduce(
    (current, action) =>
      isActionInPlan(current, action) ? applyAction(current, action) : current,
    plan,
  );
}

/**
 * An action recorded against one plan can meet another one on replay (the
 * user picked a new plan on another device): skip what doesn't fit it, so
 * the save is never rejected.
 */
function isActionInPlan(plan: SavedStudyPlan, action: PlanAction): boolean {
  if (action.day < 0 || action.day >= plan.dayCount) return false;
  return (
    !("step" in action) ||
    (action.step >= 0 && action.step < STUDY_PLAN_MAX_STEPS_PER_DAY)
  );
}

export function withStepDone(
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
export function withTest(
  prev: SavedStudyPlan,
  dayIndex: number,
  result: DayTestResult,
): SavedStudyPlan {
  const key = String(dayIndex);
  const best = prev.tests[key];
  if (best && best.correct >= result.correct) return prev;
  return { ...prev, tests: { ...prev.tests, [key]: result } };
}

/**
 * Adds ids to the day's list (no duplicates), within the server's caps:
 * the newest stay, the oldest of this day go first, then of the earliest
 * other days, so a save is never rejected.
 */
export function withMistakes(
  prev: SavedStudyPlan,
  dayIndex: number,
  ids: number[],
): SavedStudyPlan {
  const key = String(dayIndex);
  const list = prev.mistakes?.[key] ?? [];
  const merged = [...new Set([...list, ...ids])].slice(
    -STUDY_PLAN_DAY_MISTAKES_MAX,
  );
  if (
    merged.length === list.length &&
    merged.every((id, i) => id === list[i])
  ) {
    return prev;
  }
  const mistakes = { ...prev.mistakes, [key]: merged };
  let total = Object.values(mistakes).reduce((n, l) => n + l.length, 0);
  for (const other of Object.keys(mistakes).sort(
    (a, b) => Number(a) - Number(b),
  )) {
    if (total <= STUDY_PLAN_MISTAKES_TOTAL_MAX) break;
    if (other === key) continue;
    const drop = Math.min(
      mistakes[other].length,
      total - STUDY_PLAN_MISTAKES_TOTAL_MAX,
    );
    total -= drop;
    const rest = mistakes[other].slice(drop);
    if (rest.length) mistakes[other] = rest;
    else delete mistakes[other];
  }
  return { ...prev, mistakes };
}

export function withoutMistake(
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
