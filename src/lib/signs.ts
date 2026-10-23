import data from "@/data/signs/signs.json";
import en from "@/data/signs/i18n/en.json";
import ru from "@/data/signs/i18n/ru.json";
import type { Sign, SignGroup } from "@/lib/types/signs";

/**
 * Server only, used by the /signs pages — the full files carry every explanation, so they never go into
 * `messages/` or a client bundle. Georgian is the source; en/ru are translations by slug.
 */
const SIGNS = data.signs as Sign[];
const GROUPS = data.groups as SignGroup[];
const TRANSLATIONS: Record<string, Record<string, { name: string; description: string }>> = { en, ru };

export function getSignGroups(): SignGroup[] {
  return GROUPS;
}

/** Signs with names and explanations in `locale` (Georgian when there is no translation). */
export function getSigns(locale: string): Sign[] {
  const tr = TRANSLATIONS[locale];
  if (!tr) return SIGNS;
  return SIGNS.map((s) => (tr[s.slug] ? { ...s, ...tr[s.slug] } : s));
}
