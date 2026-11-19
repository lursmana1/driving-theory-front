import { describe, expect, it } from "vitest";
import type { SavedStudyPlan } from "@/lib/types/studyPlan";
import { adoptBrowserPlan, isSamePlan, mergeProgress } from "./studyPlanMerge";
import { testPlan as plan } from "./studyPlanTestUtils";

describe("isSamePlan", () => {
  it("compares category, length and start day", () => {
    expect(isSamePlan(plan(), plan({ examDay: "2026-12-03" }))).toBe(true);
    expect(isSamePlan(plan(), plan({ dayCount: 7 }))).toBe(false);
    expect(isSamePlan(plan(), plan({ startDay: "2026-11-20" }))).toBe(false);
  });
});

describe("mergeProgress", () => {
  const server = plan({
    done: { 0: { 0: "2026-11-19" } },
    tests: { 0: { correct: 10, total: 15, passed: false } },
    mistakes: { 0: [5] },
  });

  it("adds steps (earliest date wins), the better test, and mistakes of both", () => {
    const merged = mergeProgress(
      server,
      plan({
        done: { 0: { 0: "2026-11-20", 1: "2026-11-19" }, 1: { 0: "2026-11-20" } },
        tests: { 0: { correct: 14, total: 15, passed: true } },
        mistakes: { 0: [5, 7], 1: [9] },
      }),
    );
    expect(merged.done).toEqual({
      0: { 0: "2026-11-19", 1: "2026-11-19" },
      1: { 0: "2026-11-20" },
    });
    expect(merged.tests["0"]).toEqual({ correct: 14, total: 15, passed: true });
    expect(merged.mistakes).toEqual({ 0: [5, 7], 1: [9] });
  });

  it("skips anything the server would reject (browser storage is not trusted)", () => {
    const junk = {
      ...plan(),
      done: { 99: { 0: "2026-11-20" }, 2: { 0: "not-a-date", 77: "2026-11-20" }, x: {} },
      tests: {
        1: { correct: 50, total: 60, passed: true },
        2: { correct: 5, total: 3, passed: true },
        3: { correct: 1, total: 2, passed: "yes" },
      },
      mistakes: { 0: [5, "x", -1, 1.5], 50: [1] },
    } as unknown as SavedStudyPlan;
    expect(mergeProgress(server, junk)).toBe(server);
  });

  it("returns the same plan when nothing is new", () => {
    expect(mergeProgress(server, server)).toBe(server);
  });
});

describe("adoptBrowserPlan", () => {
  const guest = plan({ done: { 0: { 0: "2026-11-18" } } });

  it("nothing in the browser: nothing to do", () => {
    expect(adoptBrowserPlan(plan(), null, false)).toBeNull();
  });

  it("no account plan: the guest plan moves, unless changes are waiting", () => {
    expect(adoptBrowserPlan(null, guest, false)).toEqual({ kind: "moved", send: guest });
    expect(adoptBrowserPlan(null, guest, true)).toBeNull();
  });

  it("same plan with new progress: recovered and sent", () => {
    const out = adoptBrowserPlan(plan(), guest, false);
    expect(out?.kind).toBe("recovered");
    expect(out?.send?.done).toEqual({ 0: { 0: "2026-11-18" } });
  });

  it("same plan, nothing new: cleared only", () => {
    expect(adoptBrowserPlan(guest, guest, false)).toEqual({ kind: "same", send: null });
  });

  it("another plan (e.g. someone else's guest plan): left alone", () => {
    expect(adoptBrowserPlan(plan({ categoryId: 0 }), guest, false)).toBeNull();
  });
});
