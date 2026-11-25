/**
 * Study-day arithmetic on `YYYY-MM-DD` strings (UTC calendar, same as the
 * study day). No dayjs, so the header's plan reminder stays small.
 */

/** `YYYY-MM-DD` + n days. */
export function addPlanDays(day: string, days: number): string {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Whole days from one `YYYY-MM-DD` to another (negative when `to` is earlier). */
export function daysBetween(from: string, to: string): number {
  return Math.round(
    (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) /
      86_400_000,
  );
}
