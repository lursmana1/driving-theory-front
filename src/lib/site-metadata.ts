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
  title: "პრავის ბილეთები, თეორიის ბილეთები | prava.ge",
  shortTitle: "prava.ge",
  description:
    "პრავის ბილეთები და თეორიის ბილეთები (pravis biletebi) — საქართველოს მართვის მოწმობის თეორიული გამოცდა. ქართულად, ინგლისურად და რუსულად.",
  url: "https://prava.ge",
  locale: "ka_GE",
  creator: "prava.ge",
  keywords: [
    "პრავის ბილეთები",
    "თეორიის ბილეთები",
    "pravis biletebi",
    "teoriis biletebi",
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
 * Canonical origin for metadata, og:url, sitemap and OG images.
 * On Hetzner this is `https://prava.ge`. `NEXT_PUBLIC_SITE_URL` overrides if set.
 */
export function getMetadataBaseUrl(): string {
  return asOrigin(process.env.NEXT_PUBLIC_SITE_URL) ?? siteMetadata.url;
}

/** True when canonical URLs are the live domain (not a preview host). */
export function isCanonicalHost(): boolean {
  return getMetadataBaseUrl() === siteMetadata.url;
}
