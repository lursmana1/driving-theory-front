import type { CityExamData } from "@/lib/types/cityExam";
import ka from "./ka.json";
import en from "./en.json";
import ru from "./ru.json";

const BY_LOCALE: Record<string, CityExamData> = {
  ka: ka as CityExamData,
  en: en as CityExamData,
  ru: ru as CityExamData,
};

export function getCityExamData(locale: string): CityExamData {
  return BY_LOCALE[locale] ?? BY_LOCALE.ka;
}
