import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { CITY_EXAM_CATEGORIES, resolveCityExamCategory } from "@/CONSTS/cityExam";
import CityExamCategorySwitcher from "@/components/CityExam/CityExamCategorySwitcher";
import CityExamQuestionList from "@/components/CityExam/CityExamQuestionList";
import { getCityExamData } from "@/data/cityExam";
import type { CityExamCategoryKey } from "@/lib/types/cityExam";
import { routing } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import type { SearchParamsRecord } from "@/lib/searchParams";
import { searchParamsToRecord } from "@/lib/searchParams";

type CityExamPageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<SearchParamsRecord>;
};

export async function generateMetadata({ params, searchParams }: CityExamPageProps) {
  const { locale } = await params;
  if (hasLocale(routing.locales, locale)) {
    setRequestLocale(locale);
  }

  const sp = searchParams ? await searchParams : {};
  const query = searchParamsToRecord(sp);
  const cat = resolveCityExamCategory(query.cat);
  const t = await getTranslations({ locale, namespace: "Meta" });
  const titleKey =
    cat === "b"
      ? "cityExamTitle"
      : cat === "be"
        ? "cityExamTitleBe"
        : cat === "cd"
          ? "cityExamTitleCd"
          : "cityExamTitleCede";

  return buildMetadata({
    title: t(titleKey),
    description: t("cityExamDescription"),
    path: cat === "b" ? "/city-exam" : `/city-exam?cat=${cat}`,
    locale,
  });
}

export default async function CityExamPage({
  params,
  searchParams,
}: CityExamPageProps) {
  const { locale } = await params;
  const sp = searchParams ? await searchParams : {};
  const query = searchParamsToRecord(sp);
  const activeKey = resolveCityExamCategory(query.cat);
  const data = getCityExamData(locale);
  const t = await getTranslations("CityExamPage");

  const activeCategory =
    CITY_EXAM_CATEGORIES.find((c) => c.key === activeKey) ??
    CITY_EXAM_CATEGORIES[0];
  const section = data[activeCategory.dataKey];
  const questions = Object.entries(section.questions)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([id, item]) => ({ id, item }));

  const labels = Object.fromEntries(
    CITY_EXAM_CATEGORIES.map((c) => [c.key, t(c.labelKey)]),
  ) as Record<CityExamCategoryKey, string>;

  return (
    <div className="bg-slate-50">
      <section className="section flex flex-col gap-6 py-6 sm:gap-8 sm:py-8">
        <header className="flex flex-col gap-3">
          <h1 className="font-georgian text-2xl font-bold text-slate-900 sm:text-3xl">
            {t("title")}
          </h1>
          <p className="max-w-2xl text-[15px] leading-7 text-slate-600">
            {t("subtitle")}
          </p>
        </header>

        <CityExamCategorySwitcher activeKey={activeKey} labels={labels} />

        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-5 sm:px-6 sm:py-6">
          <h2 className="font-georgian text-lg font-bold text-slate-900 sm:text-xl">
            {section.title}
          </h2>

          {section.rules ? (
            <div className="mt-4 space-y-2 rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
              <p>
                <span className="font-semibold text-slate-800">
                  {t("rulesFormat")}:{" "}
                </span>
                {section.rules.format}
              </p>
              <p>
                <span className="font-semibold text-slate-800">
                  {t("rulesPenalty")}:{" "}
                </span>
                {section.rules.penalty}
              </p>
            </div>
          ) : null}

          <p className="mt-5 text-sm text-slate-500">
            {t("questionCount", { count: questions.length })}
          </p>

          <div className="mt-2">
            <CityExamQuestionList
              questions={questions}
              verbalLabel={t("typeVerbal")}
              practicalLabel={t("typePractical")}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
