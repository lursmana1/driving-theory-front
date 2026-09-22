import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { getServerBaseApi } from "@/api/ServerBaseApi";
import { getCategoryById, licenseCategories } from "@/CONSTS/categories";
import { getSubjectName, isKnownSubjectId } from "@/CONSTS/subjects";
import { TICKETS_PAGE_SIZE } from "@/CONSTS/pagination";
import Pagination from "@/components/Pagination/Pagination";
import CategoryCardsGrid from "@/components/categoryComponents/CategoryCardsGrid/CategoryCardsGrid";
import TicketsQuizList from "@/components/TicketsQuiz/TicketsQuizList";
import QuestionIdSearch from "@/components/QuestionIdSearch/QuestionIdSearch";
import type { ExamQuestion, QuestionsResponse } from "@/lib/types/exam";
import SubjectAsideMenu from "@/components/SubjectAsideMenu/SubjectAsideMenu";
import { JsonLd } from "@/components/JsonLd";
import { pageMeta } from "@/lib/pageMeta";
import { ticketsJsonLd } from "@/lib/seo";
import GuestAuthBanner from "@/components/GuestAuth/GuestAuthBanner";

type PageProps = {
  params: Promise<{ locale: string; category: string }>;
  searchParams?: Promise<{
    page?: string;
    size?: string;
    subjects?: string;
    questionId?: string;
  }>;
};

function ticketsListingState(
  category: string,
  sp: { page?: string; subjects?: string; questionId?: string },
  locale: string,
) {
  const rawPage = Number(sp.page ?? "1");
  const page =
    Number.isFinite(rawPage) && rawPage > 1 ? Math.floor(rawPage) : 1;
  const questionId = sp.questionId?.trim() ?? "";
  const subjectsRaw = (sp.subjects ?? "").trim();
  const subjectId = /^\d+$/.test(subjectsRaw) ? Number(subjectsRaw) : null;
  const knownSubject = subjectId != null && isKnownSubjectId(subjectId);
  const isListing = !questionId && (subjectsRaw === "" || knownSubject);

  const params = new URLSearchParams();
  if (isListing && knownSubject && subjectId != null) {
    params.set("subjects", String(subjectId));
  }
  if (isListing && page > 1) params.set("page", String(page));
  const query = params.toString();

  return {
    index: isListing,
    path: query ? `/tickets/${category}?${query}` : `/tickets/${category}`,
    page,
    subjectName:
      knownSubject && subjectId != null
        ? getSubjectName(subjectId, locale)
        : undefined,
  };
}

export async function generateMetadata({ params, searchParams }: PageProps) {
  const { locale, category } = await params;
  const sp = searchParams ? await searchParams : {};
  const cat = getCategoryById(Number(category));
  const categoryLabel = cat?.name ?? category;
  const listing = ticketsListingState(category, sp, locale);
  return pageMeta("tickets", {
    locale,
    path: listing.path,
    category: categoryLabel,
    subject: listing.subjectName,
    page: listing.page,
    index: listing.index,
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
  const tMeta = await getTranslations("Meta");
  const categoryLabel =
    getCategoryById(categoryId)?.name ?? String(categoryId);
  const listing = ticketsListingState(category, sp, locale);

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

  const listingHeading = listing.subjectName
    ? tMeta("ticketsTitleCategorySubject", {
        category: categoryLabel,
        subject: listing.subjectName,
      })
    : tMeta("ticketsTitleCategory", { category: categoryLabel });
  const listingTitle =
    listing.page > 1
      ? tMeta("ticketsTitlePage", {
          title: listingHeading,
          page: listing.page,
        })
      : listingHeading;
  const listingIntro = listing.subjectName
    ? tMeta("ticketsDescriptionCategorySubject", {
        category: categoryLabel,
        subject: listing.subjectName,
      })
    : tMeta("ticketsDescriptionCategory", { category: categoryLabel });

  return (
    <div className="section space-y-6 py-8">
      <GuestAuthBanner />
      <JsonLd
        data={ticketsJsonLd({
          locale,
          categoryLabel: listing.subjectName
            ? `${categoryLabel} — ${listing.subjectName}`
            : categoryLabel,
          path: listing.path,
          description: listingIntro,
        })}
      />
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
          {listing.index ? (
            <h1 className="text-center text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              {listingTitle}
            </h1>
          ) : null}

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
              params={{ subjects: sp.subjects, size: sp.size }}
            />
          </div>

          {!questionsUnavailable && questions.length > 0 && (
            <p className="text-sm text-slate-500">{t("audioHint")}</p>
          )}

          <TicketsQuizList questions={questions} />

          <div className="flex flex-wrap justify-end gap-4">
            <Pagination
              page={pagination.page}
              total={pagination.total}
              pathname={`/tickets/${category}`}
              pageSize={TICKETS_PAGE_SIZE}
              params={{ subjects: sp.subjects, size: sp.size }}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
