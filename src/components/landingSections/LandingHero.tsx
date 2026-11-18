import { Link } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { LANDING } from "@/CONSTS/landing";
import { DEFAULT_CATEGORY_ID, getExamRules } from "@/CONSTS/categories";
import { getLandingDemoQuestion } from "@/api/landingDemo";
import { LandingHeroRoad } from "./LandingHeroRoad";
import LandingDemoTicket from "./LandingDemoTicket";
import { LandingIcon } from "./LandingIcons";
import { DEMO_LABEL_KEYS } from "./landingLabels";

const TRUST_KEYS = ["heroTrust1", "heroTrust2", "heroTrust3"] as const;

export default async function LandingHero() {
  const locale = await getLocale();
  const [t, demo] = await Promise.all([
    getTranslations("Home"),
    getLandingDemoQuestion(locale),
  ]);
  const rulesB = getExamRules(DEFAULT_CATEGORY_ID);

  return (
    <section className={LANDING.heroBg} aria-labelledby="hero-title">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-accent-soft via-canvas to-canvas"
      />
      <div className="section">
        <div className="grid items-start gap-12 py-12 md:py-16 lg:grid-cols-2 lg:gap-16 lg:py-20">
          <div className="flex min-w-0 flex-col lg:pt-10">
            <p className="inline-flex w-fit items-center gap-2 rounded-full border border-accent-muted bg-surface px-3 py-1 text-xs font-semibold text-accent shadow-card">
              <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
              {t("heroRulesBadge", {
                pass: rulesB.passScore,
                total: rulesB.totalQuestions,
              })}
            </p>

            <h1 id="hero-title" className={`mt-6 ${LANDING.headingHero}`}>
              {t("heroTitleLine1")}
            </h1>
            <p className="mt-4 max-w-xl text-balance text-xl font-semibold leading-snug text-fg-muted sm:text-2xl">
              {t("heroLead")}
            </p>
            <p className={`mt-5 max-w-lg ${LANDING.body}`}>
              {t("heroDescription")}
            </p>

            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <Link href="/plan" className={LANDING.heroPrimaryCta}>
                {t("heroCta1")}
                <LandingIcon name="arrow" className="h-5 w-5" />
              </Link>
              <Link href="/subjectpicker" className={LANDING.heroSecondaryCta}>
                {t("heroCta2")}
              </Link>
            </div>
            <Link
              href={`/tickets/${DEFAULT_CATEGORY_ID}`}
              className={`mt-2 ${LANDING.textLink}`}
            >
              {t("heroTicketsLink")}
              <LandingIcon name="arrow" className="h-4 w-4" />
            </Link>

            <ul className="mt-8 grid gap-2.5 border-t border-line pt-6 text-sm text-fg-muted sm:grid-cols-3 sm:gap-4">
              {TRUST_KEYS.map((key) => (
                <li key={key} className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success-soft text-success-strong">
                    <LandingIcon name="check" className="h-3.5 w-3.5" />
                  </span>
                  {t(key)}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex min-w-0 justify-center lg:justify-end">
            {demo ? (
              <LandingDemoTicket
                question={demo}
                labels={Object.fromEntries(
                  DEMO_LABEL_KEYS.map((k) => [k, t.raw(k) as string]),
                )}
              />
            ) : (
              <LandingHeroRoad />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
