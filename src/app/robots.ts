import type { MetadataRoute } from "next";
import { getMetadataBaseUrl } from "@/lib/site-metadata";
import { ROBOTS_DISALLOW } from "@/lib/sitemap";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [...ROBOTS_DISALLOW],
    },
    sitemap: `${getMetadataBaseUrl()}/sitemap.xml`,
    host: getMetadataBaseUrl(),
  };
}
