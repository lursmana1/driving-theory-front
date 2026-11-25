"use client";

import { useEffect, useMemo, useState } from "react";
import { getPlanPreview } from "@/api/studyPlans";
import type { StudyPlanPreview } from "@/lib/types/studyPlan";
import { planToday, type PlanToday } from "@/utills/helpers/studyPlanProgress";
import { useStudyPlan } from "./useStudyPlan";
import { useStudyDay } from "./useStudyDay";

/**
 * Today's state of the user's study plan (guest or account), or null while
 * loading / with no plan. Fetches the plan's preview (cached per study day
 * in this tab) only when a plan exists.
 */
export function usePlanToday(): PlanToday | null {
  const { plan, ready } = useStudyPlan();
  const today = useStudyDay();
  const [preview, setPreview] = useState<StudyPlanPreview | null>(null);

  const categoryId = plan?.categoryId;
  const dayCount = plan?.dayCount;
  useEffect(() => {
    if (!ready || categoryId == null || dayCount == null) return;
    let cancelled = false;
    getPlanPreview(categoryId, { days: dayCount })
      .then((p) => {
        if (!cancelled) setPreview(p);
      })
      .catch(() => {
        // The bell / card just stay quiet; the plan page shows the error.
      });
    return () => {
      cancelled = true;
    };
  }, [ready, categoryId, dayCount, today]);

  return useMemo(() => {
    if (!plan || !preview) return null;
    if (
      preview.categoryId !== plan.categoryId ||
      preview.days.length !== plan.dayCount
    ) {
      return null;
    }
    return planToday(plan, preview.days, today);
  }, [plan, preview, today]);
}
