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
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/subjectpicker"
              className={`h-13 ${LANDING.gradientCta}`}
            >
              {t("ctaBtn")}
              <span aria-hidden className="text-xl leading-none">
                →
              </span>
            </Link>
            <Link
              href="/auth?mode=register"
              className="inline-flex h-13 items-center justify-center rounded-xl bg-ink px-7 text-base font-semibold text-paper transition hover:bg-ink/90"
            >
              {t("ctaRegister")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
