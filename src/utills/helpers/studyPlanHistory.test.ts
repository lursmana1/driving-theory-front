import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  PLAN_HISTORY_LIMIT,
  pushLocalHistory,
  readLocalHistory,
  toHistoryItem,
} from "./studyPlanHistory";
import { memoryStorage, testPlan } from "./studyPlanTestUtils";

beforeEach(() => vi.stubGlobal("localStorage", memoryStorage()));
afterEach(() => vi.unstubAllGlobals());

const started = testPlan({
  done: { "0": { "0": "2026-11-19" }, "1": {} },
  completed: { "0": "2026-11-19" },
});

describe("plan history", () => {
  it("summarises a plan like the server", () => {
    expect(toHistoryItem(started, "2026-11-25T10:00:00.000Z")).toEqual({
      categoryId: 2,
      dayCount: 14,
      startDay: "2026-11-19",
      examDay: null,
      endedAt: "2026-11-25T10:00:00.000Z",
      daysActive: 1,
      daysCompleted: 1,
    });
  });

  it("keeps only plans with progress, newest first, at most the limit", () => {
    pushLocalHistory(testPlan(), "2026-11-20T00:00:00.000Z");
    expect(readLocalHistory()).toEqual([]);
    for (let i = 0; i < PLAN_HISTORY_LIMIT + 2; i++) {
      pushLocalHistory(started, `2026-11-${10 + i}T00:00:00.000Z`);
    }
    const list = readLocalHistory();
    expect(list).toHaveLength(PLAN_HISTORY_LIMIT);
    expect(list[0].endedAt).toBe("2026-11-21T00:00:00.000Z");
  });

  it("drops stored entries out of shape", () => {
    localStorage.setItem(
      "prava.studyPlan.history.v1",
      JSON.stringify([{ categoryId: "x" }, toHistoryItem(started, "t")]),
    );
    expect(readLocalHistory()).toHaveLength(1);
  });
});
