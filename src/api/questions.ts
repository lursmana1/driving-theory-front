import { getServerBaseApi } from "@/api/ServerBaseApi";
import type { ExamQuestion, QuestionsResponse } from "@/lib/types/exam";

export type TicketQuestionsResult = {
  questions: ExamQuestion[];
  page: number;
  total: number;
};

type TicketQuestionsParams = {
  locale: string;
  categoryId: number;
  page: number;
  size: number;
  subjects: string;
  questionId: string;
};

export async function getTicketQuestions(
  params: TicketQuestionsParams,
): Promise<TicketQuestionsResult> {
  const api = await getServerBaseApi();

  if (params.questionId) {
    const res = await api.get<ExamQuestion | null>(
      `/questions/${params.questionId}`,
      { params: { lang: params.locale } },
    );
    const questions = res.data ? [res.data] : [];
    return { questions, page: 1, total: questions.length };
  }

  const res = await api.get<QuestionsResponse>("/questions", {
    params: {
      category: params.categoryId,
      subjects: params.subjects,
      page: params.page,
      size: params.size,
      lang: params.locale,
    },
  });
  const questionsRes = res.data;
  const rawItems: unknown = questionsRes?.items ?? questionsRes;
  const questions = Array.isArray(rawItems)
    ? (rawItems as ExamQuestion[])
    : rawItems
      ? [rawItems as ExamQuestion]
      : [];

  return {
    questions,
    page: questionsRes?.page ?? params.page,
    total: questionsRes?.total ?? questions.length,
  };
}
