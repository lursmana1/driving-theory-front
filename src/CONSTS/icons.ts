/** Public paths for UI icons under `public/svg/icons/`. */
export const ICONS = {
  google: "/svg/icons/google.svg",
  chevronDown: "/svg/icons/chevron-down.svg",
  chevronLeft: "/svg/icons/chevron-left.svg",
  chevronRight: "/svg/icons/chevron-right.svg",
  check: "/svg/icons/check.svg",
  speaker: "/svg/icons/speaker.svg",
  stop: "/svg/icons/stop.svg",
  close: "/svg/icons/close.svg",
  calendar: "/svg/icons/calendar.svg",
  clock: "/svg/icons/clock.svg",
  question: "/svg/icons/question.svg",
  xCircle: "/svg/icons/x-circle.svg",
  sparkle: "/svg/icons/sparkle.svg",
} as const;

export type IconName = keyof typeof ICONS;
