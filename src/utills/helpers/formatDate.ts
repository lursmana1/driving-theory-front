import dayjs from "dayjs";
import "dayjs/locale/ka";
import "dayjs/locale/ru";
import "dayjs/locale/en";

const supportedLocales = ["ka", "en", "ru"] as const;
type SupportedLocale = (typeof supportedLocales)[number];

const INTL_LOCALES: Record<SupportedLocale, string> = {
  ka: "ka-GE",
  en: "en-GB",
  ru: "ru-RU",
};

function resolveLocale(locale: string): SupportedLocale {
  return supportedLocales.includes(locale as SupportedLocale)
    ? (locale as SupportedLocale)
    : "ka";
}

function toDate(date: Date | string): Date | null {
  const d = date instanceof Date ? date : new Date(date);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Format date with locale. Uses dayjs when a custom format is passed;
 * otherwise Intl for locale-aware date + time.
 */
export function formatDate(
  date: Date | string,
  locale: string = "ka",
  format?: string,
): string {
  const localeKey = resolveLocale(locale);
  const d = toDate(date);
  if (!d) return "—";

  if (!format) {
    return formatDateTime(date, locale);
  }

  return dayjs(d).locale(localeKey).format(format);
}

/** Locale-aware date + time for exam history, profile, etc. */
export function formatDateTime(date: Date | string, locale: string = "ka"): string {
  const d = toDate(date);
  if (!d) return "—";

  const localeKey = resolveLocale(locale);

  return new Intl.DateTimeFormat(INTL_LOCALES[localeKey], {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: localeKey === "en",
  }).format(d);
}

/** Prefer completion time for finished exams; fall back to createdAt. */
export function formatAttemptDateTime(
  attempt: { createdAt: string; completedAt?: string | null },
  locale: string = "ka",
): string {
  return formatDateTime(attempt.completedAt ?? attempt.createdAt, locale);
}
