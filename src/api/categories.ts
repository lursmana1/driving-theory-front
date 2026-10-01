import BaseApi from "./BaseApi";
import { cache } from "react";
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

export function normalizeCategoryList(
  data: Category[] | null | undefined,
): Category[] {
  return (data ?? []).map(normalizeCategory);
}

export function normalizeCategoryDetail(
  data: CategoryWithSubjects,
  locale?: string,
): CategoryWithSubjects {
  const rawSubjects = data.subjects ?? [];
  const subjects = locale
    ? enrichSubjectsWithLocalizedNames(rawSubjects, locale)
    : rawSubjects;
  return { ...normalizeCategory(data), subjects };
}

export const getCategories = cache(async (): Promise<Category[]> => {
  const res = await BaseApi.get<Category[]>("/categories");
  return normalizeCategoryList(res.data);
});

export const getCategoryById = cache(
  async (id: number, locale?: string): Promise<CategoryWithSubjects> => {
    const res = await BaseApi.get<CategoryWithSubjects>(`/categories/${id}`);
    return normalizeCategoryDetail(res.data, locale);
  },
);
