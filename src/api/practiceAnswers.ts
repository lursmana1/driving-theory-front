import BaseApi from "./BaseApi";
import { markStatsStale } from "@/lib/statsRefresh";
import type { QuestionProgress } from "@/lib/types/trainer";

export type PracticeAnswerResponse = {
  questionId: number;
  lang: string;
  subject: number | null;
  correct: boolean | null;
  seenOnly: boolean;
  /** Mistake-trainer state after this answer; null for seen-only. */
  progress?: QuestionProgress | null;
};

export async function postPracticeAnswer(
  questionId: number,
  lang: string,
  chosenAnswer: string,
): Promise<PracticeAnswerResponse> {
  const res = await BaseApi.post<PracticeAnswerResponse>(
    "/practice-answers",
    { questionId, chosenAnswer: chosenAnswer.trim() },
    { params: { lang } },
  );
  markStatsStale();
  return res.data;
}
