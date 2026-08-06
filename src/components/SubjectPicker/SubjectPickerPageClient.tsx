"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { getCategories, getCategoryById, examRulesFromCategory } from "@/api/categories";
import { resolveCategoryId } from "@/CONSTS/categories";
import type { CategoryWithSubjects } from "@/lib/types/category";
import type { CategoryExamRules } from "@/CONSTS/categories";
import { subscribeStatsRefresh } from "@/lib/statsRefresh";
import CategoryPickerBar from "@/components/categoryComponents/CategoryPickerBar/CategoryPickerBar";
import SubjectPicker from "@/components/SubjectPicker/SubjectPicker";

export default function SubjectPickerPageClient() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const requestedCategoryId = searchParams.get("category")
    ? Number(searchParams.get("category"))
    : undefined;
  const categoryId = resolveCategoryId(requestedCategoryId);

  const [categories, setCategories] = useState<Awaited<ReturnType<typeof getCategories>>>([]);
  const [category, setCategory] = useState<CategoryWithSubjects | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadCategory = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [cats, cat] = await Promise.all([
        getCategories(),
        getCategoryById(categoryId, locale),
      ]);
      setCategories(cats);
      setCategory(cat);
    } catch {
      setError(true);
      setCategory(null);
    } finally {
      setLoading(false);
    }
  }, [categoryId, locale]);

  useEffect(() => {
    loadCategory();
    return subscribeStatsRefresh(loadCategory);
  }, [loadCategory]);

  if (loading) {
    return (
      <div className="section flex min-h-[40vh] items-center justify-center py-16">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="section py-16 text-center text-slate-500">
        Failed to load category. Check that the backend is running.
      </div>
    );
  }

  const examRules: CategoryExamRules = examRulesFromCategory(category);
  const subjects = (category.subjects ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    questionsCount: s.questionsCount ?? 0,
  }));

  return (
    <div className="section flex flex-col gap-5 bg-slate-50 py-6 sm:gap-6 sm:py-8">
      <CategoryPickerBar
        categories={categories.length > 0 ? categories : [category]}
        activeCategoryId={categoryId}
      />
      <SubjectPicker
        key={categoryId}
        categoryId={categoryId}
        subjects={subjects}
        examRules={examRules}
        durationMinutes={category.durationMinutes ?? 30}
      />
    </div>
  );
}
