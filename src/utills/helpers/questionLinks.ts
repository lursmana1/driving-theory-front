import type { ExamQuestion } from "@/lib/types/exam";

export function getQuestionTicketPath(
  questionId: number | string,
  question?: unknown,
  fallbackCategoryId?: number,
): string {
  const q = question as Partial<ExamQuestion> | undefined;
  const categories = q?.categories ?? [];
  const category =
    (fallbackCategoryId != null &&
      categories.includes(fallbackCategoryId) &&
      fallbackCategoryId) ||
    categories[0] ||
    fallbackCategoryId ||
    1;
  return `/tickets/${category}?questionId=${questionId}`;
}

export function getQuestionPreview(question?: unknown, maxLen = 72): string {
  const q = question as Partial<ExamQuestion> | undefined;
  const text = q?.question?.trim();
  if (!text) return "";
  return text.length > maxLen ? `${text.slice(0, maxLen)}…` : text;
}
