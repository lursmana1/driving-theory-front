import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { getYardExamData } from "@/data/yardExam";
import YardExamElementCard, {
  YardExamDisqualificationSection,
  YardExamGeneralSection,
} from "@/components/YardExam/YardExamContent";
import { routing } from "@/i18n/routing";
import YardExamVideo from "@/components/YardExam/YardExamVideo";
import { JsonLd } from "@/components/JsonLd";
import { YARD_EXAM_VIDEO } from "@/CONSTS/yardExamVideo";
import { buildMetadata, videoObjectJsonLd } from "@/lib/seo";

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
    <div className="bg-surface-muted">
      <section className="section flex flex-col gap-6 py-6 sm:gap-8 sm:py-8">
        <JsonLd
          data={videoObjectJsonLd({
            locale,
            href: "/yard-exam",
            name: t("videoTitle"),
            description: t("videoCaption"),
            contentUrl: YARD_EXAM_VIDEO.src,
            thumbnailUrl: YARD_EXAM_VIDEO.poster,
            duration: YARD_EXAM_VIDEO.duration,
            uploadDate: YARD_EXAM_VIDEO.uploadDate,
            inLanguage: YARD_EXAM_VIDEO.language,
          })}
        />
        {/* Phone: header → video → cards. Desktop: header + cards on the left, video pinned on the right. */}
        <div className="flex flex-col gap-6 sm:gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-x-10">
          <header className="flex flex-col gap-3 lg:col-start-1 lg:row-start-1">
            <h1 className="font-georgian text-2xl font-bold text-fg sm:text-3xl">
              {t("title")}
            </h1>
            <p className="max-w-2xl text-body leading-7 text-fg-muted">
              {t("subtitle")}
            </p>
          </header>
          <aside className="lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
            <YardExamVideo
              title={t("videoTitle")}
              caption={t("videoCaption")}
              languageNote={t("videoLanguageNote") || undefined}
            />
          </aside>

          <div className="flex flex-col gap-5 lg:col-start-1 lg:row-start-2">
            <YardExamDisqualificationSection data={data.disqualification} />
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
        </div>
      </section>
    </div>
  );
}
