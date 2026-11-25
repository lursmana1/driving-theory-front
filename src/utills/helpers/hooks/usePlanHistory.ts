"use client";

import { useEffect, useState } from "react";
import { getMyPlanHistory } from "@/api/studyPlans";
import type { PlanHistoryItem } from "@/lib/types/studyPlan";
import { readLocalHistory } from "@/utills/helpers/studyPlanHistory";
import type { StudyPlanMode } from "./useStudyPlan";

/**
 * Plans the user left, newest first: from the server when signed in, from
 * this browser for guests. Null while loading; an error shows nothing.
 * Signed in, it reads only once nothing is waiting to be saved, so a plan
 * reset a moment ago (its DELETE archives it) is already in the list.
 */
export function usePlanHistory(
  mode: StudyPlanMode | null,
  unsaved = false,
): PlanHistoryItem[] | null {
  const [items, setItems] = useState<PlanHistoryItem[] | null>(null);

  useEffect(() => {
    if (mode == null || (mode === "account" && unsaved)) return;
    let cancelled = false;
    const load =
      mode === "account"
        ? getMyPlanHistory()
        : Promise.resolve(readLocalHistory());
    load
      .then((list) => {
        if (!cancelled) setItems(list);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [mode, unsaved]);

  return items;
}
