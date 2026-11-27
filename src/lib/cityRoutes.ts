import "server-only";
import type { OfficialRoute } from "@/data/cityRoutes/official";

/**
 * Category groups in the order the agency lists them. A route belongs to a group
 * when it carries the group's first category (`test`).
 */
export const CITY_ROUTE_GROUPS = [
  { key: "b", label: "B, BE", test: "B" },
  { key: "c", label: "C, C1, D1", test: "C" },
  { key: "d", label: "D", test: "D" },
  { key: "e", label: "CE, DE, C1E, D1E", test: "CE" },
] as const;

/** Keys of the groups a route belongs to. */
export const routeGroupKeys = (route: OfficialRoute): string[] =>
  CITY_ROUTE_GROUPS.filter((g) => route.categories.includes(g.test)).map((g) => g.key);

/** Groups that have at least one route in this city. */
export const cityRouteGroups = (routes: OfficialRoute[]) =>
  CITY_ROUTE_GROUPS.filter((g) => routes.some((r) => r.categories.includes(g.test))).map(({ key, label }) => ({
    key,
    label,
  }));

/** [1, 2, 3, 6, 7] → "№1–№3, №6, №7" */
export function formatRouteNumbers(nos: number[]): string {
  const sorted = [...nos].sort((a, b) => a - b);
  const parts: string[] = [];
  for (let i = 0; i < sorted.length; ) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1] === sorted[j] + 1) j++;
    parts.push(
      j - i >= 2
        ? `№${sorted[i]}–№${sorted[j]}`
        : sorted
            .slice(i, j + 1)
            .map((n) => `№${n}`)
            .join(", "),
    );
    i = j + 1;
  }
  return parts.join(", ");
}

/** "B, BE: №1–№4" rows for the routes-by-category card. */
export const routesByCategory = (routes: OfficialRoute[]) =>
  CITY_ROUTE_GROUPS.map((g) => ({
    label: g.label,
    numbers: formatRouteNumbers(routes.filter((r) => r.categories.includes(g.test)).map((r) => r.no)),
  })).filter((row) => row.numbers);

/**
 * When a city's maps come from more than one agency file (Gori: October update for some
 * routes), the routes from the newest file are "updated" and the rest are older.
 */
export function routeUpdates(routes: OfficialRoute[]) {
  const dates = [...new Set(routes.map((r) => r.source.date))].sort();
  const newest = dates[dates.length - 1];
  const updated = dates.length > 1 ? routes.filter((r) => r.source.date === newest) : [];
  return { oldest: dates[0], newest, updated };
}
