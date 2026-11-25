import { formatDate } from "@/utills/helpers/formatDate";

export { addPlanDays, daysBetween } from "@/utills/helpers/studyDays";

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
