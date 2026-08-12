import axios from "axios";
import BaseApi from "./BaseApi";
import type {
  ExamRulesPayload,
  OverviewWeakQuestion,
  OverviewWeakSubject,
  QuestionPoolStats,
  ReadinessScore,
  SubjectProgress,
} from "@/lib/types/userStats";

export type WeakQuestion = OverviewWeakQuestion;

export type WeakSubject = OverviewWeakSubject;

export type ReadinessResponse = ReadinessScore & {
  examRules?: ExamRulesPayload;
};

function unwrapArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object" && "data" in payload) {
    const nested = (payload as { data: unknown }).data;
    if (Array.isArray(nested)) return nested;
  }
  return [];
}

export async function getReadiness(
  categoryId: number,
): Promise<ReadinessResponse> {
  const res = await BaseApi.get<ReadinessResponse>("/user-stats/readiness", {
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
  categoryId: number,
): Promise<WeakQuestion[]> {
  const res = await BaseApi.get<{ data: WeakQuestion[] } | WeakQuestion[]>(
    "/user-stats/weak-questions",
    { params: { category: categoryId } },
  );
  return unwrapArray(res.data);
}

export async function getWeakSubjects(
  categoryId: number,
): Promise<WeakSubject[]> {
  const res = await BaseApi.get<{ data: WeakSubject[] } | WeakSubject[]>(
    "/user-stats/weak-subjects",
    { params: { category: categoryId } },
  );
  return unwrapArray(res.data);
}

export async function getQuestionPool(
  categoryId: number,
): Promise<QuestionPoolStats> {
  const res = await BaseApi.get<QuestionPoolStats>(
    "/user-stats/question-pool",
    { params: { category: categoryId } },
  );
  return res.data;
}

export function isAuthError(err: unknown): boolean {
  return axios.isAxiosError(err) && err.response?.status === 401;
}

export type { OverviewWeakQuestion, OverviewWeakSubject };
