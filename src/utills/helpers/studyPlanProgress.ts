import type {
  PlanDay,
  PlanStepKind,
  SavedStudyPlan,
} from "@/lib/types/studyPlan";
import type { CategoryExamRules } from "@/CONSTS/categories";
import { PLAN_TEST_STRICTNESS } from "@/CONSTS/studyPlan";

/** Steps a day needs to count as done. Review, mock exams and `extra` rounds are optional. */
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

/**
 * A step counts once it is marked done; the day test also needs a passed
 * try (plans saved before this rule marked failed tests done too).
 */
export function isStepComplete(
  saved: SavedStudyPlan,
  dayIndex: number,
  stepIndex: number,
  kind: PlanStepKind,
): boolean {
  if (!isStepDone(saved, dayIndex, stepIndex)) return false;
  return kind !== "test" || !!saved.tests[String(dayIndex)]?.passed;
}

/** Short plans: tickets done in the optional `extra` rounds. */
export function extraTicketsDone(
  saved: SavedStudyPlan,
  days: readonly PlanDay[],
): number {
  return days.reduce(
    (n, day) =>
      n +
      day.steps.reduce(
        (m, step, i) =>
          step.kind === "extra" &&
          isStepComplete(saved, day.index, i, step.kind)
            ? m + step.questionCount
            : m,
        0,
      ),
    0,
  );
}

/**
 * Tickets the plan has shown so far: the new tickets of done lessons, the
 * carried extras of passed day tests, and done mix / extra rounds. Against
 * `totalQuestions` it is the "ticket coverage" the extra rounds fill up.
 */
export function planCoverage(
  saved: SavedStudyPlan,
  days: readonly PlanDay[],
): number {
  return days.reduce(
    (n, day) =>
      n +
      day.steps.reduce((m, step, i) => {
        if (!isStepComplete(saved, day.index, i, step.kind)) return m;
        if (step.kind === "test") return m + (step.examParts?.carry ?? 0);
        if (
          step.kind === "learn" ||
          step.kind === "mix" ||
          step.kind === "extra"
        ) {
          return m + step.questionCount;
        }
        return m;
      }, 0),
    0,
  );
}

/** Index of the day's extra round while it is not done yet; null otherwise. */
export function openExtraStep(
  saved: SavedStudyPlan,
  day: Pick<PlanDay, "index" | "steps">,
): number | null {
  const i = day.steps.findIndex((s) => s.kind === "extra");
  if (i === -1 || isStepComplete(saved, day.index, i, "extra")) return null;
  return i;
}

/** `true` / `false` for a day with an extra round, `null` for one without. */
export function extraRoundDone(
  saved: SavedStudyPlan,
  day: Pick<PlanDay, "index" | "steps">,
): boolean | null {
  const i = day.steps.findIndex((s) => s.kind === "extra");
  if (i === -1) return null;
  return isStepComplete(saved, day.index, i, "extra");
}

export function isDayDone(saved: SavedStudyPlan, day: PlanDay): boolean {
  const required = day.steps
    .map((step, i) => ({ step, i }))
    .filter(({ step }) => isStepRequired(step.kind));
  // Review days have no required step: done once any step is done.
  if (required.length === 0) {
    return Object.keys(doneSteps(saved, day.index)).length > 0;
  }
  return required.every(({ step, i }) =>
    isStepComplete(saved, day.index, i, step.kind),
  );
}

/** Question ids answered wrong on a plan day and not fixed yet. */
export function dayMistakes(saved: SavedStudyPlan, dayIndex: number): number[] {
  return saved.mistakes?.[String(dayIndex)] ?? [];
}

/**
 * Study day on which the day was finished: when its last required step was
 * done. Optional rounds (mock exam, extra tickets) done later don't move it,
 * so finishing one never re-locks the next day. Review days have no
 * required step: their first done step counts.
 */
function dayDoneOn(saved: SavedStudyPlan, day: PlanDay): string | null {
  const done = doneSteps(saved, day.index);
  const required = day.steps
    .map((step, i) => ({ step, i }))
    .filter(({ step }) => isStepRequired(step.kind));
  if (required.length === 0) {
    const dates = Object.values(done).sort();
    return dates[0] ?? null;
  }
  const dates = required.map(({ i }) => done[String(i)]).filter(Boolean);
  return dates.length === required.length ? dates.sort().at(-1)! : null;
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
  const prevOn = dayDoneOn(saved, prev);
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

/**
 * Mistakes allowed in a day test: the category's exam ratio, made stricter
 * (`PLAN_TEST_STRICTNESS`): its tickets were all met in the last two days.
 */
export function dayTestAllowedMistakes(
  total: number,
  rules: CategoryExamRules,
): number {
  if (rules.totalQuestions <= 0) return 0;
  return Math.floor(
    (total * rules.maxMistakes * PLAN_TEST_STRICTNESS) / rules.totalQuestions,
  );
}

/**
 * 3 stars with no mistake, 2 at ≤ allowed (pass), else 1. When no mistake is
 * allowed (short tests) a pass is always 3 stars.
 */
export function dayTestStars(mistakes: number, allowed: number): 1 | 2 | 3 {
  if (mistakes === 0) return 3;
  if (mistakes <= allowed) return 2;
  return 1;
}
