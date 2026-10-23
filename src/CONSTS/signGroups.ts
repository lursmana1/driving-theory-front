/** URL names of the sign groups (ids from `src/data/signs/signs.json`). */
export const SIGN_GROUP_SLUGS: Record<number, string> = {
  1: "warning",
  2: "priority",
  3: "prohibitory",
  4: "mandatory",
  5: "special-regulation",
  6: "service",
  7: "information",
  8: "additional-information",
  101: "road-markings",
};

/** Shown on `/signs` itself, so it has no `/signs/category/…` page of its own (no duplicate URL). */
export const DEFAULT_SIGN_GROUP_ID = 1;

export function signGroupHref(groupId: number): string {
  return groupId === DEFAULT_SIGN_GROUP_ID
    ? "/signs"
    : `/signs/category/${SIGN_GROUP_SLUGS[groupId]}`;
}

export function signGroupIdBySlug(slug: string): number | undefined {
  const entry = Object.entries(SIGN_GROUP_SLUGS).find(([, s]) => s === slug);
  return entry && Number(entry[0]) !== DEFAULT_SIGN_GROUP_ID ? Number(entry[0]) : undefined;
}
