import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { licenseCategories } from "@/CONSTS/categories";
import { getSubjectIds } from "@/CONSTS/subjects";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { BLOGS_PAGE_SIZE, TICKETS_PAGE_SIZE } from "@/CONSTS/pagination";
import { absoluteUrl, languageAlternates } from "@/lib/seo";

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
  { href: "/blogs", changeFrequency: "weekly", priority: 0.7 },
];

export const ROBOTS_DISALLOW = [
  "/auth",
  "/auth/",
  "/exam",
  "/exam/",
  "/profile",
  "/profile/",
  "/createblog",
  "/createleaderboard",
  "/*/auth",
  "/*/auth/",
  "/*/exam",
  "/*/exam/",
  "/*/profile",
  "/*/profile/",
  "/*/createblog",
  "/*/createleaderboard",
];

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

const MAX_TICKET_SITEMAP_PAGES = 200;

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

async function fetchCategoryQuestionTotal(
  categoryId: number,
): Promise<number> {
  const base = getApiBaseUrl();
  if (!base) return 0;

  try {
    const res = await fetch(
      `${base}/questions?category=${categoryId}&page=1&size=1`,
      {
        next: { revalidate: 3600 },
        headers: { Accept: "application/json" },
      },
    );
    if (!res.ok) return 0;
    const payload = (await res.json()) as { total?: number };
    const total = Number(payload?.total);
    return Number.isFinite(total) && total > 0 ? total : 0;
  } catch {
    return 0;
  }
}

async function fetchTicketListingPaths(
  categoryIds: number[],
): Promise<SitemapPath[]> {
  const totals = await Promise.all(
    categoryIds.map(async (id) => ({
      id,
      total: await fetchCategoryQuestionTotal(id),
    })),
  );

  return totals.flatMap(({ id, total }) => {
    const pages = Math.min(
      MAX_TICKET_SITEMAP_PAGES,
      Math.max(1, Math.ceil(total / TICKETS_PAGE_SIZE)),
    );
    const listings: SitemapPath[] = [
      {
        href: `/tickets/${id}`,
        changeFrequency: "weekly",
        priority: 0.9,
      },
    ];
    for (let page = 2; page <= pages; page += 1) {
      listings.push({
        href: `/tickets/${id}?page=${page}`,
        changeFrequency: "weekly",
        priority: 0.55,
      });
    }
    return listings;
  });
}

type BlogListPayload = {
  data?: { id: number; updatedAt?: string }[];
  totalPages?: number;
};

async function fetchBlogSitemap(): Promise<{
  posts: { href: string; lastModified?: Date }[];
  listPages: number;
}> {
  const empty = { posts: [] as { href: string; lastModified?: Date }[], listPages: 1 };
  const base = getApiBaseUrl();
  if (!base) return empty;

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
  const ticketPaths = await fetchTicketListingPaths(categoryIds);
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

  return [
    ...STATIC_SITEMAP_PATHS.map((item) => sitemapEntry(item.href, item)),
    ...ticketPaths.map((item) => sitemapEntry(item.href, item)),
    ...subjectPaths.map((item) => sitemapEntry(item.href, item)),
    ...blogListPaths.map((item) => sitemapEntry(item.href, item)),
    ...blogSitemap.posts.map((item) =>
      sitemapEntry(item.href, {
        changeFrequency: "monthly",
        priority: 0.6,
        lastModified: item.lastModified,
      }),
    ),
  ];
}
