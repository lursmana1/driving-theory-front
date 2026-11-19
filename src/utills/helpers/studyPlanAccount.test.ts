import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SavedStudyPlan } from "@/lib/types/studyPlan";
import { memoryStorage, testPlan as plan } from "./studyPlanTestUtils";

/**
 * The account store against an in-memory `/study-plans/me` with the
 * server's revision rules. A "tab" is a fresh copy of the store module
 * (`vi.resetModules`); the fake server and the browser storage are shared,
 * like two tabs of one browser talking to one API.
 */

type Row = SavedStudyPlan & { revision: number };

const api = vi.hoisted(() => {
  class PlanConflictError extends Error {
    constructor(
      readonly current: { plan: SavedStudyPlan | null; revision: number | null },
    ) {
      super("Study plan changed");
    }
  }
  const server = {
    row: null as Row | null,
    down: false,
    reject400: false,
    calls: [] as string[],
  };
  return { server, PlanConflictError };
});

vi.mock("@/api/studyPlans", () => {
  const { server, PlanConflictError } = api;
  const copy = <T,>(x: T): T => JSON.parse(JSON.stringify(x)) as T;
  const strip = (row: Row): SavedStudyPlan => {
    const { revision: _revision, ...rest } = copy(row);
    void _revision;
    return rest;
  };
  const network = () => {
    if (server.down) throw new Error("Network Error");
  };
  return {
    PlanConflictError,
    isPermanentSaveError: (err: unknown) =>
      (err as { status?: number }).status === 400,
    getMyPlan: async () => {
      server.calls.push("GET");
      network();
      return server.row
        ? { plan: strip(server.row), revision: server.row.revision }
        : { plan: null, revision: 0 };
    },
    saveMyPlan: async (next: SavedStudyPlan, base: number | null) => {
      server.calls.push(`PUT ${base}`);
      network();
      if (server.reject400) throw Object.assign(new Error("400"), { status: 400 });
      const cur = server.row;
      const stale =
        (base === 0 && cur) || (base != null && base > 0 && cur?.revision !== base);
      if (stale) {
        throw new PlanConflictError(
          cur ? { plan: strip(cur), revision: cur.revision } : { plan: null, revision: 0 },
        );
      }
      const revision = cur ? cur.revision + 1 : 1;
      server.row = { ...copy(next), revision };
      return revision;
    },
    deleteMyPlan: async () => {
      server.calls.push("DELETE");
      network();
      server.row = null;
    },
  };
});

const { server } = api;
const tracked: string[] = [];
const noGuest = { read: () => null, clear: () => undefined };
const STEP = { op: "step" as const, on: "2026-11-19" };

/** A new tab: a fresh store module over the shared server and storage. */
async function newTab() {
  vi.resetModules();
  return import("./studyPlanAccount");
}

/** Lets the store's pending promises (load, save, replay) finish. */
const settle = () => new Promise((r) => setTimeout(r, 0)).then(() => new Promise((r) => setTimeout(r, 0)));

beforeEach(() => {
  server.row = null;
  server.down = false;
  server.reject400 = false;
  server.calls = [];
  tracked.length = 0;
  vi.stubGlobal("localStorage", memoryStorage());
  vi.stubGlobal("window", {
    addEventListener: () => undefined,
    umami: { track: (event: string) => tracked.push(event) },
  });
  vi.stubGlobal("document", { addEventListener: () => undefined, visibilityState: "visible" });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("study plan account store", () => {
  it("saves a change over the revision it read", async () => {
    server.row = { ...plan(), revision: 3 };
    const tab = await newTab();
    tab.loadAccount(7, noGuest);
    await settle();
    expect(tab.queueAction(7, { ...STEP, day: 0, step: 0 })).toBe(true);
    await settle();
    expect(server.calls).toContain("PUT 3");
    expect(server.row).toMatchObject({ revision: 4, done: { 0: { 0: "2026-11-19" } } });
    expect(tab.hasUnsaved(tab.getAccount()!)).toBe(false);
    expect(tab.queueAction(7, { ...STEP, day: 0, step: 0 })).toBe(false);
  });

  it("409: re-applies its change on top of what another device saved", async () => {
    server.row = { ...plan(), revision: 3 };
    const tab = await newTab();
    tab.loadAccount(7, noGuest);
    await settle();
    server.row = { ...plan({ done: { 1: { 0: "2026-11-20" } } }), revision: 4 };
    tab.queueAction(7, { ...STEP, day: 0, step: 1 });
    await settle();
    expect(server.calls.slice(-2)).toEqual(["PUT 3", "PUT 4"]);
    expect(server.row).toMatchObject({
      revision: 5,
      done: { 0: { 1: "2026-11-19" }, 1: { 0: "2026-11-20" } },
    });
  });

  it("offline: keeps the change in the browser, shows it after a reload, sends it when back", async () => {
    server.row = { ...plan({ mistakes: { 0: [11] } }), revision: 2 };
    const first = await newTab();
    first.loadAccount(7, noGuest);
    await settle();
    server.down = true;
    first.queueAction(7, { op: "mistakes", day: 0, ids: [12] });
    await settle();
    expect(first.getAccount()?.saveFailed).toBe(true);

    const reloaded = await newTab();
    reloaded.loadAccount(7, noGuest);
    await settle();
    expect(reloaded.getAccount()?.status).toBe("offline");
    expect(reloaded.accountPlan(reloaded.getAccount()!)?.mistakes).toEqual({ 0: [11, 12] });
    reloaded.queueAction(7, { op: "fix", day: 0, questionId: 11 });

    server.row = { ...plan({ mistakes: { 0: [11] }, done: { 2: { 0: "2026-11-21" } } }), revision: 3 };
    server.down = false;
    reloaded.retryAccountNow();
    await settle();
    await settle();
    expect(server.row).toMatchObject({
      mistakes: { 0: [12] },
      done: { 2: { 0: "2026-11-21" } },
    });
    expect(reloaded.hasUnsaved(reloaded.getAccount()!)).toBe(false);
  });

  it("offline with no browser copy: not known, so the page can't offer a new plan over the real one", async () => {
    server.down = true;
    const tab = await newTab();
    tab.loadAccount(7, noGuest);
    await settle();
    expect(tab.getAccount()).toMatchObject({ status: "offline", known: false });
  });

  it("a network failure is retried on a timer; a 400 is not", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    server.row = { ...plan(), revision: 1 };
    const tab = await newTab();
    tab.loadAccount(7, noGuest);
    await vi.advanceTimersByTimeAsync(0);

    server.down = true;
    tab.queueAction(7, { ...STEP, day: 0, step: 0 });
    await vi.advanceTimersByTimeAsync(0);
    server.down = false;
    await vi.advanceTimersByTimeAsync(2_000);
    expect(server.row?.done).toEqual({ 0: { 0: "2026-11-19" } });

    server.reject400 = true;
    const before = server.calls.length;
    tab.queueAction(7, { ...STEP, day: 0, step: 1 });
    await vi.advanceTimersByTimeAsync(60_000);
    expect(server.calls.length - before).toBe(1);
    expect(tab.getAccount()).toMatchObject({ saveFailed: true });
    expect(tab.hasUnsaved(tab.getAccount()!)).toBe(true);
  });

  it("a reset on another device wins over queued changes", async () => {
    server.row = { ...plan(), revision: 2 };
    const tab = await newTab();
    tab.loadAccount(7, noGuest);
    await settle();
    server.row = null;
    tab.queueAction(7, { ...STEP, day: 3, step: 0 });
    await settle();
    expect(server.row).toBeNull();
    expect(tab.accountPlan(tab.getAccount()!)).toBeNull();
    expect(tab.hasUnsaved(tab.getAccount()!)).toBe(false);
  });

  it("a newly picked plan replaces whatever the server has", async () => {
    server.row = { ...plan({ categoryId: 0 }), revision: 9 };
    const tab = await newTab();
    tab.loadAccount(7, noGuest);
    await settle();
    server.row = { ...plan({ categoryId: 1 }), revision: 10 };
    tab.replacePlan(7, plan({ categoryId: 5 }));
    await settle();
    expect(server.row?.categoryId).toBe(5);
  });

  it("an API without revisions: saves go without baseRevision", async () => {
    server.row = { ...plan(), revision: 1 };
    const tab = await newTab();
    tab.loadAccount(7, noGuest);
    await settle();
    tab.getAccount()!.revision = null;
    tab.queueAction(7, { ...STEP, day: 0, step: 0 });
    await settle();
    expect(server.calls.at(-1)).toBe("PUT null");
  });

  describe("plan in the guest key on sign-in", () => {
    const guestCopy = (copy: SavedStudyPlan) => {
      const handoff = { read: () => copy, clear: vi.fn() };
      return handoff;
    };

    it("moves to an account that has none", async () => {
      const guest = guestCopy(plan({ categoryId: 3 }));
      const tab = await newTab();
      tab.loadAccount(7, guest);
      await settle();
      expect(server.row?.categoryId).toBe(3);
      expect(server.calls.at(-1)).toBe("PUT 0");
      expect(guest.clear).toHaveBeenCalled();
      expect(tracked).toContain("plan_guest_moved");
    });

    it("same plan: its old offline progress is added once", async () => {
      server.row = { ...plan({ done: { 0: { 0: "2026-11-19" } } }), revision: 4 };
      const guest = guestCopy(plan({ done: { 1: { 0: "2026-11-20" } }, mistakes: { 1: [9] } }));
      const tab = await newTab();
      tab.loadAccount(7, guest);
      await settle();
      expect(server.row).toMatchObject({
        revision: 5,
        done: { 0: { 0: "2026-11-19" }, 1: { 0: "2026-11-20" } },
        mistakes: { 1: [9] },
      });
      expect(guest.clear).toHaveBeenCalled();
      expect(tracked).toContain("plan_progress_recovered");
    });

    it("another plan is left alone", async () => {
      server.row = { ...plan({ categoryId: 2 }), revision: 2 };
      const guest = guestCopy(plan({ categoryId: 0, done: { 0: { 0: "2026-11-19" } } }));
      const tab = await newTab();
      tab.loadAccount(7, guest);
      await settle();
      expect(server.calls).toEqual(["GET"]);
      expect(guest.clear).not.toHaveBeenCalled();
    });
  });
});
