import type { ExamQuestion } from "@/lib/types/exam";

export type ExamReviewItem = {
  question: ExamQuestion;
  picked: string;
};

/** Wrong picks only. Unanswered questions are skipped. */
export function getExamReviewItems(
  examQuestions: ExamQuestion[],
  answersById: Record<string, string>,
  correctById: Record<string, boolean>,
  hydratedQuestions?: ExamQuestion[] | null,
): ExamReviewItem[] {
  const fullById = new Map(
    (hydratedQuestions ?? examQuestions).map((q) => [String(q.id), q]),
  );

  const items: ExamReviewItem[] = [];
  for (const q of examQuestions) {
    const id = String(q.id);
    const picked = answersById[id];
    if (!picked) continue;

    const full = fullById.get(id) ?? q;
    const isWrong =
      correctById[id] === false ||
      (correctById[id] !== true &&
        !!full.correct_answer &&
        picked !== full.correct_answer);
    if (!isWrong) continue;

    items.push({ question: full, picked });
  }
  return items;
}
