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

function splitPathAndSearch(href: string): { pathname: string; search: string } {
  const q = href.indexOf("?");
  if (q === -1) return { pathname: href, search: "" };
  return { pathname: href.slice(0, q), search: href.slice(q) };
}

export function localizedPath(href: string, locale?: string): string {
  const { pathname, search } = splitPathAndSearch(href);
  return `${getPathname({ href: pathname, locale: asLocale(locale) })}${search}`;
}

export function absoluteUrl(href: string, locale?: string): string {
  return `${getMetadataBaseUrl()}${localizedPath(href, locale)}`;
}

function shareImageUrl(): string {
  // Static PNG — X/Twitter often ignores og:image URLs with no file extension
  // (e.g. /ka/opengraph-image). Facebook accepts that route; X does not.
  return `${getMetadataBaseUrl()}/og.png`;
}

export function languageAlternates(href: string): Record<string, string> {
  const languages = Object.fromEntries(
    routing.locales.map((locale) => [locale, absoluteUrl(href, locale)]),
  );
  const defaultUrl = absoluteUrl(href, routing.defaultLocale);
  languages["ka-GE"] = defaultUrl;
  languages["x-default"] = defaultUrl;
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
  /** Page-specific share image (e.g. a blog cover). Falls back to the site image. */
  image?: { url: string; width?: number; height?: number; alt?: string };
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
  image,
}: MetadataInput = {}): Metadata => {
  const loc = asLocale(locale);
  const canonical = absoluteUrl(path, loc);
  const shareImage = image?.url ?? shareImageUrl();
  const resolvedDescription = description ?? siteMetadata.description;
  const fullTitle = title
    ? titleAbsolute
      ? title
      : `${title} | ${siteMetadata.shortTitle ?? siteMetadata.name}`
    : siteMetadata.title;
  const shareImages = [
    image
      ? {
          url: image.url,
          ...(image.width ? { width: image.width } : {}),
          ...(image.height ? { height: image.height } : {}),
          alt: image.alt ?? fullTitle,
        }
      : {
          url: shareImage,
          width: 1200,
          height: 630,
          alt: "პრავის ბილეთები | მართვის მოწმობის ბილეთები და გამოცდა",
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
    robots: isCanonicalHost()
      ? index
        ? { index: true, follow: true }
        : { index: false, follow: true }
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
      title: fullTitle,
      description: resolvedDescription,
      images: [shareImage],
    },
  };
};

export function websiteJsonLd(locale: string) {
  const origin = getMetadataBaseUrl();
  const logo = `${origin}/images/jpg/pravaLogo.jpg`;
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteMetadata.name,
    alternateName: [
      "პრავა",
      "prava",
      "პრავის ბილეთები",
      "თეორიის ბილეთები",
      "მართვის მოწმობის ბილეთები",
      "pravis biletebi",
      "თეორიული გამოცდის ბილეთები",
    ],
    url: absoluteUrl("/", routing.defaultLocale),
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

type BlogJsonLdPost = {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  creator?: { name: string } | null;
};

function isoDate(value?: string | Date): string | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function siteOrganization() {
  const logo = `${getMetadataBaseUrl()}/images/jpg/pravaLogo.jpg`;
  return {
    "@type": "Organization",
    name: siteMetadata.name,
    url: siteMetadata.url,
    logo: { "@type": "ImageObject", url: logo },
  };
}

export function blogPostingJsonLd(locale: string, post: BlogJsonLdPost) {
  const url = absoluteUrl(`/blogs/${post.id}`, locale);
  const published = isoDate(post.createdAt);
  const modified = isoDate(post.updatedAt) ?? published;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.name,
    description: post.description,
    ...(post.imageUrl ? { image: [post.imageUrl] } : {}),
    ...(published ? { datePublished: published } : {}),
    ...(modified ? { dateModified: modified } : {}),
    inLanguage: locale,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: post.creator?.name
      ? { "@type": "Person", name: post.creator.name }
      : siteOrganization(),
    publisher: siteOrganization(),
  };
}

export function blogListJsonLd(input: {
  locale: string;
  title: string;
  description: string;
  path: string;
  posts: BlogJsonLdPost[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: input.title,
    description: input.description,
    url: absoluteUrl(input.path, input.locale),
    inLanguage: input.locale,
    publisher: siteOrganization(),
    blogPost: input.posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.name,
      url: absoluteUrl(`/blogs/${post.id}`, input.locale),
      ...(isoDate(post.createdAt)
        ? { datePublished: isoDate(post.createdAt) }
        : {}),
      ...(post.imageUrl ? { image: post.imageUrl } : {}),
    })),
  };
}

export function breadcrumbJsonLd(
  locale: string,
  items: { name: string; href: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.href, locale),
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
