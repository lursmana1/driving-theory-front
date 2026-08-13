import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { getServerBaseApi } from "@/api/ServerBaseApi";
import { getCategoryById, licenseCategories } from "@/CONSTS/categories";
import { TICKETS_PAGE_SIZE } from "@/CONSTS/pagination";
import Pagination from "@/components/Pagination/Pagination";
import CategoryCardsGrid from "@/components/categoryComponents/CategoryCardsGrid/CategoryCardsGrid";
import TicketsQuizList from "@/components/TicketsQuiz/TicketsQuizList";
import QuestionIdSearch from "@/components/QuestionIdSearch/QuestionIdSearch";
import type { ExamQuestion, QuestionsResponse } from "@/lib/types/exam";
import SubjectAsideMenu from "@/components/SubjectAsideMenu/SubjectAsideMenu";
import { pageMeta } from "@/lib/pageMeta";

type PageProps = {
  params: Promise<{ locale: string; category: string }>;
  searchParams?: Promise<{
    page?: string;
    size?: string;
    subjects?: string;
    questionId?: string;
  }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { locale, category } = await params;
  const cat = getCategoryById(Number(category));
  return pageMeta("tickets", {
    locale,
    titleSuffix: cat?.name,
  });
}

export default async function TicketsCategoryPage({
  params,
  searchParams,
}: PageProps) {
  const { locale, category } = await params;
  const sp = searchParams ? await searchParams : {};

  const categoryId = Number(category);
  const page = Number(sp.page ?? "1");
  const size = TICKETS_PAGE_SIZE;
  const subjects = sp.subjects ?? "";
  const questionId = sp.questionId?.trim() ?? "";

  const t = await getTranslations("Tickets");

  let questions: ExamQuestion[] = [];
  let pagination = { page: 1, total: 0 };
  let questionsUnavailable = false;

  try {
    const api = await getServerBaseApi();

    if (questionId) {
      const res = await api.get<ExamQuestion | null>(`/questions/${questionId}`, {
        params: { lang: locale },
      });
      const question = res.data;
      questions = question ? [question] : [];
      pagination = { page: 1, total: questions.length };
    } else {
      const res = await api.get<QuestionsResponse>("/questions", {
        params: {
          category: categoryId,
          subjects,
          page,
          size,
          lang: locale,
        },
      });
      const questionsRes = res.data;
      const rawItems = questionsRes?.items ?? questionsRes;
      questions = Array.isArray(rawItems)
        ? rawItems
        : rawItems
          ? [rawItems]
          : [];
      pagination = {
        page: questionsRes?.page ?? page,
        total: questionsRes?.total ?? questions.length,
      };
    }
  } catch {
    questionsUnavailable = true;
  }

  return (
    <div className="section space-y-6 py-8">
      <CategoryCardsGrid
        categories={licenseCategories}
        activeCategoryId={categoryId}
      />

      {questionsUnavailable && (
        <p className="text-center text-slate-500">{t("loadError")}</p>
      )}

      {!questionsUnavailable && questionId && questions.length === 0 && (
        <p className="text-center text-slate-500">
          {t("questionNotFound", { id: questionId })}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
        <SubjectAsideMenu category={category} sp={sp} />

        <main className="space-y-6 order-1 lg:order-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Suspense
              fallback={
                <div className="h-10 w-48 bg-gray-200 rounded animate-pulse" />
              }
            >
              <QuestionIdSearch category={category} currentParams={sp} />
            </Suspense>
            <Suspense fallback={null}>
              <Pagination
                page={pagination.page}
                total={pagination.total}
                pathname={`/tickets/${category}`}
                pageSize={TICKETS_PAGE_SIZE}
              />
            </Suspense>
          </div>

          <TicketsQuizList questions={questions} />

          <div className="flex flex-wrap justify-end gap-4">
            <Suspense fallback={null}>
              <Pagination
                page={pagination.page}
                total={pagination.total}
                pathname={`/tickets/${category}`}
                pageSize={TICKETS_PAGE_SIZE}
              />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
