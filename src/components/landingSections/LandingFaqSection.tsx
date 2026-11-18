import { getLocale, getTranslations } from "next-intl/server";
import LandingFaq from "./LandingFaq";
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
      className="border-t border-line py-16 md:py-24"
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
        <p className={LANDING.eyebrow}>{t("faqEyebrow")}</p>
        <h2 id="faq-title" className={`mt-4 max-w-2xl ${LANDING.headingSection}`}>
          {t("faqSectionTitle")}
        </h2>
        <div className="mt-12 max-w-3xl">
          <LandingFaq items={items} />
        </div>
      </div>
    </section>
  );
}
