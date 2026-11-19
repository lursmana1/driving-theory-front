/**
 * Anonymous study-plan events for Umami (loaded in production only, see
 * `app/layout.tsx`). No user id, no question ids: counts and funnels only,
 * for guests and signed-in users alike. Never throws.
 */
type UmamiData = Record<string, string | number | boolean>;

declare global {
  interface Window {
    umami?: { track: (event: string, data?: UmamiData) => void };
  }
}

export type PlanEvent =
  | "plan_start"
  | "plan_reset"
  | "plan_step_done"
  | "plan_day_test"
  | "plan_day_done"
  | "plan_guest_moved"
  | "plan_progress_recovered";

export function trackPlanEvent(event: PlanEvent, data?: UmamiData) {
  try {
    window.umami?.track(event, data);
  } catch {
    // Analytics must never break the plan.
  }
}
