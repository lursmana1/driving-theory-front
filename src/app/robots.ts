import type { MetadataRoute } from "next";
import { siteMetadata } from "@/lib/site-metadata";
import { ROBOTS_DISALLOW } from "@/lib/sitemap";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [...ROBOTS_DISALLOW],
    },
    sitemap: `${siteMetadata.url}/sitemap.xml`,
    host: siteMetadata.url,
  };
}
