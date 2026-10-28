import type { ExamQuestion } from "@/lib/types/exam";

/**
 * Per-question learning state from the API (`question_progress`).
 * - mistake: answered wrong, not cleared yet (in the trainer queue)
 * - cleared: was a mistake, cleared by spaced reviews
 * - correct: answered, never wrong
 */
export type QuestionProgressStatus = "mistake" | "cleared" | "correct";

export type QuestionProgress = {
  status: QuestionProgressStatus;
  /** Mistake whose review is due now. */
  due: boolean;
  /** ISO time of the next review; null unless status is "mistake". */
  dueAt: string | null;
  /** Correct due reviews still needed to clear; 0 unless "mistake". */
  reviewsLeft: number;
  wrongCount: number;
  correctCount: number;
};

export type TrainerSummary = {
  activeMistakes: number;
  dueNow: number;
  /** Cleared in the last 7 days. */
  clearedRecently: number;
  /** ISO time of the earliest future review; null when none. */
  nextDueAt: string | null;
};

export type TrainerSessionItem = {
  question: ExamQuestion;
  progress: QuestionProgress;
};

export type TrainerSessionResponse = {
  /** Due mistakes first, then the rest of the active mistakes. */
  data: TrainerSessionItem[];
  summary: TrainerSummary;
};
