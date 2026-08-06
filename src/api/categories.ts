import BaseApi from "./BaseApi";
import { resolveCategoryIconKey } from "@/CONSTS/categoryAssets";
import { enrichSubjectsWithLocalizedNames } from "@/CONSTS/subjects";
import type { Category, CategoryWithSubjects } from "@/lib/types/category";
import type { CategoryExamRules } from "@/CONSTS/categories";

function normalizeCategory(raw: Category): Category {
  const questionCount =
    raw.questionCount ?? raw.examTotalQuestions ?? 30;
  const minCorrectToPass =
    raw.minCorrectToPass ?? raw.examPassScore ?? questionCount;
  const maxWrongAnswers =
    raw.maxWrongAnswers ?? Math.max(0, questionCount - minCorrectToPass);

  return {
    ...raw,
    iconKey: resolveCategoryIconKey(raw.iconKey, raw.id),
    questionCount,
    minCorrectToPass,
    maxWrongAnswers,
    durationMinutes: raw.durationMinutes ?? 30,
    examTotalQuestions: questionCount,
    examPassScore: minCorrectToPass,
  };
}

export function examRulesFromCategory(category: Category): CategoryExamRules {
  const normalized = normalizeCategory(category);
  return {
    totalQuestions: normalized.questionCount!,
    passScore: normalized.minCorrectToPass!,
    maxMistakes: normalized.maxWrongAnswers!,
  };
}

export async function getCategories(): Promise<Category[]> {
  const res = await BaseApi.get<Category[]>("/categories");
  return (res.data ?? []).map(normalizeCategory);
}

export async function getCategoryById(
  id: number,
  locale?: string,
): Promise<CategoryWithSubjects> {
  const res = await BaseApi.get<CategoryWithSubjects>(`/categories/${id}`);
  const rawSubjects = res.data.subjects ?? [];
  const subjects = locale
    ? enrichSubjectsWithLocalizedNames(rawSubjects, locale)
    : rawSubjects;
  return { ...normalizeCategory(res.data), subjects };
}
