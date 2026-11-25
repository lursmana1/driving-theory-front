import type { PlanDay, SavedStudyPlan } from "@/lib/types/studyPlan";
import { dayDoneOn, isDayDone } from "./studyPlanProgress";

/**
 * What a saved plan should record about the current schedule (the `sync`
 * action), and which days start fresh because their content changed.
 * Owner rule (2026-11-19): a finished day stays finished; an unfinished day
 * whose tickets or steps changed starts fresh.
 */
export type PlanSync = {
  /** dayIndex → the day's current hash, for days with progress or a stale hash. */
  hashes: Record<string, string>;
  /** dayIndex → study day it was finished, for finished days not recorded yet. */
  completed: Record<string, string>;
  /** Unfinished days with progress whose content changed (they start fresh). */
  resetDays: number[];
};

function hasProgress(saved: SavedStudyPlan, key: string): boolean {
  return (
    Object.keys(saved.done[key] ?? {}).length > 0 ||
    !!saved.tests[key] ||
    (saved.mistakes?.[key]?.length ?? 0) > 0
  );
}

/**
 * The study day a day with a passed day test was finished (its latest
 * tick), or null. Only used for days whose steps changed since.
 */
function passedTestDay(saved: SavedStudyPlan, key: string): string | null {
  if (!saved.tests[key]?.passed) return null;
  const dates = Object.values(saved.done[key] ?? {}).sort();
  return dates.at(-1) ?? null;
}

/** Null when the plan already matches the schedule (or the API sends no hashes). */
export function planSync(
  saved: SavedStudyPlan,
  days: readonly PlanDay[],
): PlanSync | null {
  const sync: PlanSync = { hashes: {}, completed: {}, resetDays: [] };
  for (const day of days) {
    if (!day.hash) continue;
    const key = String(day.index);
    const known = saved.dayHashes?.[key];
    const finished = !!saved.completed?.[key];
    if (known && known !== day.hash) {
      sync.hashes[key] = day.hash;
      // A passed day test closes a day, so a day finished in a tab that
      // didn't record `completed` (older frontend) still stays finished.
      const passedOn = !finished && passedTestDay(saved, key);
      if (passedOn) sync.completed[key] = passedOn;
      else if (!finished && hasProgress(saved, key)) {
        sync.resetDays.push(day.index);
      }
      // Its ticks point at the old steps: never read them as "finished".
      continue;
    }
    if (!hasProgress(saved, key)) continue;
    // Plans saved before hashes: today's schedule is taken as the one used.
    if (!known) sync.hashes[key] = day.hash;
    if (!finished && isDayDone(saved, day)) {
      const on = dayDoneOn(saved, day);
      if (on) sync.completed[key] = on;
    }
  }
  const empty =
    Object.keys(sync.hashes).length === 0 &&
    Object.keys(sync.completed).length === 0;
  return empty ? null : sync;
}
