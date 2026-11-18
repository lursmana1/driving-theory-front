import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import type { ExamQuestion } from "@/lib/types/exam";

/** Real ticket shown in the landing hero (red / blue car at crossing paths). */
export const LANDING_DEMO_QUESTION_ID = 13;

const GREETING = /^(?:გამარჯობა|hello|hi|привет|здравствуйте)[!,.]?\s*/iu;

export type LandingDemoQuestion = Pick<
  ExamQuestion,
  "id" | "question" | "correct_answer" | "img" | "categories"
> & {
  answers: string[];
  aiText: string;
  audio: string | null;
};

/**
 * Plain cached fetch (no cookies), so the landing page stays static.
 * Returns null on any failure; the hero then shows its illustration instead.
 */
export async function getLandingDemoQuestion(
  locale: string,
): Promise<LandingDemoQuestion | null> {
  const base = getApiBaseUrl();
  if (!base) return null;
  try {
    const res = await fetch(
      `${base}/questions/${LANDING_DEMO_QUESTION_ID}?lang=${locale}`,
      { next: { revalidate: 86400 } },
    );
    if (!res.ok) return null;
    const q = (await res.json()) as ExamQuestion | null;
    if (!q?.question || !q.img) return null;
    const answers = [q.answer_1, q.answer_2, q.answer_3, q.answer_4].filter(
      (a): a is string => typeof a === "string" && a.trim().length > 0,
    );
    if (answers.length < 2) return null;
    const ai = (q.ai_tutor ?? q.aiTutor ?? "").trim().replace(GREETING, "");
    return {
      id: q.id,
      question: q.question,
      correct_answer: String(q.correct_answer),
      img: q.img,
      categories: q.categories ?? [],
      answers,
      aiText: ai,
      audio: typeof q.audio === "string" && q.audio.trim() ? q.audio.trim() : null,
    };
  } catch {
    return null;
  }
}
