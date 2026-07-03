import axios from "axios";
import BaseApi from "./BaseApi";
import {
  getExamRules,
  toCategoryExamRules,
  type CategoryExamRules,
} from "@/CONSTS/categories";
import type { ExamQuestion } from "@/lib/types/exam";
import { getAccessToken } from "@/lib/authToken";
import { normalizeQuestions } from "@/utills/helpers/normalizeQuestions";

export type ExamRuleEntry = {
  categoryId: number;
  questionCount: number;
  minCorrectToPass: number;
};

export type StartExamParams = {
  lang?: string;
  subjects?: string;
  categories?: string;
  count?: number;
  allSubjects?: string;
};

export type StartExamResponse = {
  attemptId: number;
  endDate: string;
  questions: ExamQuestion[];
  questionCount?: number;
  minCorrectToPass?: number;
};

export function examRulesFromStartResponse(
  data: Pick<StartExamResponse, "questionCount" | "minCorrectToPass">,
  categoryId: number,
): CategoryExamRules {
  if (
    data.questionCount != null &&
    data.minCorrectToPass != null
  ) {
    return toCategoryExamRules({
      questionCount: data.questionCount,
      minCorrectToPass: data.minCorrectToPass,
    });
  }
  return getExamRules(categoryId);
}

export async function getExamRulesApi(): Promise<ExamRuleEntry[]> {
  const res = await BaseApi.get<ExamRuleEntry[] | { data: ExamRuleEntry[] }>(
    "/exam-attempts/rules",
  );
  const payload = res.data;
  return Array.isArray(payload) ? payload : (payload.data ?? []);
}

export async function getExamRulesForCategory(
  categoryId: number,
): Promise<CategoryExamRules> {
  try {
    const rules = await getExamRulesApi();
    const match = rules.find((r) => r.categoryId === categoryId);
    if (match) return toCategoryExamRules(match);
  } catch {
    // fall back to static rules when API is unavailable or requires auth
  }
  return getExamRules(categoryId);
}

export type SubmitAnswerResponse = {
  correct: boolean;
};

export type FinishExamResponse = {
  completedAt: string;
  passed: boolean;
  durationSeconds: number;
};

export type AttemptSummary = {
  id: number;
  questionCount: number;
  answeredCount: number;
  correctCount: number;
  createdAt: string;
  endDate: string | null;
  completedAt: string | null;
  passed: boolean | null;
  durationSeconds: number | null;
};

export type AttemptsHistoryResponse = {
  data: AttemptSummary[];
  total: number;
  page: number;
  totalPages: number;
};

export async function startPersonalizedExam(
  params: StartExamParams = {},
): Promise<StartExamResponse> {
  const searchParams = new URLSearchParams();
  if (params.lang) searchParams.set("lang", params.lang);
  if (params.count) searchParams.set("count", String(params.count));
  if (params.subjects) searchParams.set("subjects", params.subjects);
  if (params.categories) searchParams.set("categories", params.categories);
  if (params.allSubjects !== undefined)
    searchParams.set("allSubjects", String(params.allSubjects));

  const res = await BaseApi.post<StartExamResponse>(
    `/exam-attempts/start?${searchParams.toString()}`,
  );
  return res.data;
}

export type FetchExamClientParams = {
  lang: string;
  subjects?: string;
  categories?: string;
  count?: number;
};

export type FetchExamClientResult = {
  questions: ExamQuestion[];
  attemptId: number | null;
  endDate: string | null;
  examRules: CategoryExamRules;
  error?: "insufficient_questions" | "load_failed";
};

async function fetchRandomExamQuestions(
  params: FetchExamClientParams,
  examRules: CategoryExamRules,
): Promise<FetchExamClientResult> {
  const searchParams = new URLSearchParams({
    lang: params.lang,
    count: String(params.count ?? examRules.totalQuestions),
    category: params.categories ?? "1",
  });
  if (params.subjects) searchParams.set("subjects", params.subjects);

  const res = await BaseApi.get(`/questions/random?${searchParams}`);
  return {
    questions: normalizeQuestions(res.data),
    attemptId: null,
    endDate: null,
    examRules,
  };
}

/** Start exam from the browser so Bearer token is available (production cross-origin). */
export async function fetchExamClient(
  params: FetchExamClientParams,
): Promise<FetchExamClientResult> {
  const categoryId = Number(params.categories ?? "1");
  const examRules = getExamRules(Number.isFinite(categoryId) ? categoryId : 1);

  if (getAccessToken()) {
    try {
      const data = await startPersonalizedExam({
        lang: params.lang,
        subjects: params.subjects,
        categories: params.categories,
        count: params.count ?? examRules.totalQuestions,
      });

      return {
        questions: normalizeQuestions(data.questions),
        attemptId: data.attemptId ?? null,
        endDate: data.endDate ?? null,
        examRules: examRulesFromStartResponse(data, categoryId),
      };
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const message = String(err.response?.data?.message ?? "");

        if (
          status === 400 &&
          message.toLowerCase().includes("insufficient")
        ) {
          return {
            questions: [],
            attemptId: null,
            endDate: null,
            examRules,
            error: "insufficient_questions",
          };
        }

        if (status === 401 || status === 403) {
          return fetchRandomExamQuestions(params, examRules);
        }
      }
    }
  }

  try {
    return await fetchRandomExamQuestions(params, examRules);
  } catch {
    return {
      questions: [],
      attemptId: null,
      endDate: null,
      examRules,
      error: "load_failed",
    };
  }
}

export async function finishExam(
  attemptId: number,
): Promise<FinishExamResponse> {
  const res = await BaseApi.post<FinishExamResponse>(
    `/exam-attempts/${attemptId}/finish`,
  );
  return res.data;
}

export async function getAttempt(attemptId: number): Promise<{
  id: number;
  questionIds: number[];
  questions: ExamQuestion[];
  answers: unknown[];
  createdAt: string;
  endDate: string | null;
  completedAt: string | null;
  passed: boolean | null;
  durationSeconds: number | null;
}> {
  const res = await BaseApi.get(`/exam-attempts/${attemptId}`);
  return res.data;
}

export async function getAttemptsHistory(
  page = 1,
  size = 10,
): Promise<AttemptsHistoryResponse> {
  const res = await BaseApi.get<AttemptsHistoryResponse>("/exam-attempts", {
    params: { page, size },
  });
  return res.data;
}

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
};

export async function getWeakQuestions(): Promise<WeakQuestion[]> {
  const res = await BaseApi.get<{ data: WeakQuestion[] }>(
    "/user-stats/weak-questions",
  );
  return res.data?.data ?? [];
}

export async function getWeakSubjects(): Promise<WeakSubject[]> {
  const res = await BaseApi.get<{ data: WeakSubject[] }>(
    "/user-stats/weak-subjects",
  );
  return res.data?.data ?? [];
}

export async function submitAnswer(
  attemptId: number,
  questionId: number | string,
  chosenAnswer: string,
): Promise<SubmitAnswerResponse> {
  const qId =
    typeof questionId === "number"
      ? questionId
      : parseInt(String(questionId), 10);
  const res = await BaseApi.post<SubmitAnswerResponse>(
    `/exam-attempts/${attemptId}/answer`,
    { questionId: qId, chosenAnswer },
  );
  return res.data;
}
