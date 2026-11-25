import type { PlanHistoryItem, SavedStudyPlan } from "@/lib/types/studyPlan";

/**
 * Plans a user left (picked another plan or reset). Signed in: the server
 * keeps them (GET /study-plans/history). Guests: the last few live in this
 * browser, in the same shape.
 */

const STORAGE_KEY = "prava.studyPlan.history.v1";
/** Same as the server's `STUDY_PLAN_HISTORY_LIMIT`. */
export const PLAN_HISTORY_LIMIT = 10;

/** Only plans the user did something in are kept (same rule as the server). */
export function hasPlanProgress(plan: SavedStudyPlan): boolean {
  return (
    Object.keys(plan.done).length > 0 || Object.keys(plan.tests).length > 0
  );
}

/** Summary of a plan being left; same fields as the server's history view. */
export function toHistoryItem(
  plan: SavedStudyPlan,
  endedAt: string,
): PlanHistoryItem {
  return {
    categoryId: plan.categoryId,
    dayCount: plan.dayCount,
    startDay: plan.startDay,
    examDay: plan.examDay,
    endedAt,
    daysActive: Object.values(plan.done).filter(
      (steps) => Object.keys(steps).length > 0,
    ).length,
    daysCompleted: Object.keys(plan.completed ?? {}).length,
  };
}

function isHistoryItem(v: unknown): v is PlanHistoryItem {
  const x = v as Partial<PlanHistoryItem> | null;
  return (
    !!x &&
    Number.isInteger(x.categoryId) &&
    Number.isInteger(x.dayCount) &&
    typeof x.startDay === "string" &&
    typeof x.endedAt === "string" &&
    Number.isInteger(x.daysActive) &&
    Number.isInteger(x.daysCompleted)
  );
}

/** Guest history, newest first; anything out of shape is dropped. */
export function readLocalHistory(): PlanHistoryItem[] {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "[]",
    );
    return Array.isArray(parsed) ? parsed.filter(isHistoryItem) : [];
  } catch {
    return [];
  }
}

/** Adds a left guest plan in front (when it has progress), keeping the last few. */
export function pushLocalHistory(plan: SavedStudyPlan, endedAt: string) {
  if (!hasPlanProgress(plan)) return;
  try {
    const next = [toHistoryItem(plan, endedAt), ...readLocalHistory()].slice(
      0,
      PLAN_HISTORY_LIMIT,
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Private mode / storage full: the history just isn't kept.
  }
}
