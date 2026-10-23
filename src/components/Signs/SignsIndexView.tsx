import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { DEFAULT_CATEGORY_ID } from "@/CONSTS/categories";
import { DEFAULT_SIGN_GROUP_ID, signGroupHref } from "@/CONSTS/signGroups";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/seo";
import { getSignGroups, getSigns } from "@/lib/signs";
import type { Sign } from "@/lib/types/signs";
import { JsonLd } from "@/components/JsonLd";
import SignsExplorer from "./SignsExplorer";

/** The sign "wall" in the `/signs` hero (category pages show six of their own signs) */
const HERO_SLUGS = ["2-4", "3-24", "1-23", "2-1", "4-1-1", "3-27"];
const HERO_TILT = [
  "-rotate-6 translate-y-4",
  "rotate-3 -translate-y-2",
  "-rotate-2 translate-y-6",
  "rotate-6 translate-y-1",
  "-rotate-3 -translate-y-3",
  "rotate-2 translate-y-5",
];

type SignsIndexViewProps = {
  locale: string;
  groupId: number;
};

const signHref = (s: Sign) => `${signGroupHref(s.group)}#${s.slug}`;

/** `/signs` (warning signs) and `/signs/category/<group>` share this page: one group, every explanation folded in. */
export default async function SignsIndexView({ locale, groupId }: SignsIndexViewProps) {
  const t = await getTranslations("SignsPage");
  const tMeta = await getTranslations("Meta");
  const tHeader = await getTranslations("Header");
  const groups = getSignGroups();
  const signs = getSigns(locale);
  const group = groups.find((g) => g.id === groupId)!;
  const isHome = groupId === DEFAULT_SIGN_GROUP_ID;
  const groupSigns = signs.filter((s) => s.group === groupId);
  const signCount = signs.filter((s) => s.kind === "sign").length;
  const path = signGroupHref(groupId);
  const groupName = t(`groups.${groupId}`);
  const labelOf = (s: Sign) =>
    s.kind === "marking" ? t("markingLabel", { number: s.number }) : `${s.number} ${s.name}`;

  const heroSigns = isHome
    ? HERO_SLUGS.map((slug) => signs.find((s) => s.slug === slug)).filter((s): s is Sign => !!s)
    : groupSigns.filter((s) => !s.wide).slice(0, 6);

  return (
    <div className="bg-canvas">
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: tHeader("navHome"), href: "/" },
          { name: t("title"), href: "/signs" },
          ...(isHome ? [] : [{ name: groupName, href: path }]),
        ])}
      />
      <JsonLd
        data={collectionPageJsonLd({
          locale,
          title: isHome ? t("title") : groupName,
          description: isHome
            ? tMeta("signsDescription")
            : tMeta("signsGroupDescription", {
                group: groupName,
                count: group.count,
                about: t(`groupsAbout.${groupId}`),
              }),
          path,
          items: groupSigns.map((s) => ({ name: labelOf(s), href: signHref(s), image: s.image })),
        })}
      />

      <section className="relative overflow-hidden bg-stage text-stage-fg">
        <div className="section grid items-center gap-10 py-10 sm:py-14 lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            {isHome ? (
              <p className="text-2xs font-semibold uppercase tracking-eyebrow text-stage-highlight">
                {t("eyebrow")}
              </p>
            ) : (
              <Link
                href="/signs"
                className="w-fit text-2xs font-semibold uppercase tracking-eyebrow text-stage-highlight hover:text-stage-fg"
              >
                {t("eyebrow")}
              </Link>
            )}
            <h1 className="text-display-sm font-bold tracking-display sm:text-display">
              {isHome ? t("title") : groupName}
            </h1>
            <p className="max-w-xl text-body text-stage-fg/80">
              {isHome ? t("subtitle") : `${t(`groupsAbout.${groupId}`)} ${t("subtitle")}`}
            </p>
            <ul className="flex flex-wrap gap-2 pt-1">
              {(isHome
                ? [
                    t("statSigns", { count: signCount }),
                    t("statMarkings", { count: signs.length - signCount }),
                    t("statGroups", { count: groups.length - 1 }),
                  ]
                : [
                    group.kind === "marking"
                      ? t("statMarkings", { count: group.count })
                      : t("statSigns", { count: group.count }),
                  ]
              ).map((label) => (
                <li
                  key={label}
                  className="rounded-full border border-stage-line bg-stage-raised px-3 py-1 text-sm font-medium"
                >
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <ul className="grid grid-cols-6 gap-2 sm:gap-3 lg:grid-cols-3 lg:gap-6" aria-hidden>
            {heroSigns.map((sign, i) => (
              <li key={sign.slug} className={HERO_TILT[i]}>
                <Link
                  href={signHref(sign)}
                  tabIndex={-1}
                  className="flex aspect-square items-center justify-center rounded-control bg-surface p-1.5 shadow-overlay transition duration-300 hover:rotate-0 hover:scale-105 sm:p-2 lg:rounded-card lg:p-4"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- static SVG sign */}
                  <img
                    src={sign.image}
                    alt=""
                    width={160}
                    height={160}
                    className="h-full w-full object-contain"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* road centre line */}
        <div className="flex gap-6 overflow-hidden pb-4" aria-hidden>
          {Array.from({ length: 40 }, (_, i) => (
            <span key={i} className="h-1.5 w-12 shrink-0 rounded-full bg-stage-highlight/70" />
          ))}
        </div>
      </section>

      <SignsExplorer
        groups={groups}
        activeGroup={groupId}
        items={groupSigns}
      />

      <section className="section pb-12">
        <div className="rounded-panel border border-accent-muted bg-accent-soft p-5 sm:p-6">
          <h2 className="text-lg font-bold text-fg">{t("practiceTitle")}</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-fg-muted">{t("practiceText")}</p>
          <Link
            href={`/tickets/${DEFAULT_CATEGORY_ID}`}
            className="mt-4 inline-flex rounded-control bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent transition hover:bg-accent-strong"
          >
            {t("practiceCta")} →
          </Link>
        </div>
      </section>
    </div>
  );
}
