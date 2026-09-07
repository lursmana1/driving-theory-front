import { getTranslations } from "next-intl/server";
import LandingFaq from "./LandingFaq";
import landingFaq from "@/data/landingFaq.json";
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
      className="border-t border-hairline py-16 md:py-24"
      aria-labelledby="faq-title"
    >
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
