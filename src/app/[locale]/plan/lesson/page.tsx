import PlanLessonPreviewClient from "@/components/StudyPlan/PlanLessonPreviewClient";
import { DEFAULT_CATEGORY_ID } from "@/CONSTS/categories";
import { pageMeta } from "@/lib/pageMeta";

type PlanLessonPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PlanLessonPageProps) {
  const { locale } = await params;
  return pageMeta("plan", { locale, index: false });
}

/** Prototype: a card lesson (card → its tickets) for the sign subjects. */
export default function PlanLessonPage() {
  return <PlanLessonPreviewClient categoryId={DEFAULT_CATEGORY_ID} />;
}
