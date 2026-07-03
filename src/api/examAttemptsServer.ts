import { getServerBaseApi } from "./ServerBaseApi";
import {
  getExamRules,
  toCategoryExamRules,
  type CategoryExamRules,
} from "@/CONSTS/categories";
import type { ExamQuestion } from "@/lib/types/exam";
import { normalizeQuestions } from "@/utills/helpers/normalizeQuestions";

type FetchExamParams = {
  lang: string;
  subjects?: string;
  categories?: string;
  count?: number;
  allSubjects?: boolean;
};

export type FetchExamResult = {
  questions: ExamQuestion[];
  attemptId: number | null;
  endDate: string | null;
  examRules: CategoryExamRules;
  error?: "insufficient_questions" | "start_failed";
};

function categoryIdFromParams(categories?: string): number {
  const id = Number(categories ?? "1");
  return Number.isFinite(id) ? id : 1;
}

function rulesFromStartData(
  data: {
    questionCount?: number;
    minCorrectToPass?: number;
  },
  categoryId: number,
): CategoryExamRules {
  if (data.questionCount != null && data.minCorrectToPass != null) {
    return toCategoryExamRules({
      questionCount: data.questionCount,
      minCorrectToPass: data.minCorrectToPass,
    });
  }
  return getExamRules(categoryId);
}

export async function fetchExamServer(
  params: FetchExamParams,
): Promise<FetchExamResult> {
  const categoryId = categoryIdFromParams(params.categories);
  const fallbackRules = getExamRules(categoryId);
  const searchParams = new URLSearchParams({
    lang: params.lang,
    count: String(params.count ?? fallbackRules.totalQuestions),
  });
  if (params.subjects) searchParams.set("subjects", params.subjects);
  if (params.categories) searchParams.set("categories", params.categories);
  if (params.allSubjects) searchParams.set("allSubjects", "true");

  try {
    const api = await getServerBaseApi();
    const res = await api.post(`/exam-attempts/start?${searchParams}`);

    if (res.status === 401 || res.status === 403) {
      return fetchRandomQuestions(params, fallbackRules);
    }

    if (res.status === 400) {
      const message = String(res.data?.message ?? "");
      if (message.toLowerCase().includes("insufficient")) {
        return {
          questions: [],
          attemptId: null,
          endDate: null,
          examRules: fallbackRules,
          error: "insufficient_questions",
        };
      }
    }

    if (res.status !== 200 && res.status !== 201) {
      throw new Error(`Exam fetch failed: ${res.status}`);
    }

    const data = res.data;
    return {
      questions: normalizeQuestions(data.questions),
      attemptId: data.attemptId ?? null,
      endDate: data.endDate ?? null,
      examRules: rulesFromStartData(data, categoryId),
    };
  } catch {
    return fetchRandomQuestions(params, fallbackRules);
  }
}

export async function fetchExamServerSafe(
  params: FetchExamParams,
): Promise<FetchExamResult> {
  try {
    return await fetchExamServer(params);
  } catch {
    const categoryId = categoryIdFromParams(params.categories);
    return {
      questions: [],
      attemptId: null,
      endDate: null,
      examRules: getExamRules(categoryId),
      error: "start_failed",
    };
  }
}

async function fetchRandomQuestions(
  params: FetchExamParams,
  examRules: CategoryExamRules,
): Promise<FetchExamResult> {
  const searchParams = new URLSearchParams({
    lang: params.lang,
    count: String(params.count ?? examRules.totalQuestions),
    category: params.categories ?? "1",
  });
  if (params.subjects) searchParams.set("subjects", params.subjects);

  const api = await getServerBaseApi();
  const res = await api.get(`/questions/random?${searchParams}`);

  if (res.status !== 200) {
    throw new Error("Failed to fetch questions");
  }

  return {
    questions: normalizeQuestions(res.data),
    attemptId: null,
    endDate: null,
    examRules,
  };
}
