import { beforeEach, describe, expect, it, vi } from "vitest";
import { memoryStorage, testPlan } from "./studyPlanTestUtils";
import {
  isQueuedAction,
  readStoredAccount,
  writeStoredAccount,
} from "./studyPlanAccountStorage";

const KEY = "prava.studyPlan.account.v1.7";
const plan = testPlan();

beforeEach(() => {
  vi.stubGlobal("localStorage", memoryStorage());
});

describe("study plan browser copy", () => {
  it("round-trips per user", () => {
    const stored = {
      base: plan,
      revision: 3,
      replace: null,
      pending: [{ id: "a", op: "step" as const, day: 0, step: 1, on: "2026-11-19" }],
    };
    writeStoredAccount(7, stored);
    expect(readStoredAccount(7)).toEqual(stored);
    expect(readStoredAccount(8)).toBeNull();
  });

  it("drops what is out of shape", () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        base: { ...plan, version: 2 },
        revision: "3",
        replace: { plan: null },
        pending: [
          { id: "x", op: "mistakes", day: 0, ids: "bad" },
          { id: "y", op: "fix", day: 0, questionId: 5 },
          { op: "fix", day: 0, questionId: 5 },
        ],
      }),
    );
    expect(readStoredAccount(7)).toEqual({
      base: null,
      revision: null,
      replace: { plan: null },
      pending: [{ id: "y", op: "fix", day: 0, questionId: 5 }],
    });
  });

  it("unreadable storage reads as nothing", () => {
    localStorage.setItem(KEY, "{not json");
    expect(readStoredAccount(7)).toBeNull();
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    });
    expect(readStoredAccount(7)).toBeNull();
    expect(() => writeStoredAccount(7, { base: null, revision: null, replace: null, pending: [] })).not.toThrow();
  });

  it.each([
    [{ id: "a", op: "step", day: 0, step: 1, on: "2026-11-19" }, true],
    [{ id: "a", op: "test", day: 0, step: 1, on: "d", wrongIds: [1], result: { correct: 1, total: 2, passed: true } }, true],
    [{ id: "a", op: "test", day: 0, step: 1, on: "d", wrongIds: [1], result: null }, false],
    [{ id: "a", op: "mistakes", day: 0, ids: [1, 2] }, true],
    [{ id: "a", op: "fix", day: 0, questionId: 1 }, true],
    [{ id: "a", op: "other", day: 0 }, false],
    [{ id: 1, op: "fix", day: 0, questionId: 1 }, false],
    [null, false],
  ])("isQueuedAction(%j) = %s", (value, ok) => {
    expect(isQueuedAction(value)).toBe(ok);
  });
});
