import type { ExamQuestion } from "@/lib/types/exam";

export function getQuestionTicketPath(
  questionId: number | string,
  question?: unknown,
): string {
  const q = question as Partial<ExamQuestion> | undefined;
  const category = q?.categories?.[0] ?? 1;
  return `/tickets/${category}?questionId=${questionId}`;
}

export function getQuestionPreview(question?: unknown, maxLen = 72): string {
  const q = question as Partial<ExamQuestion> | undefined;
  const text = q?.question?.trim();
  if (!text) return "";
  return text.length > maxLen ? `${text.slice(0, maxLen)}…` : text;
}
