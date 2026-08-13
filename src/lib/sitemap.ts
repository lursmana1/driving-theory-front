import type { MetadataRoute } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { siteMetadata } from "@/lib/site-metadata";
import { licenseCategories } from "@/CONSTS/categories";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { BLOGS_PAGE_SIZE } from "@/CONSTS/pagination";

type Locale = (typeof routing.locales)[number];

type SitemapPath = {
  href: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
};

/** Public indexable modules. Auth, exam, profile, admin, and stub leaderboard stay out. */
export const STATIC_SITEMAP_PATHS: SitemapPath[] = [
  { href: "/", changeFrequency: "weekly", priority: 1 },
  { href: "/subjectpicker", changeFrequency: "monthly", priority: 0.8 },
  { href: "/blogs", changeFrequency: "weekly", priority: 0.7 },
];

export const ROBOTS_DISALLOW = [
  "/*/auth",
  "/*/auth/",
  "/*/exam",
  "/*/exam/",
  "/*/profile",
  "/*/createblog",
  "/*/createleaderboard",
  "/*/leaderboard",
];

function absoluteUrl(href: string, locale: Locale): string {
  const pathname = getPathname({ locale, href });
  return `${siteMetadata.url}${pathname}`;
}

function languageAlternates(href: string): Record<string, string> {
  const languages = Object.fromEntries(
    routing.locales.map((locale) => [locale, absoluteUrl(href, locale)]),
  );
  languages["x-default"] = absoluteUrl(href, routing.defaultLocale);
  return languages;
}

export function sitemapEntry(
  href: string,
  extra: Pick<MetadataRoute.Sitemap[number], "changeFrequency" | "priority" | "lastModified">,
): MetadataRoute.Sitemap[number] {
  return {
    url: absoluteUrl(href, routing.defaultLocale),
    lastModified: extra.lastModified ?? new Date(),
    changeFrequency: extra.changeFrequency,
    priority: extra.priority,
    alternates: { languages: languageAlternates(href) },
  };
}

async function fetchCategoryIds(): Promise<number[]> {
  const fallback = licenseCategories.map((c) => c.id);
  const base = getApiBaseUrl();
  if (!base) return fallback;

  try {
    const res = await fetch(`${base}/categories`, {
      next: { revalidate: 3600 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return fallback;
    const payload: unknown = await res.json();
    const rows = Array.isArray(payload) ? payload : [];
    const ids = rows
      .map((row) => (row && typeof row === "object" && "id" in row ? Number(row.id) : NaN))
      .filter((id) => Number.isFinite(id));
    return ids.length > 0 ? ids : fallback;
  } catch {
    return fallback;
  }
}

type BlogListPayload = {
  data?: { id: number; updatedAt?: string }[];
  totalPages?: number;
};

async function fetchBlogHrefs(): Promise<{ href: string; lastModified?: Date }[]> {
  const base = getApiBaseUrl();
  if (!base) return [];

  const posts: { href: string; lastModified?: Date }[] = [];
  let page = 1;
  let totalPages = 1;

  try {
    while (page <= totalPages && page <= 20) {
      const res = await fetch(
        `${base}/blogs?page=${page}&size=${BLOGS_PAGE_SIZE}`,
        {
          next: { revalidate: 3600 },
          headers: { Accept: "application/json" },
        },
      );
      if (!res.ok) break;
      const payload = (await res.json()) as BlogListPayload;
      const rows = Array.isArray(payload.data) ? payload.data : [];
      for (const post of rows) {
        if (post?.id == null) continue;
        posts.push({
          href: `/blogs/${post.id}`,
          lastModified: post.updatedAt ? new Date(post.updatedAt) : undefined,
        });
      }
      totalPages = Math.max(1, Number(payload.totalPages) || 1);
      if (rows.length === 0) break;
      page += 1;
    }
  } catch {
    return posts;
  }

  return posts;
}

export async function buildSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const [categoryIds, blogs] = await Promise.all([
    fetchCategoryIds(),
    fetchBlogHrefs(),
  ]);

  const ticketPaths: SitemapPath[] = categoryIds.map((id) => ({
    href: `/tickets/${id}`,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  return [
    ...STATIC_SITEMAP_PATHS.map((item) => sitemapEntry(item.href, item)),
    ...ticketPaths.map((item) => sitemapEntry(item.href, item)),
    ...blogs.map((item) =>
      sitemapEntry(item.href, {
        changeFrequency: "monthly",
        priority: 0.6,
        lastModified: item.lastModified,
      }),
    ),
  ];
}
