import dayjs from "dayjs";
import "dayjs/locale/ka";
import "dayjs/locale/ru";
import "dayjs/locale/en";

const supportedLocales = ["ka", "en", "ru"] as const;

const DATE_TIME_FORMATS: Record<(typeof supportedLocales)[number], string> = {
  ka: "D MMM YYYY, HH:mm",
  en: "MMM D, YYYY, h:mm A",
  ru: "D MMM YYYY, HH:mm",
};

/**
 * Format date with locale. Uses dayjs for proper month/day names per locale.
 */
export function formatDate(
  date: Date | string,
  locale: string = "ka",
  format?: string,
): string {
  const localeKey = supportedLocales.includes(locale as (typeof supportedLocales)[number])
    ? (locale as (typeof supportedLocales)[number])
    : "ka";
  return dayjs(date)
    .locale(localeKey)
    .format(format ?? DATE_TIME_FORMATS[localeKey]);
}

/** Locale-aware date + time for exam history, profile, etc. */
export function formatDateTime(date: Date | string, locale: string = "ka"): string {
  return formatDate(date, locale);
}
