import { formatDate } from "@/utills/helpers/formatDate";

/** `YYYY-MM-DD` + n days (UTC calendar, same as the study day). */
export function addPlanDays(day: string, days: number): string {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Midday local time, so no timezone shifts the calendar day. */
function planDayDate(day: string): Date {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}

/** "ხუთ, 5 ნოე" / "Thu, 5 Nov" / "чт, 5 нояб." (dayjs locales). */
export function formatPlanDayShort(day: string, locale: string): string {
  const format = locale === "ru" ? "dd, D MMM" : "ddd, D MMM";
  return formatDate(planDayDate(day), locale, format);
}

/** "5 ნოემბერი" / "5 November" / "5 ноября". */
export function formatPlanDayLong(day: string, locale: string): string {
  return formatDate(planDayDate(day), locale, "D MMMM");
}

/** Whole days from one `YYYY-MM-DD` to another (negative when `to` is earlier). */
export function daysBetween(from: string, to: string): number {
  return Math.round(
    (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) /
      86_400_000,
  );
}
