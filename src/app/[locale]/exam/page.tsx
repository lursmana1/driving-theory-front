import { resolveCategoryId } from "@/CONSTS/categories";
import ExamPageClient from "@/components/ExamQuiz/ExamPageClient";
import { pageMeta } from "@/lib/pageMeta";

type ExamPageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{
    subjects?: string | string[];
    category?: string;
  }>;
};

export async function generateMetadata({ params }: ExamPageProps) {
  const { locale } = await params;
  return pageMeta("exam", { locale });
}

export default async function ExamPage({
  params,
  searchParams,
}: ExamPageProps) {
  const { locale } = await params;
  const sp = searchParams ? await searchParams : undefined;

  const subjectsRaw = sp?.subjects;
  const categoryRaw = sp?.category;

  let subjects: string[] = [];
  if (Array.isArray(subjectsRaw)) {
    subjects = subjectsRaw;
  } else if (typeof subjectsRaw === "string" && subjectsRaw.length > 0) {
    subjects = subjectsRaw.split(",");
  }

  const categoryId = resolveCategoryId(
    categoryRaw ? Number(categoryRaw) : undefined,
  );

  return (
    <ExamPageClient
      locale={locale}
      categoryId={categoryId}
      subjects={subjects.join(",")}
    />
  );
}
