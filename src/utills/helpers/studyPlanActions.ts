import type { DayTestResult, SavedStudyPlan } from "@/lib/types/studyPlan";
import {
  STUDY_PLAN_DAY_MISTAKES_MAX,
  STUDY_PLAN_MAX_STEPS_PER_DAY,
  STUDY_PLAN_MISTAKES_TOTAL_MAX,
  STUDY_PLAN_SHIFT_MAX_DAYS,
} from "@/CONSTS/studyPlan";

/**
 * One progress change. Kept as data (not only applied) so a signed-in
 * user's unsaved changes can be applied again on top of a newer server
 * plan: after a 409 (another tab / device saved first) or after being
 * offline. Every action is idempotent, so sending one twice is harmless.
 */
export type PlanAction = (
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
  | { op: "fix"; day: number; questionId: number }
  /** Move the plan's dates: `shift` becomes at least `days`. */
  | { op: "shift"; days: number }
  /**
   * Record day content hashes and finished days (`withSync`): a day whose
   * known hash differs and that isn't finished starts fresh.
   */
  | {
      op: "sync";
      hashes: Record<string, string>;
      completed: Record<string, string>;
    }
) & {
  /**
   * `planIdentity` of the plan the action was made on. A queued action
   * replayed onto another plan (picked on another device meanwhile) is
   * skipped. Missing on actions queued before it existed.
   */
  plan?: string;
};

/** Which plan a saved plan is: category, length and start day. */
export function planIdentity(
  plan: Pick<SavedStudyPlan, "categoryId" | "dayCount" | "startDay">,
): string {
  return `${plan.categoryId}|${plan.dayCount}|${plan.startDay}`;
}

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
    case "shift":
      return withShift(prev, action.days);
    case "sync":
      return withSync(prev, action.hashes, action.completed);
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
  if (action.plan != null && action.plan !== planIdentity(plan)) return false;
  // Plan-wide ops; `withSync` drops days outside the plan itself.
  if (action.op === "shift" || action.op === "sync") return true;
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

/**
 * Sets how many days the plan was moved forward. Never lowers it, so two
 * devices moving the same plan (or a replayed action) agree; clamped to the
 * server's bound.
 */
export function withShift(prev: SavedStudyPlan, days: number): SavedStudyPlan {
  const next = Math.min(
    Math.max(0, Math.floor(days)),
    STUDY_PLAN_SHIFT_MAX_DAYS,
  );
  if (next <= (prev.shift ?? 0)) return prev;
  return { ...prev, shift: next };
}

const DAY_KEY = /^(0|[1-9]\d{0,2})$/;

/**
 * Day content hashes and finished days, decided against the plan as it is
 * now, so replaying it (after a 409 or offline) is safe:
 * - `completed`: set for days that have none (the first date stays);
 * - `hashes`: a day with no known hash just records it; a day whose known
 *   hash differs records the new one and, unless finished, starts fresh
 *   (its ticks, test and mistakes go: they pointed at the old steps).
 * Days outside the plan are skipped. Returns `prev` when nothing changes.
 */
export function withSync(
  prev: SavedStudyPlan,
  hashes: Record<string, string>,
  completed: Record<string, string>,
): SavedStudyPlan {
  const inPlan = (day: string) =>
    DAY_KEY.test(day) && Number(day) < prev.dayCount;
  const nextCompleted = { ...prev.completed };
  for (const [day, on] of Object.entries(completed)) {
    if (inPlan(day) && !nextCompleted[day]) nextCompleted[day] = on;
  }
  const nextHashes = { ...prev.dayHashes };
  const done = { ...prev.done };
  const tests = { ...prev.tests };
  const mistakes = { ...prev.mistakes };
  let changed =
    Object.keys(nextCompleted).length !==
    Object.keys(prev.completed ?? {}).length;
  for (const [day, hash] of Object.entries(hashes)) {
    const known = nextHashes[day];
    if (!inPlan(day) || known === hash) continue;
    if (known && !nextCompleted[day]) {
      delete done[day];
      delete tests[day];
      delete mistakes[day];
    }
    nextHashes[day] = hash;
    changed = true;
  }
  if (!changed) return prev;
  return {
    ...prev,
    done,
    tests,
    mistakes,
    dayHashes: nextHashes,
    completed: nextCompleted,
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
