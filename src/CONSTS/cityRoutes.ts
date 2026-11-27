/** The 10 cities that hold the practical city exam (none in Tbilisi). Order = the agency's own list. */
export const EXAM_CITIES = [
  { slug: "rustavi", name: { ka: "რუსთავი", en: "Rustavi", ru: "Рустави" }, kaGen: "რუსთავის" },
  { slug: "telavi", name: { ka: "თელავი", en: "Telavi", ru: "Телави" }, kaGen: "თელავის" },
  { slug: "gori", name: { ka: "გორი", en: "Gori", ru: "Гори" }, kaGen: "გორის" },
  { slug: "akhaltsikhe", name: { ka: "ახალციხე", en: "Akhaltsikhe", ru: "Ахалцихе" }, kaGen: "ახალციხის" },
  { slug: "sachkhere", name: { ka: "საჩხერე", en: "Sachkhere", ru: "Сачхере" }, kaGen: "საჩხერის" },
  { slug: "kutaisi", name: { ka: "ქუთაისი", en: "Kutaisi", ru: "Кутаиси" }, kaGen: "ქუთაისის" },
  { slug: "ozurgeti", name: { ka: "ოზურგეთი", en: "Ozurgeti", ru: "Озургети" }, kaGen: "ოზურგეთის" },
  { slug: "poti", name: { ka: "ფოთი", en: "Poti", ru: "Поти" }, kaGen: "ფოთის" },
  { slug: "batumi", name: { ka: "ბათუმი", en: "Batumi", ru: "Батуми" }, kaGen: "ბათუმის" },
  { slug: "zugdidi", name: { ka: "ზუგდიდი", en: "Zugdidi", ru: "Зугдиди" }, kaGen: "ზუგდიდის" },
] as const;

export type ExamCitySlug = (typeof EXAM_CITIES)[number]["slug"];
export type ExamCityLocale = "ka" | "en" | "ru";

export const cityRouteHref = (slug: string) => `/city-exam/${slug}`;

export function examCityName(slug: string, locale: string): string | null {
  const city = EXAM_CITIES.find((c) => c.slug === slug);
  if (!city) return null;
  return city.name[(["ka", "en", "ru"].includes(locale) ? locale : "ka") as ExamCityLocale];
}

/** Name for "<city>'s routes" headings: Georgian genitive („რუსთავის“); en/ru use the plain name. */
export function examCityGenitive(slug: string, locale: string): string | null {
  const city = EXAM_CITIES.find((c) => c.slug === slug);
  if (!city) return null;
  return locale === "ka" ? city.kaGen : examCityName(slug, locale);
}

/** Official route files: sa.gov.ge → „ნორმატიული აქტები“, order №598 annexes. Re-check every 1–2 months. */
export const CITY_ROUTES_SOURCE_URL = "https://www.sa.gov.ge/d/normativeacts";
