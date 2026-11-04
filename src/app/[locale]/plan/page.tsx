import { resolveCategoryId } from "@/CONSTS/categories";
import StudyPlanPageClient from "@/components/StudyPlan/StudyPlanPageClient";
import { pageMeta } from "@/lib/pageMeta";

type PlanPageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ category?: string }>;
};

export async function generateMetadata({ params }: PlanPageProps) {
  const { locale } = await params;
  return pageMeta("plan", { locale });
}

export default async function PlanPage({ searchParams }: PlanPageProps) {
  const sp = searchParams ? await searchParams : undefined;
  const categoryId = resolveCategoryId(
    sp?.category ? Number(sp.category) : undefined,
  );
  return <StudyPlanPageClient initialCategoryId={categoryId} />;
}
