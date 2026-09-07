import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { LANDING } from "@/CONSTS/landing";

export default async function LandingCta() {
  const t = await getTranslations("Home");

  return (
    <section className={LANDING.ctaSection} aria-labelledby="cta-title">
      <div className="section">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <h2 id="cta-title" className={LANDING.headingSection}>
              {t("ctaTitle")}
            </h2>
            <p className={`mt-4 ${LANDING.body}`}>{t("ctaText")}</p>
          </div>
          <Link href="/subjectpicker" className={`h-13 shrink-0 ${LANDING.gradientCta}`}>
            {t("ctaBtn")}
            <span aria-hidden className="text-xl leading-none">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
