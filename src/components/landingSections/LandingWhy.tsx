import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LANDING, LANDING_FEATURES } from "@/CONSTS/landing";
import { LandingIcon } from "./LandingIcons";
import { LandingSectionHeader } from "./LandingSectionHeader";

/** Feature grid: every tile is a real link into the module (internal linking for SEO). */
export default async function LandingWhy() {
  const t = await getTranslations("Home");

  return (
    <section
      id="features"
      className={LANDING.section}
      aria-labelledby="why-title"
    >
      <div className="section">
        <LandingSectionHeader
          id="why-title"
          eyebrow={t("whySectionLabel")}
          title={t("whyTitle")}
          subtitle={t("whySubtitle")}
        />

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LANDING_FEATURES.map((f) => (
            <li key={f.key}>
              <Link
                href={f.href}
                className="group flex h-full flex-col rounded-panel border border-line bg-surface p-6 transition hover:-translate-y-0.5 hover:border-accent-muted hover:shadow-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-card bg-accent-soft text-accent transition group-hover:bg-accent group-hover:text-on-accent">
                    <LandingIcon name={f.icon} className="h-6 w-6" />
                  </span>
                  {f.account ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-surface-sunken px-2.5 py-1 text-xs font-medium text-fg-subtle">
                      <LandingIcon name="lock" className="h-3.5 w-3.5" />
                      {t("featAccount")}
                    </span>
                  ) : null}
                </div>
                <h3 className={`mt-5 ${LANDING.headingCard}`}>
                  {t(`${f.key}Title` as "featPlanTitle")}
                </h3>
                <p className={`mt-2 flex-1 ${LANDING.body}`}>
                  {t(`${f.key}Text` as "featPlanText")}
                </p>
                <span
                  className="mt-5 inline-flex h-8 w-8 items-center justify-center rounded-full border border-line text-fg-subtle transition group-hover:border-accent group-hover:bg-accent group-hover:text-on-accent"
                  aria-hidden
                >
                  <LandingIcon name="arrow" className="h-4 w-4" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
