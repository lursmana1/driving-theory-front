import type { SignKind, SignLookup, SignSummary } from "@/lib/types/signs";

/** One small file per language, loaded on first use and shared (sign-number popovers + search across groups). */
const LOOKUPS: Record<string, () => Promise<{ default: unknown }>> = {
  ka: () => import("@/data/signs/lookup.ka.json"),
  en: () => import("@/data/signs/lookup.en.json"),
  ru: () => import("@/data/signs/lookup.ru.json"),
};
const lookupPromises: Record<string, Promise<SignLookup>> = {};

export function loadSignLookup(locale: string): Promise<SignLookup> {
  const lang = locale in LOOKUPS ? locale : "ka";
  lookupPromises[lang] ??= LOOKUPS[lang]().then((m) => m.default as SignLookup);
  return lookupPromises[lang];
}

/** What a search result needs to show and link a sign. */
export type SignSearchHit = Pick<SignSummary, "slug" | "kind" | "group" | "number" | "name" | "image" | "wide">;

/** Every sign once (the lookup has one key per number, so ranges repeat). */
export function signsFromLookup(lookup: SignLookup): SignSearchHit[] {
  const seen = new Map<string, SignSearchHit>();
  for (const [key, [slug, number, name, image, group, wide]] of Object.entries(lookup)) {
    if (!seen.has(slug)) {
      seen.set(slug, { slug, kind: key.split(":")[0] as SignKind, group, number, name, image, wide: wide === 1 });
    }
  }
  return [...seen.values()];
}
