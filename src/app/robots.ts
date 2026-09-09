import type { MetadataRoute } from "next";
import { getMetadataBaseUrl, isCanonicalHost } from "@/lib/site-metadata";
import { ROBOTS_DISALLOW } from "@/lib/sitemap";

export default function robots(): MetadataRoute.Robots {
  const origin = getMetadataBaseUrl();

  // Crawling stays open even off-domain so link-preview scrapers can read the
  // page; the pages themselves carry `noindex` there. Only the real domain
  // advertises a sitemap.
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [...ROBOTS_DISALLOW],
    },
    ...(isCanonicalHost() ? { sitemap: `${origin}/sitemap.xml` } : {}),
    host: origin,
  };
}
