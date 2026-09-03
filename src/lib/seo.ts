import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { siteMetadata } from "./site-metadata";

type Locale = (typeof routing.locales)[number];

const OG_LOCALE: Record<string, string> = {
  ka: "ka_GE",
  en: "en_US",
  ru: "ru_RU",
};

function asLocale(locale?: string): Locale {
  return routing.locales.includes(locale as Locale)
    ? (locale as Locale)
    : routing.defaultLocale;
}

export function localizedPath(href: string, locale?: string): string {
  return getPathname({ href, locale: asLocale(locale) });
}

export function absoluteUrl(href: string, locale?: string): string {
  return `${siteMetadata.url}${localizedPath(href, locale)}`;
}

export function languageAlternates(href: string): Record<string, string> {
  const languages = Object.fromEntries(
    routing.locales.map((locale) => [locale, absoluteUrl(href, locale)]),
  );
  languages["x-default"] = absoluteUrl(href, routing.defaultLocale);
  return languages;
}

type MetadataInput = {
  title?: string;
  description?: string;
  keywords?: string[];
  /** App path without locale, e.g. `/` or `/tickets/1`. */
  path?: string;
  locale?: string;
  /** Skip the root `%s | prava.ge` template (use for the homepage). */
  titleAbsolute?: boolean;
  index?: boolean;
  openGraph?: Metadata["openGraph"];
};

export const buildMetadata = ({
  title,
  description,
  keywords = siteMetadata.keywords,
  path = "/",
  locale,
  titleAbsolute = false,
  index = true,
  openGraph,
}: MetadataInput = {}): Metadata => {
  const loc = asLocale(locale);
  const canonical = absoluteUrl(path, loc);
  const resolvedDescription = description ?? siteMetadata.description;
  const fullTitle = title
    ? titleAbsolute
      ? title
      : `${title} | ${siteMetadata.shortTitle ?? siteMetadata.name}`
    : siteMetadata.title;

  return {
    metadataBase: new URL(siteMetadata.url),
    title: titleAbsolute || !title ? { absolute: fullTitle } : title,
    description: resolvedDescription,
    keywords,
    applicationName: siteMetadata.name,
    creator: siteMetadata.creator,
    authors: [{ name: siteMetadata.creator }],
    robots: index
      ? { index: true, follow: true }
      : { index: false, follow: false },
    alternates: {
      canonical,
      languages: languageAlternates(path),
    },
    openGraph: {
      type: "website",
      locale: OG_LOCALE[loc] ?? siteMetadata.locale,
      alternateLocale: routing.locales
        .filter((item) => item !== loc)
        .map((item) => OG_LOCALE[item] ?? item),
      url: canonical,
      title: fullTitle,
      siteName: siteMetadata.name,
      description: resolvedDescription,
      ...openGraph,
    },
    twitter: {
      card: "summary_large_image",
      site: siteMetadata.twitterHandle,
      creator: siteMetadata.twitterHandle,
      title: fullTitle,
      description: resolvedDescription,
    },
  };
};

export function websiteJsonLd(locale: string) {
  const url = absoluteUrl("/", locale);
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteMetadata.name,
    url,
    inLanguage: locale,
    description: siteMetadata.description,
    publisher: {
      "@type": "Organization",
      name: siteMetadata.name,
      url: siteMetadata.url,
    },
  };
}

export function ticketsJsonLd(input: {
  locale: string;
  categoryLabel: string;
  path: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: input.categoryLabel,
    description: input.description,
    url: absoluteUrl(input.path, input.locale),
    inLanguage: input.locale,
    isPartOf: {
      "@type": "WebSite",
      name: siteMetadata.name,
      url: siteMetadata.url,
    },
  };
}
