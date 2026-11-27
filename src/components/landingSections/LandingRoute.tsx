import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LANDING } from "@/CONSTS/landing";
import { DEFAULT_CATEGORY_ID } from "@/CONSTS/categories";
import { LandingIcon } from "./LandingIcons";
import { LandingSectionHeader } from "./LandingSectionHeader";

const STAGES = [
  { n: 1, key: "route1", href: `/tickets/${DEFAULT_CATEGORY_ID}` },
  { n: 2, key: "route2", href: "/yard-exam" },
  { n: 3, key: "route3", href: "/city-exam", extra: { key: "route3RoutesLink", href: "/city-exam#routes" } },
] as const;

/** Theory → yard → city: shows the whole route and links the practical modules. */
export default async function LandingRoute() {
  const t = await getTranslations("Home");

  return (
    <section
      id="route"
      className={LANDING.section}
      aria-labelledby="route-title"
    >
      <div className="section">
        <LandingSectionHeader
          id="route-title"
          eyebrow={t("routeEyebrow")}
          title={t("routeTitle")}
          subtitle={t("routeSubtitle")}
        />

        <ol className="relative mt-12 grid gap-4 lg:grid-cols-3 lg:gap-0">
          {STAGES.map((s, i) => (
            <li key={s.key} className="relative flex lg:pr-10 lg:last:pr-0">
              {/* connector to the next stage (desktop) */}
              {i < STAGES.length - 1 ? (
                <div
                  aria-hidden
                  className="absolute left-14 right-0 top-7 hidden items-center lg:flex"
                >
                  <span className="h-0.5 flex-1 bg-line" />
                  {i === 0 ? (
                    <span className="mx-2 rounded-full border border-warning-muted bg-warning-soft px-2.5 py-0.5 text-xs font-semibold text-warning-strong">
                      {t("route30Days")}
                    </span>
                  ) : null}
                  <span className="h-0.5 flex-1 bg-line" />
                </div>
              ) : null}
              {/* connector to the next stage (phones: vertical, under the circle) */}
              {i < STAGES.length - 1 ? (
                <div
                  aria-hidden
                  className="absolute -bottom-4 left-7 top-14 flex -translate-x-1/2 flex-col items-center lg:hidden"
                >
                  <span className="w-0.5 flex-1 bg-line" />
                  {i === 0 ? (
                    <span className="my-1 whitespace-nowrap rounded-full border border-warning-muted bg-warning-soft px-2 py-0.5 text-2xs font-semibold text-warning-strong">
                      {t("route30Days")}
                    </span>
                  ) : null}
                  <span className="w-0.5 flex-1 bg-line" />
                </div>
              ) : null}

              <div className="relative flex w-full gap-4 lg:flex-col">
                <span
                  className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 border-canvas text-lg font-extrabold tabular-nums ${
                    i === 0 ? "bg-accent text-on-accent" : "bg-inverse text-fg-inverse"
                  }`}
                >
                  {s.n}
                </span>
                <div className={`flex min-w-0 flex-1 flex-col p-5 ${LANDING.card}`}>
                  <p className={LANDING.label}>
                    {t("routeStep", { n: s.n })}
                  </p>
                  <h3 className={`mt-2 ${LANDING.headingCard}`}>
                    {t(`${s.key}Title` as const)}
                  </h3>
                  <p className={`mt-2 ${LANDING.body}`}>{t(`${s.key}Text` as const)}</p>
                  {/* pinned to the bottom so every card's links line up */}
                  <div className="mt-auto flex flex-wrap gap-x-5 gap-y-1 pt-3">
                    <Link href={s.href} className={LANDING.textLink}>
                      {t(`${s.key}Link` as const)}
                      <LandingIcon name="arrow" className="h-4 w-4" />
                    </Link>
                    {"extra" in s ? (
                      <Link href={s.extra.href} className={LANDING.textLink}>
                        {t(s.extra.key)}
                        <LandingIcon name="arrow" className="h-4 w-4" />
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
