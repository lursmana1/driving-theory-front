/** Road-sign reference (`src/data/signs/signs.json`, made by `scripts/signs/import.mjs`). */
export type SignKind = "sign" | "marking";

export type SignGroup = {
  id: number;
  /** Georgian name from the source; UI uses `SignsPage.groups.<id>` */
  name: string;
  kind: SignKind;
  count: number;
  icon: string;
};

export type Sign = {
  /** URL segment, no dots: "3-32", "1-4-1--1-4-6", "marking-1-1" */
  slug: string;
  kind: SignKind;
  group: number;
  order: number;
  /** "3.32" or a range "1.4.1–1.4.6" */
  number: string;
  /** every number this entry covers (a range expanded) */
  numbers: string[];
  /** empty for road markings */
  name: string;
  /** Georgian; paragraphs separated by "\n" */
  description: string;
  image: string;
  /** a sheet of several signs (shown twice as wide) */
  wide: boolean;
};

/** Sign without its description — what list views send to the client. */
export type SignSummary = Omit<Sign, "description">;

/** `lookup.<lang>.json` value: [slug, number, name, image, group, wide (1/0)] */
export type SignLookupEntry = [string, string, string, string, number, number];
export type SignLookup = Record<string, SignLookupEntry>;
