import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { licenseCategories } from "@/CONSTS/categories";
import { getSubjectIds } from "@/CONSTS/subjects";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { BLOGS_PAGE_SIZE } from "@/CONSTS/pagination";
import { absoluteUrl, languageAlternates } from "@/lib/seo";
import { DEFAULT_SIGN_GROUP_ID, SIGN_GROUP_SLUGS, signGroupHref } from "@/CONSTS/signGroups";

type SitemapPath = {
  href: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
};

/** Public indexable modules. `/tickets` redirects, so only real category URLs are listed. */
export const STATIC_SITEMAP_PATHS: SitemapPath[] = [
  { href: "/", changeFrequency: "weekly", priority: 1 },
  { href: "/subjectpicker", changeFrequency: "monthly", priority: 0.8 },
  { href: "/city-exam", changeFrequency: "monthly", priority: 0.75 },
  { href: "/city-exam?cat=be", changeFrequency: "monthly", priority: 0.7 },
  { href: "/city-exam?cat=cd", changeFrequency: "monthly", priority: 0.7 },
  { href: "/city-exam?cat=cede", changeFrequency: "monthly", priority: 0.7 },
  { href: "/yard-exam", changeFrequency: "monthly", priority: 0.75 },
  { href: "/signs", changeFrequency: "monthly", priority: 0.8 },
  { href: "/blogs", changeFrequency: "weekly", priority: 0.7 },
];

export const ROBOTS_DISALLOW = [
  "/auth",
  "/auth/",
  "/exam",
  "/exam/",
  "/profile",
  "/profile/",
  "/practice",
  "/practice/",
  "/createblog",
  "/createleaderboard",
  "/*/auth",
  "/*/auth/",
  "/*/exam",
  "/*/exam/",
  "/*/profile",
  "/*/profile/",
  "/*/practice",
  "/*/practice/",
  "/*/createblog",
  "/*/createleaderboard",
];

export function sitemapEntry(
  href: string,
  extra: Pick<MetadataRoute.Sitemap[number], "changeFrequency" | "priority" | "lastModified">,
  /** False for Georgian-only content (blog posts): no en/ru alternates. */
  withLanguages = true,
): MetadataRoute.Sitemap[number] {
  return {
    url: absoluteUrl(href, routing.defaultLocale),
    lastModified: extra.lastModified ?? new Date(),
    changeFrequency: extra.changeFrequency,
    priority: extra.priority,
    ...(withLanguages ? { alternates: { languages: languageAlternates(href) } } : {}),
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

/**
 * One entry per category. Pages 2+ (`?page=N`) are left out on purpose: they repeat page 1's
 * template, so search engines treated them as near-duplicates and skipped most of the site.
 * Crawlers still reach them through the pagination links.
 */
function ticketCategoryPaths(categoryIds: number[]): SitemapPath[] {
  return categoryIds.map((id) => ({
    href: `/tickets/${id}`,
    changeFrequency: "weekly",
    priority: 0.9,
  }));
}

type BlogListPayload = {
  data?: { id: number; createdAt?: string; updatedAt?: string; imageUrl?: string }[];
  totalPages?: number;
};

type BlogSitemapPost = { href: string; lastModified?: Date; image?: string };

function parseDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

async function fetchBlogSitemap(): Promise<{
  posts: BlogSitemapPost[];
  listPages: number;
}> {
  const empty = { posts: [] as BlogSitemapPost[], listPages: 1 };
  const base = getApiBaseUrl();
  if (!base) return empty;

  const posts: BlogSitemapPost[] = [];
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
          lastModified: parseDate(post.updatedAt) ?? parseDate(post.createdAt),
          image: post.imageUrl || undefined,
        });
      }
      totalPages = Math.max(1, Number(payload.totalPages) || 1);
      if (rows.length === 0) break;
      page += 1;
    }
  } catch {
    return { posts, listPages: Math.max(1, totalPages) };
  }

  return { posts, listPages: Math.max(1, totalPages) };
}

export async function buildSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const [categoryIds, blogSitemap] = await Promise.all([
    fetchCategoryIds(),
    fetchBlogSitemap(),
  ]);

  const subjectIds = getSubjectIds();
  const ticketPaths = ticketCategoryPaths(categoryIds);
  const subjectPaths: SitemapPath[] = categoryIds.flatMap((categoryId) =>
    subjectIds.map((subjectId) => ({
      href: `/tickets/${categoryId}?subjects=${subjectId}`,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
  );
  const blogListPaths: SitemapPath[] = [];
  for (let page = 2; page <= blogSitemap.listPages && page <= 20; page += 1) {
    blogListPaths.push({
      href: `/blogs?page=${page}`,
      changeFrequency: "weekly",
      priority: 0.5,
    });
  }

  const signGroupPaths: SitemapPath[] = Object.keys(SIGN_GROUP_SLUGS)
    .map(Number)
    .filter((id) => id !== DEFAULT_SIGN_GROUP_ID)
    .map((id) => ({ href: signGroupHref(id), changeFrequency: "monthly", priority: 0.7 }));

  return [
    ...STATIC_SITEMAP_PATHS.map((item) => sitemapEntry(item.href, item)),
    ...signGroupPaths.map((item) => sitemapEntry(item.href, item)),
    ...ticketPaths.map((item) => sitemapEntry(item.href, item)),
    ...subjectPaths.map((item) => sitemapEntry(item.href, item)),
    ...blogListPaths.map((item) => sitemapEntry(item.href, item)),
    ...blogSitemap.posts.map((item) => ({
      ...sitemapEntry(
        item.href,
        { changeFrequency: "monthly", priority: 0.6, lastModified: item.lastModified },
        false,
      ),
      ...(item.image ? { images: [item.image] } : {}),
    })),
  ];
}
