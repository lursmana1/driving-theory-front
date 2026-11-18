import { getLocale, getTranslations } from "next-intl/server";
import LandingFaq from "./LandingFaq";
import { LandingSectionHeader } from "./LandingSectionHeader";
import { LANDING, LANDING_FAQ } from "@/CONSTS/landing";
import { DEFAULT_CATEGORY_ID, getExamRules } from "@/CONSTS/categories";
import { JsonLd } from "@/components/JsonLd";
import { faqJsonLd } from "@/lib/seo";

export default async function LandingFaqSection() {
  const [t, locale] = await Promise.all([
    getTranslations("Home"),
    getLocale(),
  ]);

  const rulesB = getExamRules(DEFAULT_CATEGORY_ID);
  const values = {
    total: rulesB.totalQuestions,
    pass: rulesB.passScore,
    mistakes: rulesB.maxMistakes,
  };

  const items = LANDING_FAQ.map((key) => ({
    key,
    label: t(`${key}Q` as const),
    children: t(`${key}A` as const, values),
  }));

  return (
    <section
      id="faq"
      className={LANDING.section}
      aria-labelledby="faq-title"
    >
      <JsonLd
        data={faqJsonLd(
          locale,
          items.map((item) => ({
            question: item.label,
            answer: item.children,
          })),
        )}
      />
      <div className="section">
        <LandingSectionHeader
          id="faq-title"
          eyebrow={t("faqEyebrow")}
          title={t("faqSectionTitle")}
        />
        <div className="mt-12 max-w-3xl">
          <LandingFaq items={items} />
        </div>
      </div>
    </section>
  );
}
