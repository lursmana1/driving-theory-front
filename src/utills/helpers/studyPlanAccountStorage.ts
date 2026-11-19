import type { SavedStudyPlan } from "@/lib/types/studyPlan";
import type { PlanAction } from "./studyPlanActions";

/**
 * Browser copy of a signed-in user's plan and its unsaved changes, one key
 * per user, so a reload, a closed tab or a lost connection loses nothing.
 * Storage is not trusted: anything out of shape is dropped on read.
 */

/** A change waiting to be saved; `id` tells which ones a save carried. */
export type QueuedAction = PlanAction & { id: string };

export type StoredAccount = {
  /** Last plan known to be on the server. */
  base: SavedStudyPlan | null;
  /** Revision of `base`; null when the API predates revisions. */
  revision: number | null;
  /** A whole new plan to send (picked; reset = plan null), wins over `base`. */
  replace: { plan: SavedStudyPlan | null } | null;
  pending: QueuedAction[];
};

const storageKey = (userId: number) => `prava.studyPlan.account.v1.${userId}`;

export function readStoredAccount(userId: number): StoredAccount | null {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return null;
    const s = JSON.parse(raw) as Partial<StoredAccount> | null;
    if (!s || typeof s !== "object" || !Array.isArray(s.pending)) return null;
    return {
      base: asPlan(s.base),
      revision: Number.isInteger(s.revision) ? (s.revision as number) : null,
      replace:
        s.replace && typeof s.replace === "object"
          ? { plan: asPlan(s.replace.plan) }
          : null,
      pending: s.pending.filter(isQueuedAction),
    };
  } catch {
    return null;
  }
}

export function writeStoredAccount(userId: number, stored: StoredAccount) {
  try {
    const { base, revision, replace, pending } = stored;
    localStorage.setItem(
      storageKey(userId),
      JSON.stringify({ base, revision, replace, pending }),
    );
  } catch {
    // Private mode / storage full: unsaved changes live in memory only.
  }
}

export function newActionId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function asPlan(value: unknown): SavedStudyPlan | null {
  const plan = value as SavedStudyPlan | null | undefined;
  return plan?.version === 1 ? plan : null;
}

const isInt = (v: unknown): v is number => Number.isInteger(v);

export function isQueuedAction(value: unknown): value is QueuedAction {
  if (!value || typeof value !== "object") return false;
  const a = value as Record<string, unknown>;
  if (typeof a.id !== "string" || !isInt(a.day)) return false;
  switch (a.op) {
    case "step":
      return isInt(a.step) && typeof a.on === "string";
    case "test": {
      const r = a.result as Record<string, unknown> | null;
      return (
        isInt(a.step) &&
        typeof a.on === "string" &&
        Array.isArray(a.wrongIds) &&
        a.wrongIds.every(isInt) &&
        !!r &&
        isInt(r.correct) &&
        isInt(r.total) &&
        typeof r.passed === "boolean"
      );
    }
    case "mistakes":
      return Array.isArray(a.ids) && a.ids.every(isInt);
    case "fix":
      return isInt(a.questionId);
    default:
      return false;
  }
}
