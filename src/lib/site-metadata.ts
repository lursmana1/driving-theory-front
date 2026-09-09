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

/**
 * Host used to resolve relative OG/Twitter image URLs.
 * Production stays on prava.ge; preview deploys use the Vercel URL so
 * crawlers can fetch the generated opengraph-image instead of a domain
 * that is not live yet.
 */
export function getMetadataBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (explicit) return explicit;

  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") {
    const host = process.env.VERCEL_URL?.trim().replace(/^https?:\/\//, "");
    if (host) return `https://${host}`;
  }

  return siteMetadata.url;
}
