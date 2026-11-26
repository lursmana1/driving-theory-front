"use client";

import { useSyncExternalStore } from "react";
import { currentTheme, subscribeTheme, type Theme } from "../theme";

/**
 * The page's theme. Null during the server render and hydration: the server
 * can't know it, so theme-dependent UI renders neutral first (no mismatch).
 */
export function useTheme(): Theme | null {
  return useSyncExternalStore(subscribeTheme, currentTheme, () => null);
}
