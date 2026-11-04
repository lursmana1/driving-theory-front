import type {
  PlanDay,
  PlanStepKind,
  SavedStudyPlan,
} from "@/lib/types/studyPlan";
import type { CategoryExamRules } from "@/CONSTS/categories";

/** Steps a day needs to count as done. Review and mock exams are extra. */
const REQUIRED_KINDS: ReadonlySet<PlanStepKind> = new Set([
  "learn",
  "mix",
  "test",
]);

/**
 * Study day `YYYY-MM-DD`: starts at 04:00 Tbilisi (UTC+4, no DST), which is
 * exactly 00:00 UTC, so it is the UTC date. Same rule as the backend.
 */
export function studyDayOf(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/** Milliseconds until the next study day starts (the next UTC midnight). */
export function msToNextStudyDay(now: number = Date.now()): number {
  const next = new Date(now);
  next.setUTCHours(24, 0, 0, 0);
  return next.getTime() - now;
}

export function isStepRequired(kind: PlanStepKind): boolean {
  return REQUIRED_KINDS.has(kind);
}

function doneSteps(saved: SavedStudyPlan, dayIndex: number) {
  return saved.done[String(dayIndex)] ?? {};
}

export function isStepDone(
  saved: SavedStudyPlan,
  dayIndex: number,
  stepIndex: number,
): boolean {
  return !!doneSteps(saved, dayIndex)[String(stepIndex)];
}

export function isDayDone(saved: SavedStudyPlan, day: PlanDay): boolean {
  const required = day.steps
    .map((step, i) => ({ step, i }))
    .filter(({ step }) => isStepRequired(step.kind));
  // Review days have no required step: done once any step is done.
  if (required.length === 0) {
    return Object.keys(doneSteps(saved, day.index)).length > 0;
  }
  return required.every(({ i }) => isStepDone(saved, day.index, i));
}

/** Study day on which the day's last step was done. */
function dayDoneOn(saved: SavedStudyPlan, dayIndex: number): string | null {
  const days = Object.values(doneSteps(saved, dayIndex));
  return days.length ? days.sort().at(-1)! : null;
}

export type DayStatus = "done" | "open" | "locked";

/**
 * One plan day per study day: day N opens only once day N−1 is done AND a
 * new study day has started since (04:00 Tbilisi). No bonus days, so new
 * material always gets a night's sleep in between.
 */
export function dayStatus(
  saved: SavedStudyPlan,
  days: PlanDay[],
  index: number,
  today: string,
): DayStatus {
  const day = days[index];
  if (!day) return "locked";
  if (isDayDone(saved, day)) return "done";
  if (index === 0) return "open";
  const prev = days[index - 1];
  if (!isDayDone(saved, prev)) return "locked";
  const prevOn = dayDoneOn(saved, prev.index);
  return prevOn && prevOn < today ? "open" : "locked";
}

/** First day that is not done (the plan's "today"), or null when finished. */
export function currentDayIndex(
  saved: SavedStudyPlan,
  days: PlanDay[],
): number | null {
  const day = days.find((d) => !isDayDone(saved, d));
  return day ? day.index : null;
}

/** Mistakes allowed in a day test: the category's exam ratio. */
export function dayTestAllowedMistakes(
  total: number,
  rules: CategoryExamRules,
): number {
  if (rules.totalQuestions <= 0) return 0;
  return Math.floor((total * rules.maxMistakes) / rules.totalQuestions);
}

/** 3 stars at ≤ half the allowed mistakes, 2 at ≤ allowed (pass), else 1. */
export function dayTestStars(mistakes: number, allowed: number): 1 | 2 | 3 {
  if (mistakes <= allowed / 2) return 3;
  if (mistakes <= allowed) return 2;
  return 1;
}
