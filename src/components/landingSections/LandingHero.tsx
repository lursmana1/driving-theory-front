import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { LANDING } from "@/CONSTS/landing";
import { DEFAULT_CATEGORY_ID } from "@/CONSTS/categories";
import { LandingHeroRoad } from "./LandingHeroRoad";

const STEP_KEYS = ["stepShort1", "stepShort2", "stepShort3"] as const;

export default async function LandingHero() {
  const t = await getTranslations("Home");

  return (
    <section className={LANDING.heroBg} aria-labelledby="hero-title">
      <div className="grid lg:min-h-[calc(100svh-8rem)] lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.95fr)]">
        <div className="flex flex-col justify-center px-6 py-12 sm:px-8 lg:border-r lg:border-hairline lg:px-12 lg:py-16 xl:px-16">
          <p className={LANDING.eyebrow}>{t("heroEyebrow")}</p>

          <h1 id="hero-title" className={`mt-6 ${LANDING.headingHero}`}>
            <span className="block">{t("heroTitleLine1")}</span>
            <span className="block">{t("heroTitleLine2")}</span>
          </h1>

          <p className={`mt-7 max-w-md ${LANDING.body}`}>
            {t("heroDescription")}
          </p>

          <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Link
              href={`/tickets/${DEFAULT_CATEGORY_ID}`}
              className={LANDING.heroPrimaryCta}
            >
              {t("heroCta1")}
              <span aria-hidden className="text-xl leading-none">
                →
              </span>
            </Link>
            <Link href="/subjectpicker" className={LANDING.heroSecondaryCta}>
              {t("heroCta2")}
            </Link>
          </div>

          <p className="mt-8 text-xs tracking-wide text-ink/45">
            {t("heroKeywords")}
          </p>
        </div>

        <div className="flex items-center justify-center px-4 pb-6 sm:px-8 lg:px-6 lg:py-10">
          <LandingHeroRoad />
        </div>
      </div>

      <div className="grid border-t border-hairline sm:grid-cols-3">
        {STEP_KEYS.map((key, i) => (
          <div
            key={key}
            className={`flex items-baseline gap-4 px-6 py-4 sm:px-8 ${
              i < STEP_KEYS.length - 1
                ? "border-b border-hairline sm:border-b-0 sm:border-r"
                : ""
            }`}
          >
            <span className="text-xs font-semibold tabular-nums text-accent/70">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-[15px] font-semibold text-ink">
              {t(key)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
