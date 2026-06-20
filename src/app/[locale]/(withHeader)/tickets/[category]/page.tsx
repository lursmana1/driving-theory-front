import BaseApi from "@/api/BaseApi";
import { TICKETS_PAGE_SIZE } from "@/CONSTS/pagination";
import Pagination from "@/components/Pagination/Pagination";
import CategoryCardsGrid from "@/components/categoryComponents/CategoryCardsGrid/CategoryCardsGrid";
import TicketsQuizList from "@/components/TicketsQuiz/TicketsQuizList";
import QuestionIdSearch from "@/components/QuestionIdSearch/QuestionIdSearch";
import { Category } from "@/lib/types/category";
import { type QuestionsResponse } from "@/lib/types/exam";
import SubjectAsideMenu from "@/components/SubjectAsideMenu/SubjectAsideMenu";
import { Suspense } from "react";

type PageProps = {
  params: Promise<{ locale: string; category: string }>;
  searchParams?: Promise<{
    page?: string;
    size?: string;
    subjects?: string;
    questionId?: string;
  }>;
};

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
  const questionId = sp.questionId ?? "";

  let categories: Category[] = [];
  let questionsRes: QuestionsResponse = {
    items: [],
    page: 1,
    size,
    total: 0,
    totalPages: 0,
  };
  let backendUnavailable = false;

  try {
    [categories, questionsRes] = await Promise.all([
      BaseApi.get("/categories").then((r) => r.data),
      BaseApi.get(`/questions/${questionId ? questionId : ""}`, {
        params: {
          category: categoryId,
          subjects,
          page,
          size,
          lang: locale,
        },
      }).then((r) => r.data),
    ]);
  } catch {
    backendUnavailable = true;
  }
  console.log(questionsRes, "questionsRes");

  const rawItems = questionsRes?.items ?? questionsRes;
  const questions = Array.isArray(rawItems)
    ? rawItems
    : rawItems
      ? [rawItems]
      : [];

  const pagination = {
    page: questionsRes?.page ?? 1,
    total: questionsRes?.total ?? questions.length,
  };

  return (
    <div className="section space-y-6 py-8">
      {backendUnavailable && (
        <p className="text-center text-slate-500">
          Service unavailable. Please try again later.
        </p>
      )}
      {/* Top categories - 2 cols mobile, 1 col desktop */}
      {!backendUnavailable && (
        <CategoryCardsGrid
          categories={categories}
          activeCategoryId={categoryId}
        />
      )}

      {/* 2-column layout: content first on mobile, sidebar left on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
        {/* LEFT - sidebar on desktop, below content on mobile */}
        <SubjectAsideMenu category={category} sp={sp} />

        {/* RIGHT - main content */}
        <main className="space-y-6 order-1 lg:order-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Suspense
              fallback={
                <div className="h-10 w-48 bg-gray-200 rounded animate-pulse" />
              }
            >
              <QuestionIdSearch category={category} currentParams={sp} />
            </Suspense>
            <Pagination
              page={pagination.page}
              total={pagination.total}
              pathname={`/tickets/${category}`}
              pageSize={TICKETS_PAGE_SIZE}
            />
          </div>

          <TicketsQuizList questions={questions} />

          <div className="flex flex-wrap justify-end gap-4">
            <Pagination
              page={pagination.page}
              total={pagination.total}
              pathname={`/tickets/${category}`}
              pageSize={TICKETS_PAGE_SIZE}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
