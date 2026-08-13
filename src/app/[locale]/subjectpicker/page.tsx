import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { getCategories } from "@/api/categories";
import { resolveCategoryId } from "@/CONSTS/categories";
import CategoryPickerBar from "@/components/categoryComponents/CategoryPickerBar/CategoryPickerBar";
import StatsRefreshListener from "@/components/SubjectPicker/StatsRefreshListener";
import SubjectPickerContent from "@/components/SubjectPicker/SubjectPickerContent";
import SubjectPickerSkeleton from "@/components/SubjectPicker/SubjectPickerSkeleton";
import { searchParamsToRecord, type SearchParamsRecord } from "@/lib/searchParams";
import { pageMeta } from "@/lib/pageMeta";

type SubjectPickerPageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<SearchParamsRecord>;
};

export async function generateMetadata({ params }: SubjectPickerPageProps) {
  const { locale } = await params;
  return pageMeta("subjectpicker", { locale });
}

export default async function SubjectPickerPage({
  params,
  searchParams,
}: SubjectPickerPageProps) {
  const { locale } = await params;
  const sp = searchParams ? await searchParams : {};
  const queryParams = searchParamsToRecord(sp);
  const categoryId = resolveCategoryId(
    queryParams.category ? Number(queryParams.category) : undefined,
  );

  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  let categoriesError = false;

  try {
    categories = await getCategories();
  } catch {
    categoriesError = true;
  }

  if (categoriesError) {
    const t = await getTranslations("SubjectPicker");
    return (
      <div className="section py-16 text-center text-slate-500">
        {t("loadError")}
      </div>
    );
  }

  return (
    <div className="section flex flex-col gap-5 bg-slate-50 py-6 sm:gap-6 sm:py-8">
      <StatsRefreshListener />
      <CategoryPickerBar
        categories={categories}
        activeCategoryId={categoryId}
        pathname="/subjectpicker"
        searchParams={queryParams}
      />
      <Suspense key={categoryId} fallback={<SubjectPickerSkeleton />}>
        <SubjectPickerContent categoryId={categoryId} locale={locale} />
      </Suspense>
    </div>
  );
}
