import { describe, expect, it } from "vitest";
import type { PlanDay, SavedStudyPlan } from "@/lib/types/studyPlan";
import {
  dayStatus,
  opensByCatchUp,
  daysBehind,
  plannedDay,
  plannedEndDay,
  planToday,
  daysToMove,
  shownDay,
} from "./studyPlanProgress";
import { withShift } from "./studyPlanActions";
import { testPlan } from "./studyPlanTestUtils";

/** Learn days with one required lesson step each. */
const days: PlanDay[] = Array.from({ length: 5 }, (_, index) => ({
  index,
  date: "",
  kind: "learn",
  lessons: [],
  newQuestions: 6,
  steps: [{ kind: "learn", questionCount: 6 }],
  minutes: 30,
}));

/** Plan started on 11-19; `doneOn[i]` = study day day i was finished. */
const planWith = (doneOn: string[], over: Partial<SavedStudyPlan> = {}) =>
  testPlan({
    dayCount: days.length,
    done: Object.fromEntries(doneOn.map((on, i) => [String(i), { "0": on }])),
    ...over,
  });

describe("plannedDay", () => {
  it("counts from the start day, plus the shift", () => {
    expect(plannedDay(testPlan(), 2)).toBe("2026-11-21");
    expect(plannedDay(testPlan({ shift: 3 }), 2)).toBe("2026-11-24");
    expect(plannedEndDay(testPlan({ shift: 1 }), 5)).toBe("2026-11-24");
  });
});

describe("daysBehind", () => {
  it("is 0 on time", () => {
    expect(daysBehind(planWith(["2026-11-19"]), days, "2026-11-20")).toBe(0);
  });

  it("counts the days since the first unfinished day was due", () => {
    // Day 1 was due on 11-20; today is 11-23.
    expect(daysBehind(planWith(["2026-11-19"]), days, "2026-11-23")).toBe(3);
  });

  it("is 0 again after moving the plan by that much", () => {
    const moved = withShift(planWith(["2026-11-19"]), 3);
    expect(daysBehind(moved, days, "2026-11-23")).toBe(0);
  });

  it("is 0 when the plan is finished", () => {
    const all = planWith(days.map(() => "2026-11-19"));
    expect(daysBehind(all, days, "2026-12-30")).toBe(0);
  });
});

describe("dayStatus", () => {
  it("on time: the next day waits for the next study day", () => {
    const plan = planWith(["2026-11-19"]);
    expect(dayStatus(plan, days, 1, "2026-11-19")).toBe("locked");
    expect(dayStatus(plan, days, 1, "2026-11-20")).toBe("open");
  });

  it("behind: a second day opens on the same study day", () => {
    // Day 0 on 11-19, then a gap; today (11-22) day 1 was finished.
    const plan = planWith(["2026-11-19", "2026-11-22"]);
    expect(dayStatus(plan, days, 2, "2026-11-22")).toBe("open");
  });

  it("behind: no third day on one study day", () => {
    const plan = planWith(["2026-11-19", "2026-11-22", "2026-11-22"]);
    expect(dayStatus(plan, days, 3, "2026-11-22")).toBe("locked");
  });

  it("catch-up stops once the next day's date hasn't come", () => {
    // Behind by one: day 1 (due 11-20) and day 2 (due 11-21) done on 11-21.
    const plan = planWith(["2026-11-19", "2026-11-21", "2026-11-21"]);
    expect(dayStatus(plan, days, 3, "2026-11-21")).toBe("locked");
    // Day 2 done on time alone: day 3 is due tomorrow, stays locked.
    const onTime = planWith(["2026-11-19", "2026-11-20", "2026-11-21"]);
    expect(dayStatus(onTime, days, 3, "2026-11-21")).toBe("locked");
  });

  it("a moved plan doesn't offer catch-up", () => {
    const plan = planWith(["2026-11-19", "2026-11-23"], { shift: 3 });
    expect(dayStatus(plan, days, 2, "2026-11-23")).toBe("locked");
  });
});

describe("withShift", () => {
  it("never lowers the shift and ignores no-ops", () => {
    const plan = testPlan({ shift: 4 });
    expect(withShift(plan, 2)).toBe(plan);
    expect(withShift(plan, 4)).toBe(plan);
    expect(withShift(plan, 6).shift).toBe(6);
  });
});

describe("opensByCatchUp", () => {
  it("only when the day before was finished today", () => {
    const behind = planWith(["2026-11-19", "2026-11-22"]);
    expect(opensByCatchUp(behind, days, 2, "2026-11-22")).toBe(true);
    const onTime = planWith(["2026-11-19", "2026-11-20"]);
    expect(opensByCatchUp(onTime, days, 2, "2026-11-21")).toBe(false);
  });
});

describe("planToday", () => {
  it("open day with its steps", () => {
    const s = planToday(planWith(["2026-11-19"]), days, "2026-11-20");
    expect(s).toMatchObject({
      dayIndex: 1,
      status: "open",
      daysDone: 1,
      stepsDone: 0,
      stepsTotal: 1,
      behind: 0,
    });
  });

  it("done for today, then finished", () => {
    expect(planToday(planWith(["2026-11-19"]), days, "2026-11-19").status).toBe(
      "doneToday",
    );
    const all = planWith(days.map((_, i) => `2026-11-${19 + i}`));
    expect(planToday(all, days, "2026-11-24")).toMatchObject({
      status: "finished",
      dayIndex: null,
    });
  });
});

describe("daysToMove", () => {
  it("behind with today's day open: by the days behind", () => {
    // Day 1 due 11-20, today 11-23, open.
    expect(daysToMove(planWith(["2026-11-19"]), days, "2026-11-23")).toBe(3);
  });

  it("behind after two days today: one more, since the next opens tomorrow", () => {
    const plan = planWith(["2026-11-22", "2026-11-22"], {
      startDay: "2026-11-15",
    });
    // Day 2 was due 11-17; today 11-22 it is locked (two days done today).
    expect(dayStatus(plan, days, 2, "2026-11-22")).toBe("locked");
    expect(daysToMove(plan, days, "2026-11-22")).toBe(6);
    const moved = withShift(plan, 6);
    expect(daysBehind(moved, days, "2026-11-23")).toBe(0);
    expect(dayStatus(moved, days, 2, "2026-11-23")).toBe("open");
  });

  it("0 on time", () => {
    expect(daysToMove(planWith(["2026-11-19"]), days, "2026-11-20")).toBe(0);
  });
});

describe("shownDay", () => {
  it("a finished day shows when it was finished, others their planned day", () => {
    const plan = planWith(["2026-11-25"], { shift: 5 });
    expect(shownDay(plan, days[0])).toBe("2026-11-25");
    expect(shownDay(plan, days[1])).toBe("2026-11-25");
  });
});
