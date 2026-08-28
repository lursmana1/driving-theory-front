// useExamProgress.ts
import { useMemo } from "react";
import type { ExamQuestion } from "@/lib/types/exam";

const NO_VERDICTS: Record<string, boolean> = {};

/**
 * Live exam questions omit `correct_answer`, so a graded attempt scores from the
 * server verdicts in `correctById`. Guest practice runs still grade locally.
 * An answer with no verdict yet counts as answered but not yet scored.
 */
export function useExamProgress(
  examQuestions: ExamQuestion[],
  answersById: Record<string, string>,
  correctById: Record<string, boolean> = NO_VERDICTS,
) {
  return useMemo(() => {
    let score = 0;
    let mistake = 0;
    let totalAnswered = 0;

    for (const q of examQuestions) {
      const id = String(q.id);
      const picked = answersById[id];
      if (!picked) continue;

      totalAnswered += 1;

      const verdict =
        correctById[id] ??
        (q.correct_answer ? picked === q.correct_answer : undefined);
      if (verdict === undefined) continue;

      if (verdict) score += 1;
      else mistake += 1;
    }

    return { score, mistake, totalAnswered };
  }, [examQuestions, answersById, correctById]);
}
