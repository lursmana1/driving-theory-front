import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { LANDING, LANDING_PIN_STRIPE_STYLE } from "@/CONSTS/landing";

export default async function LandingHero() {
  const t = await getTranslations("Home");

  const bullets = [t("heroBullet1"), t("heroBullet2"), t("heroBullet3")];
  const heroStats = [
    { val: t("heroStat1Val"), label: t("heroStat1Label") },
    { val: t("heroStat2Val"), label: t("heroStat2Label") },
    { val: t("heroStat3Val"), label: t("heroStat3Label") },
  ];

  return (
    <section className={LANDING.heroBg} aria-labelledby="hero-title">
      <div
        className="pointer-events-none absolute inset-0"
        style={LANDING_PIN_STRIPE_STYLE}
        aria-hidden
      />
      <div className="pointer-events-none absolute -left-32 top-24 h-72 w-72 rounded-full bg-sky-500/20 blur-[100px]" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-violet-600/15 blur-[110px]" />

      <div className="section relative">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-sky-100/90 backdrop-blur-sm">
            {t("heroBadge")}
          </p>

          <h1 id="hero-title" className={`mt-8 ${LANDING.headingHero}`}>
            <span className="text-white">{t("heroTitlePrefix")}</span>
            <span className="bg-linear-to-r from-sky-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              {t("heroTitleHighlight")}
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-slate-300 md:text-lg">
            {t("heroDescription")}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/exam" className={LANDING.heroPrimaryCta}>
              {t("heroCta1")}
            </Link>
            <Link href="/subjectpicker" className={LANDING.heroSecondaryCta}>
              {t("heroCta2")}
            </Link>
          </div>

          <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-300">
            {bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="mx-auto mt-14 grid max-w-3xl gap-4 sm:grid-cols-3">
          {heroStats.map((s) => (
            <div key={s.label} className={LANDING.statTile}>
              <p className="text-2xl font-bold text-white md:text-3xl">{s.val}</p>
              <p className="mt-1 text-xs text-slate-400 md:text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
