import { Suspense } from "react";
import { resolveCategoryId } from "@/CONSTS/categories";
import TrainerPageClient from "@/components/Trainer/TrainerPageClient";
import { pageMeta } from "@/lib/pageMeta";

type PracticePageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{
    category?: string;
    subjects?: string | string[];
  }>;
};

/** Upper bound the API accepts for a subject filter. */
const MAX_SUBJECTS = 50;

function parseSubjects(raw: string | string[] | undefined): number[] {
  const parts = Array.isArray(raw) ? raw : raw ? raw.split(",") : [];
  return parts
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isInteger(n) && n >= 0)
    .slice(0, MAX_SUBJECTS);
}

export async function generateMetadata({ params }: PracticePageProps) {
  const { locale } = await params;
  return pageMeta("practice", { locale });
}

export default async function PracticePage({
  searchParams,
}: PracticePageProps) {
  const sp = searchParams ? await searchParams : undefined;
  const categoryId = resolveCategoryId(
    sp?.category ? Number(sp.category) : undefined,
  );

  return (
    <Suspense>
      <TrainerPageClient
        categoryId={categoryId}
        subjects={parseSubjects(sp?.subjects)}
      />
    </Suspense>
  );
}
