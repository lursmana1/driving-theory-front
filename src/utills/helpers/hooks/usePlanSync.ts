"use client";

import { useEffect, useMemo, useState } from "react";
import type { PlanDay, SavedStudyPlan } from "@/lib/types/studyPlan";
import { planSync, type PlanSync } from "@/utills/helpers/studyPlanSync";
import { useStudyPlan } from "./useStudyPlan";

/**
 * Keeps the saved plan in step with the schedule the server sends: records
 * day hashes and finished days, and starts changed unfinished days fresh.
 * Returns the day indexes that started fresh while this page was open, for
 * a notice.
 */
export function usePlanSync(
  plan: SavedStudyPlan | null,
  days: readonly PlanDay[] | undefined,
): number[] {
  const { syncDays } = useStudyPlan();
  const sync = useMemo<PlanSync | null>(
    () => (plan && days ? planSync(plan, days) : null),
    [plan, days],
  );

  // Remember reset days across the re-render that applies them (adjusting
  // state while rendering, so no extra effect pass).
  const [resetDays, setResetDays] = useState<number[]>([]);
  const [seen, setSeen] = useState<PlanSync | null>(null);
  if (sync !== seen) {
    setSeen(sync);
    const fresh = sync?.resetDays.filter((d) => !resetDays.includes(d)) ?? [];
    if (fresh.length > 0) setResetDays([...resetDays, ...fresh]);
  }

  useEffect(() => {
    if (sync) syncDays(sync);
  }, [sync, syncDays]);

  return resetDays;
}
