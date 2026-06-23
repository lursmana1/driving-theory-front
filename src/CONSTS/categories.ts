import categoriesData from "@/data/categories.json";
import type { Category } from "@/lib/types/category";

export const licenseCategories: Category[] = categoriesData as Category[];

export const DEFAULT_CATEGORY_ID = 1;

export type CategoryExamRules = {
  totalQuestions: number;
  passScore: number;
  maxMistakes: number;
};

export function getCategoryById(id: number): Category | undefined {
  return licenseCategories.find((c) => c.id === id);
}

export function isValidCategoryId(id: number): boolean {
  return licenseCategories.some((c) => c.id === id);
}

export function resolveCategoryId(requested?: number): number {
  if (requested != null && isValidCategoryId(requested)) {
    return requested;
  }
  return DEFAULT_CATEGORY_ID;
}

/** Official theory exam rules per license category (Georgia). */
export function getExamRules(categoryId: number): CategoryExamRules {
  const category = getCategoryById(categoryId) ?? getCategoryById(DEFAULT_CATEGORY_ID)!;
  const totalQuestions = category.examTotalQuestions;
  const passScore = category.examPassScore;
  return {
    totalQuestions,
    passScore,
    maxMistakes: totalQuestions - passScore,
  };
}
