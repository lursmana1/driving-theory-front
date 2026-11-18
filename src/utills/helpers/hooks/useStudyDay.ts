"use client";

import { useSyncExternalStore } from "react";
import {
  msToNextStudyDay,
  studyDayOf,
} from "@/utills/helpers/studyPlanProgress";

/** Small margin so the timer never fires a moment before midnight. */
const ROLLOVER_MARGIN_MS = 1_000;

function subscribe(onChange: () => void) {
  let timer: ReturnType<typeof setTimeout>;
  const arm = () => {
    timer = setTimeout(() => {
      onChange();
      arm();
    }, msToNextStudyDay() + ROLLOVER_MARGIN_MS);
  };
  arm();
  return () => clearTimeout(timer);
}

const getSnapshot = () => studyDayOf();

/**
 * Today's study day (`YYYY-MM-DD`, starts 04:00 Tbilisi). Re-renders when a
 * new study day starts, so a page left open past 04:00 opens the next day.
 */
export function useStudyDay(): string {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
