import BaseApi from "./BaseApi";
import { markStatsStale } from "@/lib/statsRefresh";

export type PracticeAnswerResponse = {
  questionId: number;
  lang: string;
  subject: number | null;
  correct: boolean | null;
  seenOnly: boolean;
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
