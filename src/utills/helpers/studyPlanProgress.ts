import type {
  PlanDay,
  PlanStepKind,
  SavedStudyPlan,
} from "@/lib/types/studyPlan";
import type { CategoryExamRules } from "@/CONSTS/categories";
import {
  PLAN_CATCH_UP_DAYS_PER_STUDY_DAY,
  PLAN_TEST_STRICTNESS,
} from "@/CONSTS/studyPlan";
import { addPlanDays, daysBetween } from "./studyDays";

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
  // Finished days stay finished, even if their content changed since.
  if (saved.completed?.[String(day.index)]) return true;
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
export function dayDoneOn(saved: SavedStudyPlan, day: PlanDay): string | null {
  const finished = saved.completed?.[String(day.index)];
  if (finished) return finished;
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

/** Study day plan day `index` is planned on: start + shift + index. */
export function plannedDay(saved: SavedStudyPlan, index: number): string {
  return addPlanDays(saved.startDay, (saved.shift ?? 0) + index);
}

/** Plan days finished on `today` (their last required step was done today). */
function daysFinishedOn(
  saved: SavedStudyPlan,
  days: readonly PlanDay[],
  today: string,
): number {
  return days.filter(
    (d) => isDayDone(saved, d) && dayDoneOn(saved, d) === today,
  ).length;
}

/**
 * One plan day per study day: day N opens only once day N−1 is done AND a
 * new study day has started since (04:00 Tbilisi), so new material gets a
 * night's sleep in between. Catch-up: a user behind the plan's dates may
 * open the next day on the same study day while that day's date has come,
 * up to `PLAN_CATCH_UP_DAYS_PER_STUDY_DAY` plan days per study day.
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
  if (prevOn && prevOn < today) return "open";
  const catchUp =
    plannedDay(saved, index) <= today &&
    daysFinishedOn(saved, days, today) < PLAN_CATCH_UP_DAYS_PER_STUDY_DAY;
  return catchUp ? "open" : "locked";
}

/** Day `index` is open only thanks to catch-up (its day before was finished today). */
export function opensByCatchUp(
  saved: SavedStudyPlan,
  days: PlanDay[],
  index: number,
  today: string,
): boolean {
  const prev = days[index - 1];
  return (
    !!prev &&
    dayStatus(saved, days, index, today) === "open" &&
    dayDoneOn(saved, prev) === today
  );
}

/**
 * How many days the user is behind the plan's dates: today minus the
 * planned day of the first unfinished day (0 when on time or finished).
 */
export function daysBehind(
  saved: SavedStudyPlan,
  days: PlanDay[],
  today: string,
): number {
  const current = currentDayIndex(saved, days);
  if (current == null) return 0;
  return Math.max(0, daysBetween(plannedDay(saved, current), today));
}

/**
 * Days "move the plan" shifts by: enough that the first unfinished day is
 * planned on the day it can really open (today when open, else tomorrow),
 * so the user isn't behind again the next day. 0 when not behind.
 */
export function daysToMove(
  saved: SavedStudyPlan,
  days: PlanDay[],
  today: string,
): number {
  const behind = daysBehind(saved, days, today);
  const current = currentDayIndex(saved, days);
  if (behind === 0 || current == null) return 0;
  return dayStatus(saved, days, current, today) === "open"
    ? behind
    : behind + 1;
}

/**
 * Date shown for a plan day: the study day it was finished, else the day
 * it is planned on.
 */
export function shownDay(saved: SavedStudyPlan, day: PlanDay): string {
  return (
    (isDayDone(saved, day) && dayDoneOn(saved, day)) ||
    plannedDay(saved, day.index)
  );
}

/** Day the plan ends on at its current dates (last day's planned day). */
export function plannedEndDay(saved: SavedStudyPlan, dayCount: number): string {
  return plannedDay(saved, Math.max(0, dayCount - 1));
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
 * Mistakes allowed in a day test: the category's exam ratio, times
 * `PLAN_TEST_STRICTNESS` (rounded down).
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

/** Where the plan stands today, for the header bell and the profile card. */
export type PlanToday = {
  categoryId: number;
  dayCount: number;
  /** First unfinished day; null when the plan is finished. */
  dayIndex: number | null;
  /**
   * `open`: today's day is waiting; `doneToday`: the next day opens on a
   * later study day; `finished`: every day is done.
   */
  status: "open" | "doneToday" | "finished";
  daysDone: number;
  /** Required steps of the current day: done / all. */
  stepsDone: number;
  stepsTotal: number;
  behind: number;
};

export function planToday(
  saved: SavedStudyPlan,
  days: PlanDay[],
  today: string,
): PlanToday {
  const current = currentDayIndex(saved, days);
  const day = current != null ? days[current] : null;
  const required = day
    ? day.steps
        .map((step, i) => ({ step, i }))
        .filter(({ step }) => isStepRequired(step.kind))
    : [];
  return {
    categoryId: saved.categoryId,
    dayCount: days.length,
    dayIndex: current,
    status:
      current == null
        ? "finished"
        : dayStatus(saved, days, current, today) === "open"
          ? "open"
          : "doneToday",
    daysDone: days.filter((d) => isDayDone(saved, d)).length,
    stepsDone: required.filter(({ step, i }) =>
      isStepComplete(saved, current!, i, step.kind),
    ).length,
    stepsTotal: required.length,
    behind: daysBehind(saved, days, today),
  };
}
