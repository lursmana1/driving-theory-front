"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Category } from "@/lib/types/category";
import { DEFAULT_CATEGORY_ID, resolveCategoryId } from "@/CONSTS/categories";
import { getCategories } from "@/api/categories";
import { useProfileOverview } from "@/utills/helpers/hooks/useProfileOverview";
import { ProfileReadinessCard } from "@/components/Profile/ProfileReadinessCard";
import { ProfileWeakCharts } from "@/components/Profile/ProfileWeakCharts";

type ProfileOverviewSectionProps = {
  defaultCategoryId?: number;
  categories?: Category[];
};

export default function ProfileOverviewSection({
  defaultCategoryId = DEFAULT_CATEGORY_ID,
  categories: categoriesProp,
}: ProfileOverviewSectionProps) {
  const searchParams = useSearchParams();
  const queryParams = useMemo(
    () => Object.fromEntries(searchParams.entries()),
    [searchParams],
  );
  const categoryId = resolveCategoryId(
    searchParams.get("category")
      ? Number(searchParams.get("category"))
      : defaultCategoryId,
  );

  const [fallbackCategories, setFallbackCategories] = useState<Category[]>([]);
  const categories = categoriesProp?.length
    ? categoriesProp
    : fallbackCategories;

  useEffect(() => {
    if (categoriesProp?.length) return;
    getCategories()
      .then(setFallbackCategories)
      .catch(() => setFallbackCategories([]));
  }, [categoriesProp]);

  const overview = useProfileOverview(categoryId);

  return (
    <div className="space-y-4 sm:space-y-6">
      <ProfileReadinessCard
        categories={categories}
        categoryId={categoryId}
        queryParams={queryParams}
        authLoading={overview.authLoading}
        readiness={overview.readiness}
        readinessLoading={overview.readinessLoading}
        readinessError={overview.readinessError}
        poolExposure={overview.poolExposure}
      />
      <ProfileWeakCharts
        categoryId={categoryId}
        weakQuestions={overview.weakQuestions}
        weakQuestionsLoading={overview.weakQuestionsLoading}
        weakSubjectsLoading={overview.weakSubjectsLoading}
        topWeakQuestions={overview.topWeakQuestions}
        topWeakSubjects={overview.topWeakSubjects}
        subjectNames={overview.subjectNames}
        showChartsSection={overview.showChartsSection}
      />
    </div>
  );
}
