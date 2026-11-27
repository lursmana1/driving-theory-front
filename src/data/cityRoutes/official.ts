import "server-only";
import official from "./official.json";

/** One official route map (sa.gov.ge order №598 annex), built by scripts/city-routes/publish-official.mjs. */
export type OfficialRoute = {
  no: number;
  categories: string[];
  image: string;
  width: number;
  height: number;
  /** date = date of the agency's file; inForce = when an updated map takes effect */
  source: { date: string; doc: string; inForce?: string };
};

const DATA = official as Record<string, OfficialRoute[]>;

export function getOfficialRoutes(slug: string): OfficialRoute[] | null {
  return DATA[slug]?.length ? DATA[slug] : null;
}

/** "2026-07-21" → "21.07.2026" */
export const formatRouteDate = (iso: string) => iso.split("-").reverse().join(".");
