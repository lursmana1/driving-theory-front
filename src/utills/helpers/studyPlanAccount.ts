import {
  deleteMyPlan,
  getMyPlan,
  isPermanentSaveError,
  PlanConflictError,
  saveMyPlan,
} from "@/api/studyPlans";
import type { SavedStudyPlan } from "@/lib/types/studyPlan";
import {
  applyAction,
  replayActions,
  type PlanAction,
} from "./studyPlanActions";
import { adoptBrowserPlan } from "./studyPlanMerge";
import {
  newActionId,
  readStoredAccount,
  writeStoredAccount,
  type StoredAccount,
} from "./studyPlanAccountStorage";
import { trackPlanEvent } from "./planAnalytics";

/**
 * Signed-in user's plan, shared by every `useStudyPlan` instance in the tab.
 *
 * The plan shown is `base` (last plan known to be on the server) with the
 * changes not saved yet (`replace`, then `pending`) applied on top. Both are
 * kept in the browser per user (`studyPlanAccountStorage.ts`) and go out on
 * the next successful save.
 *
 * Saves send the revision of `base`. A 409 (another tab or device saved
 * first) brings the server's plan: it becomes `base` and the pending
 * changes are applied again on top of it. No other merging is needed,
 * since every change is a small idempotent action.
 */

export type AccountState = StoredAccount & {
  userId: number;
  /** `offline`: the server could not be read; showing the browser copy. */
  status: "loading" | "ready" | "offline";
  /** Some copy of the plan is known (server read once, or a browser copy). */
  known: boolean;
  saveFailed: boolean;
};

/** A guest plan kept in this browser (signed out), read on sign-in. */
export type GuestHandoff = {
  read: () => SavedStudyPlan | null;
  clear: () => void;
};

/** Retries of a failed save (then only on focus / online / next change). */
const RETRY_DELAYS_MS = [2_000, 8_000, 30_000];
/** 409s in a row before giving up for now (each one re-reads the server). */
const MAX_CONFLICTS = 3;
/** Past this, the queue is folded into `replace` (keeps storage small). */
const MAX_PENDING = 500;

/** Plan with the unsaved changes applied: what the user sees. */
export function accountPlan(state: AccountState): SavedStudyPlan | null {
  return replayActions(
    state.replace ? state.replace.plan : state.base,
    state.pending,
  );
}

export function hasUnsaved(state: AccountState): boolean {
  return state.replace != null || state.pending.length > 0;
}

// ---- store ----

let account: AccountState | null = null;
const listeners = new Set<() => void>();
/** Bumped by every load and sign-out, so a stale response is ignored. */
let loadToken = 0;
const noGuest: GuestHandoff = { read: () => null, clear: () => undefined };
/** The handoff of the last load, reused when re-reading after offline. */
let lastGuest: GuestHandoff = noGuest;

function setAccount(next: AccountState | null) {
  account = next;
  // Not before the first read: an empty state would hide the stored copy.
  if (next && (next.status !== "loading" || next.known)) {
    writeStoredAccount(next.userId, next);
  }
  listeners.forEach((fn) => fn());
}

export const getAccount = () => account;
export const getServerAccount = () => null;

export function subscribeAccount(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

/**
 * Reads the server plan (once per user, again after being offline). The
 * browser copy is shown meanwhile only when offline. A plan in the guest
 * key moves to an account that has none, or adds its progress when it is
 * the same plan (`adoptBrowserPlan`).
 */
export function loadAccount(userId: number, guest: GuestHandoff) {
  if (account?.userId === userId && account.status !== "offline") return;
  ensureWindowListeners();
  lastGuest = guest;
  if (account?.userId !== userId) {
    const stored = readStoredAccount(userId);
    setAccount({
      userId,
      status: "loading",
      known: stored != null,
      base: stored?.base ?? null,
      revision: stored?.revision ?? null,
      replace: stored?.replace ?? null,
      pending: stored?.pending ?? [],
      saveFailed: false,
    });
  }
  const token = ++loadToken;
  void (async () => {
    try {
      const server = await getMyPlan();
      const cur = account;
      if (token !== loadToken || cur?.userId !== userId) return;
      const adopted = cur.replace
        ? null
        : adoptBrowserPlan(server.plan, guest.read(), hasUnsaved(cur));
      setAccount({
        ...cur,
        status: "ready",
        known: true,
        base: server.plan,
        revision: server.revision,
        replace: adopted?.send ? { plan: adopted.send } : cur.replace,
      });
      if (adopted) {
        // Kept with the account copy above, so clearing loses nothing.
        guest.clear();
        if (adopted.kind === "moved") trackPlanEvent("plan_guest_moved");
        if (adopted.kind === "recovered") {
          trackPlanEvent("plan_progress_recovered");
        }
      }
      void flush(userId);
    } catch {
      const cur = account;
      if (token !== loadToken || cur?.userId !== userId) return;
      setAccount({ ...cur, status: "offline" });
    }
  })();
}

/** Signed out: forget the plan in memory (the browser copy stays per user). */
export function clearAccount() {
  if (!account) return;
  loadToken++;
  clearRetry();
  setAccount(null);
}

/** Queues one change; false when it changes nothing (no save). */
export function queueAction(userId: number, action: PlanAction): boolean {
  const cur = account;
  if (cur?.userId !== userId || cur.status === "loading") return false;
  const shown = accountPlan(cur);
  if (!shown) return false;
  const next = applyAction(shown, action);
  if (next === shown) return false;
  setAccount(
    cur.pending.length >= MAX_PENDING
      ? { ...cur, replace: { plan: next }, pending: [] }
      : { ...cur, pending: [...cur.pending, { ...action, id: newActionId() }] },
  );
  void flush(userId);
  return true;
}

/** A new plan (or none): replaces whatever is on the server. */
export function replacePlan(userId: number, plan: SavedStudyPlan | null) {
  const cur = account;
  if (cur?.userId !== userId || cur.status === "loading") return;
  setAccount({ ...cur, replace: { plan }, pending: [] });
  void flush(userId);
}

/** The user (or the browser: online, focus) asks to try again now. */
export function retryAccountNow() {
  retryStep = 0;
  resumeAccount();
}

/** Re-read when offline, else send what is unsaved. */
function resumeAccount() {
  const cur = account;
  if (!cur) return;
  if (cur.status === "offline") {
    // `loadAccount` keeps the shown copy while it re-reads.
    loadAccount(cur.userId, lastGuest);
  } else if (cur.status === "ready" && hasUnsaved(cur)) {
    void flush(cur.userId);
  }
}

// ---- saving ----

/** One save at a time per tab; a change made meanwhile triggers another. */
let flushing = false;
let flushAgain = false;

async function flush(userId: number): Promise<void> {
  if (flushing) {
    flushAgain = true;
    return;
  }
  flushing = true;
  try {
    let conflicts = 0;
    for (;;) {
      const cur = account;
      if (cur?.userId !== userId || cur.status !== "ready") return;
      if (!hasUnsaved(cur)) return;
      const sentReplace = cur.replace;
      const sentIds = new Set(cur.pending.map((a) => a.id));
      // Null: a reset to send, or changes queued without any plan (dropped).
      const next = accountPlan(cur);
      try {
        let revision = cur.revision;
        if (next) revision = await saveMyPlan(next, cur.revision);
        else if (sentReplace) {
          await deleteMyPlan();
          revision = cur.revision == null ? null : 0;
        }
        const now = account;
        if (now?.userId !== userId) return;
        retryStep = 0;
        setAccount({
          ...now,
          base: next,
          revision,
          replace: now.replace === sentReplace ? null : now.replace,
          pending: now.pending.filter((a) => !sentIds.has(a.id)),
          saveFailed: false,
        });
      } catch (err) {
        const now = account;
        if (now?.userId !== userId) return;
        if (err instanceof PlanConflictError && conflicts++ < MAX_CONFLICTS) {
          // Deleted on another device and nothing new picked here: the
          // reset wins, the queued changes of the old plan go.
          const deleted = !err.current.plan && !now.replace;
          setAccount({
            ...now,
            base: err.current.plan,
            revision: err.current.revision,
            pending: deleted ? [] : now.pending,
          });
          continue;
        }
        setAccount({ ...now, saveFailed: true });
        if (!isPermanentSaveError(err)) scheduleRetry();
        return;
      }
    }
  } finally {
    flushing = false;
    if (flushAgain) {
      flushAgain = false;
      void flush(userId);
    }
  }
}

let retryTimer: ReturnType<typeof setTimeout> | null = null;
let retryStep = 0;

function scheduleRetry() {
  if (retryTimer || retryStep >= RETRY_DELAYS_MS.length) return;
  retryTimer = setTimeout(() => {
    retryTimer = null;
    resumeAccount();
  }, RETRY_DELAYS_MS[retryStep++]);
}

function clearRetry() {
  if (retryTimer) clearTimeout(retryTimer);
  retryTimer = null;
  retryStep = 0;
}

let listening = false;

/** Back online, back in the tab: send what is waiting. Lives as long as the tab. */
function ensureWindowListeners() {
  if (listening || typeof window === "undefined") return;
  listening = true;
  window.addEventListener("online", retryAccountNow);
  window.addEventListener("focus", retryAccountNow);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") retryAccountNow();
  });
}
