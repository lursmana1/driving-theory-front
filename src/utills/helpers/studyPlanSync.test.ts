import { describe, expect, it } from "vitest";
import type { PlanDay } from "@/lib/types/studyPlan";
import { applyAction } from "./studyPlanActions";
import { planSync } from "./studyPlanSync";
import { isDayDone } from "./studyPlanProgress";
import { testPlan } from "./studyPlanTestUtils";

/** Learn days with two required lesson steps each; hash `h<index>`. */
const day = (index: number, hash = `h${index}`): PlanDay => ({
  index,
  date: "",
  kind: "learn",
  lessons: [],
  newQuestions: 6,
  steps: [
    { kind: "learn", questionCount: 6 },
    { kind: "learn", questionCount: 6 },
  ],
  minutes: 30,
  hash,
});
const days = [day(0), day(1), day(2)];

const sync = (plan: ReturnType<typeof testPlan>, list = days) => {
  const s = planSync(plan, list);
  return s
    ? applyAction(plan, {
        op: "sync",
        hashes: s.hashes,
        completed: s.completed,
      })
    : plan;
};

describe("planSync", () => {
  it("nothing to record for an untouched plan", () => {
    expect(planSync(testPlan({ dayCount: 3 }), days)).toBeNull();
  });

  it("records hashes of days with progress and finished days", () => {
    const plan = testPlan({
      dayCount: 3,
      done: {
        "0": { "0": "2026-11-19", "1": "2026-11-19" },
        "1": { "0": "2026-11-20" },
      },
    });
    expect(planSync(plan, days)).toEqual({
      hashes: { "0": "h0", "1": "h1" },
      completed: { "0": "2026-11-19" },
      resetDays: [],
    });
    // Applied once, it matches: nothing more to do.
    expect(planSync(sync(plan), days)).toBeNull();
  });

  it("a changed unfinished day starts fresh; a finished one stays done", () => {
    const plan = sync(
      testPlan({
        dayCount: 3,
        done: {
          "0": { "0": "2026-11-19", "1": "2026-11-19" },
          "1": { "0": "2026-11-20" },
        },
        mistakes: { "1": [5] },
      }),
    );
    const changed = [day(0, "new0"), day(1, "new1"), day(2)];
    expect(planSync(plan, changed)?.resetDays).toEqual([1]);

    const after = sync(plan, changed);
    expect(after.done["1"]).toBeUndefined();
    expect(after.mistakes?.["1"]).toBeUndefined();
    expect(after.dayHashes).toEqual({ "0": "new0", "1": "new1" });
    expect(isDayDone(after, changed[0])).toBe(true);
    expect(planSync(after, changed)).toBeNull();
  });

  it("replaying the same sync never wipes newer progress", () => {
    const plan = sync(
      testPlan({ dayCount: 3, done: { "1": { "0": "2026-11-20" } } }),
    );
    const action = {
      op: "sync" as const,
      hashes: { "1": "new1" },
      completed: {},
    };
    const reset = applyAction(plan, action);
    const ticked = applyAction(reset, {
      op: "step",
      day: 1,
      step: 0,
      on: "2026-11-21",
    });
    expect(applyAction(ticked, action)).toBe(ticked);
  });

  it("skips days of an API without hashes", () => {
    const plan = testPlan({
      dayCount: 1,
      done: { "0": { "0": "2026-11-19" } },
    });
    expect(planSync(plan, [{ ...day(0), hash: undefined }])).toBeNull();
  });
});

describe("planSync, older data", () => {
  it("a changed day with a passed day test stays finished (no completed yet)", () => {
    const plan = testPlan({
      dayCount: 3,
      done: { "1": { "0": "2026-11-20", "2": "2026-11-21" } },
      tests: { "1": { correct: 10, total: 10, passed: true } },
      dayHashes: { "1": "h1" },
    });
    const changed = [day(0), day(1, "new1"), day(2)];
    const s = planSync(plan, changed);
    expect(s?.resetDays).toEqual([]);
    expect(s?.completed).toEqual({ "1": "2026-11-21" });
    const after = applyAction(plan, {
      op: "sync",
      hashes: s!.hashes,
      completed: s!.completed,
    });
    expect(after.done["1"]).toBeDefined();
    expect(isDayDone(after, changed[1])).toBe(true);
  });
});
