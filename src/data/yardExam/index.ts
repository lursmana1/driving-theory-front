import type { YardExamData } from "@/lib/types/yardExam";
import ka from "./ka.json";
import en from "./en.json";
import ru from "./ru.json";

const BY_LOCALE: Record<string, YardExamData> = {
  ka: ka as YardExamData,
  en: en as YardExamData,
  ru: ru as YardExamData,
};

export function getYardExamData(locale: string): YardExamData {
  return BY_LOCALE[locale] ?? BY_LOCALE.ka;
}
