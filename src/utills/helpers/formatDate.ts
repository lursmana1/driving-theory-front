import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/ka";
import "dayjs/locale/ru";
import "dayjs/locale/en";

dayjs.extend(utc);

const supportedLocales = ["ka", "en", "ru"] as const;
type SupportedLocale = (typeof supportedLocales)[number];

const DATE_TIME_FORMATS: Record<SupportedLocale, string> = {
  ka: "D MMM YYYY, HH:mm",
  ru: "D MMM YYYY, HH:mm",
  en: "D MMM YYYY, h:mm a",
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

/** Parse API UTC (`...Z`) and convert to the viewer's local timezone. */
function parseLocalDate(date: Date | string): dayjs.Dayjs | null {
  const parsed = dayjs.utc(date instanceof Date ? date.toISOString() : date);
  if (!parsed.isValid()) return null;
  return parsed.local();
}

/**
 * Format date with locale. Uses dayjs when a custom format is passed;
 * otherwise locale-aware date + time.
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

/** Locale-aware date + time in the user's timezone. */
export function formatDateTime(date: Date | string, locale: string = "ka"): string {
  const localeKey = resolveLocale(locale);
  const d = parseLocalDate(date);
  if (!d) return "—";
  return d.locale(localeKey).format(DATE_TIME_FORMATS[localeKey]);
}

/** Exam history uses createdAt, shown in local time. */
export function formatAttemptDateTime(
  attempt: { createdAt: string; completedAt?: string | null },
  locale: string = "ka",
): string {
  return formatDateTime(attempt.createdAt, locale);
}
