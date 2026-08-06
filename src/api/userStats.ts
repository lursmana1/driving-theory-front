import axios from "axios";
import BaseApi from "./BaseApi";
import type {
  ReadinessScore,
  SubjectProgress,
  UserStatsOverview,
  OverviewWeakQuestion,
  OverviewWeakSubject,
} from "@/lib/types/userStats";

export type WeakQuestion = {
  questionId: number;
  wrongCount: number;
  question: unknown;
};

export type WeakSubject = {
  subjectId: number;
  wrongCount: number;
  correctCount: number;
  totalQuestions: number;
  name?: string;
};

function unwrapArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object" && "data" in payload) {
    const nested = (payload as { data: unknown }).data;
    if (Array.isArray(nested)) return nested;
  }
  return [];
}

function normalizeOverview(raw: UserStatsOverview): UserStatsOverview {
  return {
    ...raw,
    subjectProgress: unwrapArray<SubjectProgress>(raw.subjectProgress),
    weakSubjects: unwrapArray<OverviewWeakSubject>(raw.weakSubjects),
    weakQuestions: unwrapArray<OverviewWeakQuestion>(raw.weakQuestions),
  };
}

export async function getUserStatsOverview(
  categoryId: number,
): Promise<UserStatsOverview> {
  const res = await BaseApi.get<UserStatsOverview>("/user-stats/overview", {
    params: { category: categoryId },
  });
  return normalizeOverview(res.data);
}

export async function getReadiness(categoryId: number): Promise<ReadinessScore> {
  const res = await BaseApi.get<ReadinessScore>("/user-stats/readiness", {
    params: { category: categoryId },
  });
  return res.data;
}

export async function getSubjectProgress(
  categoryId: number,
): Promise<SubjectProgress[]> {
  const res = await BaseApi.get<SubjectProgress[] | { data: SubjectProgress[] }>(
    "/user-stats/subject-progress",
    { params: { category: categoryId } },
  );
  return unwrapArray(res.data);
}

export async function getWeakQuestions(
  categoryId?: number,
): Promise<WeakQuestion[]> {
  const res = await BaseApi.get<{ data: WeakQuestion[] } | WeakQuestion[]>(
    "/user-stats/weak-questions",
    { params: categoryId != null ? { category: categoryId } : undefined },
  );
  return unwrapArray(res.data);
}

export async function getWeakSubjects(
  categoryId?: number,
): Promise<WeakSubject[]> {
  const res = await BaseApi.get<{ data: WeakSubject[] } | WeakSubject[]>(
    "/user-stats/weak-subjects",
    { params: categoryId != null ? { category: categoryId } : undefined },
  );
  return unwrapArray(res.data);
}

export function isAuthError(err: unknown): boolean {
  return axios.isAxiosError(err) && err.response?.status === 401;
}

export type { OverviewWeakQuestion, OverviewWeakSubject, UserStatsOverview };
