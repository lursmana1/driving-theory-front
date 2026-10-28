import BaseApi from "./BaseApi";
import type {
  TrainerSessionResponse,
  TrainerSummary,
} from "@/lib/types/trainer";

/** Badge counts for the profile entry point. JWT required. */
export async function getTrainerSummary(
  categoryId: number,
  lang: string,
): Promise<TrainerSummary> {
  const res = await BaseApi.get<TrainerSummary>("/trainer/summary", {
    params: { category: categoryId, lang },
  });
  return res.data;
}

/**
 * Next batch of mistakes (due first) with full questions. Answers go
 * through POST /practice-answers, which moves each question along.
 */
export async function getTrainerSession(
  categoryId: number,
  lang: string,
  options: { subjects?: number[]; limit?: number } = {},
): Promise<TrainerSessionResponse> {
  const res = await BaseApi.get<TrainerSessionResponse>("/trainer/session", {
    params: {
      category: categoryId,
      lang,
      subjects: options.subjects?.length
        ? options.subjects.join(",")
        : undefined,
      limit: options.limit,
    },
  });
  return res.data;
}
