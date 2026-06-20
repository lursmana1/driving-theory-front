import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { LANDING } from "@/CONSTS/landing";

export default async function LandingCta() {
  const t = await getTranslations("Home");

  return (
    <section className={LANDING.ctaSection} aria-labelledby="cta-title">
      <div className={LANDING.ctaGlow} aria-hidden />
      <div className="section relative text-center">
        <h2 id="cta-title" className={LANDING.headingSectionDark}>
          {t("ctaTitle")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-slate-300">
          {t("ctaText")}
        </p>
        <Link
          href="/exam"
          className={`mt-10 h-14 px-10 ${LANDING.gradientCta}`}
        >
          {t("ctaBtn")} →
        </Link>
      </div>
    </section>
  );
}
