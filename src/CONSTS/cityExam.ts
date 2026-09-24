import type { CityExamCategoryKey, CityExamData } from "@/lib/types/cityExam";

export const CITY_EXAM_CATEGORIES: {
  key: CityExamCategoryKey;
  dataKey: keyof CityExamData;
  labelKey: "catB" | "catBE" | "catCD" | "catCeDe";
}[] = [
  { key: "b", dataKey: "CityExam", labelKey: "catB" },
  { key: "be", dataKey: "BeCityExam", labelKey: "catBE" },
  { key: "cd", dataKey: "CdCityExam", labelKey: "catCD" },
  { key: "cede", dataKey: "CeDeCityExam", labelKey: "catCeDe" },
];

export const DEFAULT_CITY_EXAM_CATEGORY: CityExamCategoryKey = "b";

export function resolveCityExamCategory(
  value: string | undefined | null,
): CityExamCategoryKey {
  const match = CITY_EXAM_CATEGORIES.find((c) => c.key === value);
  return match?.key ?? DEFAULT_CITY_EXAM_CATEGORY;
}
