import axios from "axios";
import BaseApi from "./BaseApi";
import type {
  PlanDaySession,
  PlanHistoryItem,
  SavedStudyPlan,
  StudyPlanPreview,
} from "@/lib/types/studyPlan";
import { studyDayOf } from "@/utills/helpers/studyPlanProgress";

export type PlanLengthQuery = { days?: number; examDay?: string };

/** Previews already fetched in this tab (plan home → day page → back). */
const previewCache = new Map<string, Promise<StudyPlanPreview>>();
const PREVIEW_CACHE_MAX = 8;

/**
 * Public. The plan for a category and a length (days or exam date). Cached
 * per study day, since the server counts the plan's dates from today.
 */
export function getPlanPreview(
  categoryId: number,
  length: PlanLengthQuery,
): Promise<StudyPlanPreview> {
  const key = `${studyDayOf()}|${categoryId}|${length.days ?? ""}|${length.examDay ?? ""}`;
  const cached = previewCache.get(key);
  if (cached) return cached;

  const request = BaseApi.get<StudyPlanPreview>("/study-plans/preview", {
    params: { category: categoryId, ...length },
  }).then((res) => res.data);
  request.catch(() => previewCache.delete(key));
  if (previewCache.size >= PREVIEW_CACHE_MAX) {
    previewCache.delete(previewCache.keys().next().value!);
  }
  previewCache.set(key, request);
  return request;
}

/**
 * Drops this tab's cached previews of a plan, so the next `getPlanPreview`
 * reads the server again (its schedule changed since it was cached).
 */
export function forgetPlanPreview(categoryId: number, days: number) {
  for (const key of [...previewCache.keys()]) {
    const [, cat, len] = key.split("|");
    if (cat === String(categoryId) && len === String(days)) {
      previewCache.delete(key);
    }
  }
}

/** Public. One day with the question ids of each step and the questions. */
export async function getPlanDay(
  categoryId: number,
  dayCount: number,
  index: number,
  lang: string,
): Promise<PlanDaySession> {
  const res = await BaseApi.get<PlanDaySession>(
    `/study-plans/preview/days/${index}`,
    { params: { category: categoryId, days: dayCount, lang } },
  );
  return res.data;
}

type SavedPlanResponse = Omit<SavedStudyPlan, "version"> & {
  /** Missing from APIs before revisions. */
  revision?: number;
};

function fromResponse(res: SavedPlanResponse): SavedStudyPlan {
  const plan: SavedStudyPlan & { revision?: number } = { version: 1, ...res };
  delete plan.revision;
  return plan;
}

/**
 * The account plan and its revision. `revision` null: the API predates
 * revisions (saves then go out without `baseRevision`, last write wins).
 * No plan (404): `plan` null, revision 0 ("create only").
 */
export type AccountPlan = {
  plan: SavedStudyPlan | null;
  revision: number | null;
};

/** 409 on save: someone saved first; `current` is the plan now on the server. */
export class PlanConflictError extends Error {
  constructor(readonly current: AccountPlan) {
    super("Study plan changed");
  }
}

export async function getMyPlan(): Promise<AccountPlan> {
  try {
    const res = await BaseApi.get<SavedPlanResponse>("/study-plans/me");
    return { plan: fromResponse(res.data), revision: res.data.revision ?? null };
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return { plan: null, revision: 0 };
    }
    throw err;
  }
}

/**
 * Create or replace the signed-in user's plan (choice + progress). With
 * `baseRevision` the server writes only over that revision, else throws
 * `PlanConflictError`. Returns the new revision (null from an older API).
 */
export async function saveMyPlan(
  plan: SavedStudyPlan,
  baseRevision: number | null,
): Promise<number | null> {
  try {
    const res = await BaseApi.put<SavedPlanResponse>("/study-plans/me", {
      categoryId: plan.categoryId,
      dayCount: plan.dayCount,
      startDay: plan.startDay,
      examDay: plan.examDay,
      done: plan.done,
      tests: plan.tests,
      mistakes: plan.mistakes ?? {},
      shift: plan.shift ?? 0,
      dayHashes: plan.dayHashes ?? {},
      completed: plan.completed ?? {},
      ...(baseRevision != null ? { baseRevision } : {}),
    });
    return res.data?.revision ?? null;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 409) {
      const current = (
        err.response.data as { plan?: SavedPlanResponse | null } | undefined
      )?.plan;
      throw new PlanConflictError(
        current
          ? { plan: fromResponse(current), revision: current.revision ?? null }
          : { plan: null, revision: 0 },
      );
    }
    throw err;
  }
}

/** 400 and other 4xx (not 408 / 429): sending the same body again won't help. */
export function isPermanentSaveError(err: unknown): boolean {
  const status = axios.isAxiosError(err) ? err.response?.status : undefined;
  return status != null && status >= 400 && status < 500 && status !== 408 && status !== 429;
}

/** Plans the signed-in user left, newest first. */
export async function getMyPlanHistory(): Promise<PlanHistoryItem[]> {
  const res = await BaseApi.get<PlanHistoryItem[]>("/study-plans/history");
  return res.data;
}

export async function deleteMyPlan(): Promise<void> {
  await BaseApi.delete("/study-plans/me");
}
