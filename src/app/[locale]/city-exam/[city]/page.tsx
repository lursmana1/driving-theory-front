import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, buildMetadata, collectionPageJsonLd } from "@/lib/seo";
import {
  CITY_ROUTES_SOURCE_URL,
  EXAM_CITIES,
  cityRouteHref,
  examCityGenitive,
  examCityName,
} from "@/CONSTS/cityRoutes";
import { formatRouteDate, getOfficialRoutes } from "@/data/cityRoutes/official";
import { cityRouteGroups, routeGroupKeys, routeUpdates, routesByCategory } from "@/lib/cityRoutes";
import CityRoutesViewer from "@/components/CityRoutes/CityRoutesViewer";
import CityRoutesInfo from "@/components/CityRoutes/CityRoutesInfo";
import type { ViewerLabels, ViewerRoute } from "@/components/CityRoutes/types";

type Props = { params: Promise<{ locale: string; city: string }> };

export function generateStaticParams() {
  return EXAM_CITIES.map(({ slug }) => ({ city: slug }));
}

/** City name forms for the copy: plain name, and the Georgian genitive („რუსთავის“) for titles. */
function cityNames(city: string, locale: string) {
  const name = examCityName(city, locale);
  return name ? { city: name, cityGen: examCityGenitive(city, locale) ?? name } : null;
}

export async function generateMetadata({ params }: Props) {
  const { locale, city } = await params;
  if (hasLocale(routing.locales, locale)) setRequestLocale(locale);
  const names = cityNames(city, locale);
  const routes = getOfficialRoutes(city);
  if (!names || !routes) return {};
  const t = await getTranslations({ locale, namespace: "CityRoutes" });
  return buildMetadata({
    title: t("metaTitle", names),
    description: t("metaDescription", { ...names, count: routes.length }),
    path: cityRouteHref(city),
    locale,
  });
}

const LABEL_KEYS = [
  "pickCity",
  "pickCategory",
  "pickRoute",
  "loading",
  "prev",
  "next",
  "enlarge",
  "close",
  "realSize",
  "fitScreen",
  "legendRoute",
  "legendDirection",
  "legendStart",
] as const;

export default async function CityRoutesPage({ params }: Props) {
  const { locale, city } = await params;
  if (hasLocale(routing.locales, locale)) setRequestLocale(locale);
  const names = cityNames(city, locale);
  const routes = getOfficialRoutes(city);
  if (!names || !routes) notFound();

  const [t, tHeader] = await Promise.all([getTranslations("CityRoutes"), getTranslations("Header")]);
  const path = cityRouteHref(city);
  const { oldest, newest, updated } = routeUpdates(routes);

  const viewerRoutes: ViewerRoute[] = routes.map((r) => {
    const categories = r.categories.join(", ");
    return {
      no: r.no,
      title: t("route", { no: r.no }),
      categories,
      groups: routeGroupKeys(r),
      image: r.image,
      width: r.width,
      height: r.height,
      alt: t("mapAlt", { city: names.city, no: r.no, categories }),
      source: t("mapSource", { date: formatRouteDate(r.source.date) }),
      badge:
        updated.includes(r) && r.source.inForce
          ? t("updatedBadge", { date: formatRouteDate(r.source.inForce) })
          : undefined,
    };
  });

  const labels = {
    ...Object.fromEntries(LABEL_KEYS.map((key) => [key, t(key)])),
    openFile: t("openFull"),
  } as ViewerLabels;

  return (
    <div className="bg-surface-muted">
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: tHeader("navHome"), href: "/" },
          { name: t("breadcrumb"), href: "/city-exam" },
          { name: names.city, href: path },
        ])}
      />
      <JsonLd
        data={collectionPageJsonLd({
          locale,
          title: t("title", names),
          description: t("metaDescription", { ...names, count: routes.length }),
          path,
          items: viewerRoutes.map((r) => ({ name: r.alt, href: `${path}#route-${r.no}`, image: r.image })),
        })}
      />

      <section className="section flex flex-col gap-5 py-6 sm:gap-6 sm:py-8">
        <div className="flex flex-col gap-2">
          <nav className="text-sm text-fg-muted">
            <Link href="/city-exam" className="hover:text-fg">
              {t("breadcrumb")}
            </Link>{" "}
            / {names.city}
          </nav>
          <h1 className="font-georgian text-2xl font-bold text-fg sm:text-3xl">{t("title", names)}</h1>
          <p className="max-w-3xl text-body leading-7 text-fg-muted">{t("subtitle", { count: routes.length })}</p>
        </div>

        {updated.length > 0 ? (
          <p className="rounded-card border border-line bg-warning-soft px-4 py-3 text-sm leading-6 text-fg">
            {t("partlyUpdated", {
              date: formatRouteDate(newest),
              numbers: updated.map((r) => `№${r.no}`).join(", "),
              oldDate: formatRouteDate(oldest),
            })}
          </p>
        ) : null}

        <CityRoutesViewer
          city={city}
          groups={cityRouteGroups(routes)}
          cities={EXAM_CITIES.map((c) => ({
            slug: c.slug,
            name: examCityName(c.slug, locale) ?? c.name.ka,
            href: cityRouteHref(c.slug),
          }))}
          routes={viewerRoutes}
          labels={labels}
        />

        <CityRoutesInfo byCategory={routesByCategory(routes)} />

        <p className="text-xs leading-5 text-fg-subtle">
          {t("source")}{" "}
          <a href={CITY_ROUTES_SOURCE_URL} target="_blank" rel="noopener" className="underline hover:text-fg">
            sa.gov.ge
          </a>
        </p>
      </section>
    </div>
  );
}
