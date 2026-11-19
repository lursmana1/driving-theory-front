import type { SavedStudyPlan } from "@/lib/types/studyPlan";

/** Test helpers for the study plan specs (`*.test.ts`); not used by the app. */

export const testPlan = (over: Partial<SavedStudyPlan> = {}): SavedStudyPlan => ({
  version: 1,
  categoryId: 2,
  dayCount: 14,
  startDay: "2026-11-19",
  examDay: null,
  done: {},
  tests: {},
  mistakes: {},
  ...over,
});

/** In-memory `localStorage` for the node test environment. */
export function memoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    key: (i) => [...data.keys()][i] ?? null,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, String(v)),
    removeItem: (k) => void data.delete(k),
    clear: () => data.clear(),
  };
}
