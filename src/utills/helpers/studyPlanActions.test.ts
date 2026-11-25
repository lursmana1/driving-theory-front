import { describe, expect, it } from "vitest";
import {
  STUDY_PLAN_DAY_MISTAKES_MAX,
  STUDY_PLAN_MISTAKES_TOTAL_MAX,
} from "@/CONSTS/studyPlan";
import {
  applyAction,
  planIdentity,
  replayActions,
  type PlanAction,
} from "./studyPlanActions";
import { testPlan as plan } from "./studyPlanTestUtils";

describe("applyAction", () => {
  it("marks a step done once; the first date stays", () => {
    const step: PlanAction = { op: "step", day: 0, step: 2, on: "2026-11-19" };
    const once = applyAction(plan(), step);
    expect(once.done).toEqual({ 0: { 2: "2026-11-19" } });
    expect(applyAction(once, { ...step, on: "2026-11-20" })).toBe(once);
  });

  it("test: keeps the best try, adds wrong answers, closes the step only when passed", () => {
    const failed = applyAction(plan(), {
      op: "test",
      day: 1,
      step: 4,
      result: { correct: 10, total: 15, passed: false },
      wrongIds: [7, 8],
      on: "2026-11-19",
    });
    expect(failed.tests["1"]).toEqual({ correct: 10, total: 15, passed: false });
    expect(failed.mistakes?.["1"]).toEqual([7, 8]);
    expect(failed.done["1"]).toBeUndefined();

    const passed = applyAction(failed, {
      op: "test",
      day: 1,
      step: 4,
      result: { correct: 14, total: 15, passed: true },
      wrongIds: [8],
      on: "2026-11-20",
    });
    expect(passed.tests["1"].correct).toBe(14);
    expect(passed.done["1"]).toEqual({ 4: "2026-11-20" });

    const weaker = applyAction(passed, {
      op: "test",
      day: 1,
      step: 4,
      result: { correct: 9, total: 15, passed: false },
      wrongIds: [],
      on: "2026-11-21",
    });
    expect(weaker).toBe(passed);
  });

  it("mistakes: no duplicates; fix removes one; unchanged returns the same plan", () => {
    const added = applyAction(plan(), { op: "mistakes", day: 0, ids: [5, 6, 5] });
    expect(added.mistakes?.["0"]).toEqual([5, 6]);
    expect(applyAction(added, { op: "mistakes", day: 0, ids: [6] })).toBe(added);
    const fixed = applyAction(added, { op: "fix", day: 0, questionId: 5 });
    expect(fixed.mistakes?.["0"]).toEqual([6]);
    const empty = applyAction(fixed, { op: "fix", day: 0, questionId: 6 });
    expect(empty.mistakes).toEqual({});
    expect(applyAction(empty, { op: "fix", day: 0, questionId: 6 })).toBe(empty);
  });

  it("mistakes stay within the server's caps, oldest dropped first", () => {
    const many = Array.from({ length: STUDY_PLAN_DAY_MISTAKES_MAX + 5 }, (_, i) => i + 1);
    const day = applyAction(plan(), { op: "mistakes", day: 0, ids: many });
    expect(day.mistakes?.["0"]).toHaveLength(STUDY_PLAN_DAY_MISTAKES_MAX);
    expect(day.mistakes?.["0"][0]).toBe(6);

    let p = plan();
    for (let d = 0; d < 4; d++) {
      const ids = Array.from({ length: 300 }, (_, i) => d * 1000 + i + 1);
      p = applyAction(p, { op: "mistakes", day: d, ids });
    }
    const total = Object.values(p.mistakes ?? {}).reduce((n, l) => n + l.length, 0);
    expect(total).toBe(STUDY_PLAN_MISTAKES_TOTAL_MAX);
    expect(p.mistakes?.["3"]).toHaveLength(300);
  });
});

describe("replayActions", () => {
  it("applies in order; no plan stays no plan", () => {
    const actions: PlanAction[] = [
      { op: "mistakes", day: 0, ids: [5] },
      { op: "fix", day: 0, questionId: 5 },
      { op: "step", day: 0, step: 0, on: "2026-11-19" },
    ];
    expect(replayActions(plan(), actions)).toMatchObject({
      done: { 0: { 0: "2026-11-19" } },
      mistakes: {},
    });
    expect(replayActions(null, actions)).toBeNull();
  });

  it("skips actions that don't fit the plan (another plan picked meanwhile)", () => {
    const short = plan({ dayCount: 3 });
    const out = replayActions(short, [
      { op: "step", day: 10, step: 0, on: "2026-11-19" },
      { op: "step", day: 0, step: 99, on: "2026-11-19" },
    ]);
    expect(out).toBe(short);
  });
});

describe("replayActions and plan identity", () => {
  it("skips actions made on another plan, keeps the rest", () => {
    const a = plan();
    const b = plan({ startDay: "2026-11-24" });
    const actions: PlanAction[] = [
      { op: "shift", days: 5, plan: planIdentity(a) },
      { op: "step", day: 0, step: 0, on: "2026-11-24", plan: planIdentity(b) },
      { op: "step", day: 0, step: 1, on: "2026-11-24" },
    ];
    const replayed = replayActions(b, actions)!;
    expect(replayed.shift).toBeUndefined();
    expect(replayed.done["0"]).toEqual({ 0: "2026-11-24", 1: "2026-11-24" });
  });
});
