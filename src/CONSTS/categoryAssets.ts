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

export function getCategoryIconSrc(iconKey: string): string {
  return (
    CATEGORY_ICONS[iconKey as CategoryIconKey] ?? `/svg/${iconKey}.svg`
  );
}
