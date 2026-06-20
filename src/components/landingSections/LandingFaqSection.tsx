import { getTranslations } from "next-intl/server";
import LandingFaq from "./LandingFaq";
import landingFaq from "@/data/landingFaq.json";
import { LandingEyebrow } from "./LandingEyebrow";
import { LANDING } from "@/CONSTS/landing";

export default async function LandingFaqSection() {
  const t = await getTranslations("Home");

  const items = landingFaq.map((item, i) => ({
    key: String(i + 1),
    label: t(`${item.key}Q`),
    children: t(`${item.key}A`),
  }));

  return (
    <section
      id="faq"
      className="border-b border-slate-200 bg-slate-50 py-16 md:py-24"
      aria-labelledby="faq-title"
    >
      <div className="section">
        <LandingEyebrow tone="light">{t("faqEyebrow")}</LandingEyebrow>
        <h2
          id="faq-title"
          className={`mx-auto mt-3 max-w-2xl text-center ${LANDING.headingSection}`}
        >
          {t("faqSectionTitle")}
        </h2>
        <div className="mx-auto mt-12 max-w-2xl">
          <LandingFaq items={items} />
        </div>
      </div>
    </section>
  );
}
