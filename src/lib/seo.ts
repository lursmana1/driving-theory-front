import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getMetadataBaseUrl, isCanonicalHost, siteMetadata } from "./site-metadata";

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
  return `${getMetadataBaseUrl()}${localizedPath(href, locale)}`;
}

function shareImageUrl(href: string, locale?: string): string {
  const pagePath = localizedPath(href, locale);
  return `${getMetadataBaseUrl()}${pagePath}/opengraph-image`;
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
  const shareImage = shareImageUrl(path, loc);
  const resolvedDescription = description ?? siteMetadata.description;
  const fullTitle = title
    ? titleAbsolute
      ? title
      : `${title} | ${siteMetadata.shortTitle ?? siteMetadata.name}`
    : siteMetadata.title;
  const shareImages = [
    {
      url: shareImage,
      width: 1200,
      height: 630,
      alt: "prava.ge",
    },
  ];

  return {
    metadataBase: new URL(getMetadataBaseUrl()),
    title: titleAbsolute || !title ? { absolute: fullTitle } : title,
    description: resolvedDescription,
    keywords,
    applicationName: siteMetadata.name,
    creator: siteMetadata.creator,
    authors: [{ name: siteMetadata.creator }],
    robots:
      index && isCanonicalHost()
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
      images: shareImages,
      ...openGraph,
    },
    twitter: {
      card: "summary_large_image",
      site: siteMetadata.twitterHandle,
      creator: siteMetadata.twitterHandle,
      title: fullTitle,
      description: resolvedDescription,
      images: [shareImage],
    },
  };
};

export function websiteJsonLd(locale: string) {
  const url = absoluteUrl("/", locale);
  const origin = getMetadataBaseUrl();
  const logo = `${origin}/images/jpg/pravaLogo.jpg`;
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteMetadata.name,
    alternateName: ["პრავა", "prava", "თეორიული გამოცდის ბილეთები"],
    url,
    inLanguage: locale,
    description: siteMetadata.description,
    publisher: {
      "@type": "Organization",
      name: siteMetadata.name,
      url: siteMetadata.url,
      logo,
      image: logo,
    },
  };
}

export function faqJsonLd(
  locale: string,
  items: { question: string; answer: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: locale,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
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
