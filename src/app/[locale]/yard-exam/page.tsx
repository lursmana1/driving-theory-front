import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { getYardExamData } from "@/data/yardExam";
import YardExamElementCard, {
  YardExamGeneralSection,
} from "@/components/YardExam/YardExamContent";
import { routing } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";

type YardExamPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: YardExamPageProps) {
  const { locale } = await params;
  if (hasLocale(routing.locales, locale)) {
    setRequestLocale(locale);
  }
  const t = await getTranslations({ locale, namespace: "Meta" });
  return buildMetadata({
    title: t("yardExamTitle"),
    description: t("yardExamDescription"),
    path: "/yard-exam",
    locale,
  });
}

export default async function YardExamPage({ params }: YardExamPageProps) {
  const { locale } = await params;
  if (hasLocale(routing.locales, locale)) {
    setRequestLocale(locale);
  }

  const data = getYardExamData(locale);
  const t = await getTranslations("YardExamPage");

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

        <div className="flex flex-col gap-5">
          {data.elements.map((element) => (
            <YardExamElementCard key={element.id} element={element} />
          ))}
          <YardExamGeneralSection
            title={data.general.title}
            items={data.general.items}
            note={data.note}
            noteLabel={t("noteLabel")}
          />
        </div>
      </section>
    </div>
  );
}
