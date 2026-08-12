/** Public paths for category icons under `public/svg/`. */
const CATEGORY_ICONS = {
  AA1: "/svg/AA1.svg",
  AM: "/svg/AM.svg",
  BB1: "/svg/BB1.svg",
  C: "/svg/C.svg",
  C1: "/svg/C1.svg",
  D: "/svg/D.svg",
  D1: "/svg/D1.svg",
  TS: "/svg/TS.svg",
  TRAM: "/svg/TRAM.svg",
  ARMY: "/svg/ARMY.svg",
} as const;

export type CategoryIconKey = keyof typeof CATEGORY_ICONS;

/** Frontend asset keys by official category id (matches tickets/static data). */
const ICON_BY_CATEGORY_ID: Record<number, CategoryIconKey> = {
  0: "AM",
  1: "BB1",
  2: "AA1",
  3: "C",
  4: "D",
  5: "C1",
  6: "D1",
  7: "ARMY",
  8: "TRAM",
  9: "TS",
};

/** API iconKey values → local svg filename keys. */
const ICON_KEY_ALIASES: Record<string, CategoryIconKey> = {
  am: "AM",
  b: "BB1",
  bb1: "BB1",
  a: "AA1",
  aa1: "AA1",
  c: "C",
  d: "D",
  c1: "C1",
  d1: "D1",
  ts: "TS",
  tram: "TRAM",
  army: "ARMY",
  military: "ARMY",
};

export function resolveCategoryIconKey(
  iconKey: string | null | undefined,
  categoryId?: number,
): CategoryIconKey {
  if (categoryId != null && ICON_BY_CATEGORY_ID[categoryId]) {
    return ICON_BY_CATEGORY_ID[categoryId];
  }

  if (!iconKey) return "BB1";

  const lower = iconKey.trim().toLowerCase();
  if (ICON_KEY_ALIASES[lower]) return ICON_KEY_ALIASES[lower];

  const upper = iconKey.trim().toUpperCase();
  if (upper in CATEGORY_ICONS) return upper as CategoryIconKey;

  return "BB1";
}

export function getCategoryIconSrc(
  iconKey: string | null | undefined,
  categoryId?: number,
): string {
  const resolved = resolveCategoryIconKey(iconKey, categoryId);
  return CATEGORY_ICONS[resolved];
}

const CATEGORY_SHORT_LABEL: Record<CategoryIconKey, string> = {
  AA1: "A1",
  BB1: "B1",
  AM: "AM",
  C: "C",
  C1: "C1",
  D: "D",
  D1: "D1",
  TS: "T/S",
  TRAM: "Tram",
  ARMY: "Mil",
};

/** Compact license label for tables (e.g. B1, A1, AM). */
export function getCategoryShortLabel(
  categoryId: number,
  iconKey?: string | null,
): string {
  const key = resolveCategoryIconKey(iconKey, categoryId);
  return CATEGORY_SHORT_LABEL[key] ?? key;
}
