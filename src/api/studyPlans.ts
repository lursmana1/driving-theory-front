import axios from "axios";
import BaseApi from "./BaseApi";
import type {
  PlanDaySession,
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

/** Signed-in user's saved plan; null when they have none (404). */
export async function getMyPlan(): Promise<SavedStudyPlan | null> {
  try {
    const res =
      await BaseApi.get<Omit<SavedStudyPlan, "version">>("/study-plans/me");
    return { version: 1, ...res.data };
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) return null;
    throw err;
  }
}

/** Create or replace the signed-in user's plan (choice + progress). */
export async function saveMyPlan(plan: SavedStudyPlan): Promise<void> {
  await BaseApi.put("/study-plans/me", {
    categoryId: plan.categoryId,
    dayCount: plan.dayCount,
    startDay: plan.startDay,
    examDay: plan.examDay,
    done: plan.done,
    tests: plan.tests,
    mistakes: plan.mistakes ?? {},
  });
}

export async function deleteMyPlan(): Promise<void> {
  await BaseApi.delete("/study-plans/me");
}
