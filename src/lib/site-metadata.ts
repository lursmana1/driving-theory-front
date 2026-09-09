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
  title: "prava.ge | მართვის მოწმობის თეორია საქართველოში",
  shortTitle: "prava.ge",
  description:
    "საქართველოს მართვის მოწმობის თეორიის სავარჯიშო ბილეთები, თემები და გამოცდის სიმულაცია. ქართულად, ინგლისურად და რუსულად.",
  url: "https://prava.ge",
  locale: "ka_GE",
  creator: "prava.ge",
  twitterHandle: "@prava.ge",
  keywords: [
    "მართვის მოწმობა",
    "თეორია",
    "სავარჯიშო ბილეთები",
    "გამოცდა",
    "driving theory Georgia",
    "права Грузия",
    "prava.ge",
    "პრავა",
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
