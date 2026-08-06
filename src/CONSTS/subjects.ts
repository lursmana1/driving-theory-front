import subjectsData from "@/data/subjects.json";
import type { Subject } from "@/lib/types/subject";

export type AppLocale = "ka" | "en" | "ru";

function normalizeLocale(locale: string): AppLocale {
  if (locale === "en" || locale === "ru") return locale;
  return "ka";
}

export function getLocalizedSubjects(
  locale: string,
  options?: { questionsCount?: number },
): Subject[] {
  const lang = normalizeLocale(locale);
  const questionsCount = options?.questionsCount ?? 0;

  return subjectsData.map((subject) => ({
    id: subject.id,
    name: subject[lang],
    questionsCount,
  }));
}

export function getSubjectName(id: number, locale: string): string {
  const lang = normalizeLocale(locale);
  const subject = subjectsData.find((s) => s.id === id);
  return subject?.[lang] ?? `#${id}`;
}

const PLACEHOLDER_SUBJECT_NAME = /^Subject\s+\d+$/i;

/** Use API name when real; fall back to local subjects.json (backend may return placeholders). */
export function resolveSubjectDisplayName(
  id: number,
  apiName: string | undefined,
  locale: string,
): string {
  const trimmed = apiName?.trim();
  if (trimmed && !PLACEHOLDER_SUBJECT_NAME.test(trimmed)) {
    return trimmed;
  }
  return getSubjectName(id, locale);
}

export function enrichSubjectsWithLocalizedNames(
  subjects: Subject[],
  locale: string,
): Subject[] {
  return subjects.map((subject) => ({
    ...subject,
    name: resolveSubjectDisplayName(subject.id, subject.name, locale),
  }));
}
