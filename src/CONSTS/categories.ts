import categoriesData from "@/data/categories.json";
import type { Category } from "@/lib/types/category";

export const licenseCategories: Category[] = categoriesData as Category[];

export const DEFAULT_CATEGORY_ID = 1;

export type CategoryExamRules = {
  totalQuestions: number;
  passScore: number;
  maxMistakes: number;
};

export function toCategoryExamRules(rule: {
  questionCount: number;
  minCorrectToPass: number;
}): CategoryExamRules {
  return {
    totalQuestions: rule.questionCount,
    passScore: rule.minCorrectToPass,
    maxMistakes: rule.questionCount - rule.minCorrectToPass,
  };
}

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
  const totalQuestions =
    category.questionCount ?? category.examTotalQuestions ?? 30;
  const passScore =
    category.minCorrectToPass ?? category.examPassScore ?? totalQuestions;
  const maxMistakes =
    category.maxWrongAnswers ?? Math.max(0, totalQuestions - passScore);
  return {
    totalQuestions,
    passScore,
    maxMistakes,
  };
}

/** Guess category when history API omits categories (matches question + pass rules). */
export function inferCategoryIdFromExamRules(
  questionCount: number,
  minCorrectToPass: number | null | undefined,
): number | null {
  if (minCorrectToPass != null) {
    const exact = licenseCategories.find((c) => {
      const rules = getExamRules(c.id);
      return (
        rules.totalQuestions === questionCount &&
        rules.passScore === minCorrectToPass
      );
    });
    if (exact) return exact.id;
  }

  const byCount = licenseCategories.filter(
    (c) => getExamRules(c.id).totalQuestions === questionCount,
  );
  if (byCount.length === 1) return byCount[0].id;

  // Legacy rows without minCorrectToPass — best-effort defaults
  if (questionCount === 20) return 0;
  if (questionCount === 30) return 1;
  if (questionCount === 35) return 5;
  if (questionCount === 40) return 3;

  return null;
}
