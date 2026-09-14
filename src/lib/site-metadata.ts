export type SiteMetadata = {
  name: string;
  title: string;
  description: string;
  shortTitle?: string;
  url: string;
  locale: string;
  creator: string;
  twitterHandle?: string;
  keywords: string[];
};

export const siteMetadata: SiteMetadata = {
  name: "prava.ge",
  title: "პრავა — თეორიული გამოცდის ბილეთები | prava.ge",
  shortTitle: "prava.ge",
  description:
    "პრავა (prava.ge) — საქართველოს მართვის მოწმობის თეორიული გამოცდის ბილეთები, თემები და გამოცდის სიმულაცია. ქართულად, ინგლისურად და რუსულად.",
  url: "https://prava.ge",
  locale: "ka_GE",
  creator: "prava.ge",
  keywords: [
    "პრავა",
    "prava",
    "prava.ge",
    "თეორიული გამოცდის ბილეთები",
    "teoriuli gamocdis biletebi",
    "სავარჯიშო ბილეთები",
    "მართვის მოწმობა",
    "თეორია",
    "გამოცდა",
    "driving theory Georgia",
    "права Грузия",
    "билеты ПДД Грузия",
  ],
};

function asOrigin(value?: string): string | undefined {
  const host = value?.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
  return host ? `https://${host}` : undefined;
}

/**
 * Origin that canonical URLs, `og:url` and generated OG images are built from.
 *
 * Crawlers follow `og:url`, so this has to be a host that actually answers —
 * otherwise link previews come back empty. Set `NEXT_PUBLIC_SITE_URL` to pin it
 * (use that once prava.ge is live); on Vercel it falls back to the deployment's
 * own host, and anywhere else to `siteMetadata.url`.
 */
export function getMetadataBaseUrl(): string {
  const explicit = asOrigin(process.env.NEXT_PUBLIC_SITE_URL);
  if (explicit) return explicit;

  if (process.env.VERCEL_ENV === "production") {
    const productionAlias =
      asOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
      asOrigin(process.env.VERCEL_URL);
    if (productionAlias) return productionAlias;
  }

  const deployment = asOrigin(process.env.VERCEL_URL);
  if (deployment) return deployment;

  return siteMetadata.url;
}

/**
 * True only when served from the real domain. Anywhere else (Vercel hosts while
 * prava.ge is not live) pages are kept out of search results, so the staging
 * host never competes with the real one. Social scrapers ignore `noindex`, so
 * link previews keep working there.
 */
export function isCanonicalHost(): boolean {
  return getMetadataBaseUrl() === siteMetadata.url;
}
