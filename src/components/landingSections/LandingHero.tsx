import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { LANDING, LANDING_PIN_STRIPE_STYLE } from "@/CONSTS/landing";
import { DEFAULT_CATEGORY_ID } from "@/CONSTS/categories";

export default async function LandingHero() {
  const t = await getTranslations("Home");

  const bullets = [t("heroBullet1"), t("heroBullet2"), t("heroBullet3")];

  return (
    <section className={LANDING.heroBg} aria-labelledby="hero-title">
      <div
        className="pointer-events-none absolute inset-0"
        style={LANDING_PIN_STRIPE_STYLE}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[#193e4a]/25 blur-[80px]" />

      <div className="section relative">
        <div className="mx-auto max-w-3xl text-center">
          <h1 id="hero-title" className={LANDING.headingHero}>
            <span className="text-white">{t("heroTitlePrefix")}</span>
            <span className="text-[#7eb8c2]">{t("heroTitleHighlight")}</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-slate-300 md:text-lg">
            {t("heroDescription")}
          </p>

          <div className="mx-auto mt-10 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
            <Link href="/subjectpicker" className={LANDING.heroPrimaryCta}>
              {t("heroCta1")}
            </Link>
            <Link href={`/tickets/${DEFAULT_CATEGORY_ID}`} className={LANDING.heroSecondaryCta}>
              {t("heroCta2")}
            </Link>
          </div>

          <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-300">
            {bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
