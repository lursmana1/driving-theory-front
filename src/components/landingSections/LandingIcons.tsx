/** Small stroke pictograms for the landing page. They inherit `currentColor`. */
import type { ReactNode } from "react";

export type LandingIconName =
  | "check"
  | "arrow"
  | "calendar"
  | "ticket"
  | "timer"
  | "repeat"
  | "sign"
  | "gauge"
  | "lock"
  | "sparkle";

const PATHS: Record<LandingIconName, ReactNode> = {
  check: <path d="M5 12.5l4.2 4.2L19 7" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4M8 14h2M12 14h2M8 17h2" />
    </>
  ),
  ticket: (
    <>
      <rect x="3.5" y="4" width="17" height="16" rx="2.5" />
      <path d="M7.5 9h9M7.5 13h6" />
      <circle cx="16" cy="16" r="1.4" />
    </>
  ),
  timer: (
    <>
      <circle cx="12" cy="13.5" r="7" />
      <path d="M12 10v3.8l2.5 1.6M9.5 3h5" />
    </>
  ),
  repeat: (
    <>
      <path d="M17 3.5l3 3-3 3" />
      <path d="M20 6.5H9a5 5 0 00-5 5" />
      <path d="M7 20.5l-3-3 3-3" />
      <path d="M4 17.5h11a5 5 0 005-5" />
    </>
  ),
  sign: (
    <>
      <path d="M12 3.5l8.5 15h-17z" />
      <path d="M12 10v4M12 16.6v.2" />
    </>
  ),
  gauge: (
    <>
      <path d="M4 16a8 8 0 1116 0" />
      <path d="M12 16l4-5" />
      <circle cx="12" cy="16" r="1.3" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2.2" />
      <path d="M8.5 10.5V8a3.5 3.5 0 017 0v2.5" />
    </>
  ),
  sparkle: (
    <path d="M12 3.5l1.8 5.2 5.2 1.8-5.2 1.8L12 17.5l-1.8-5.2L5 10.5l5.2-1.8zM18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />
  ),
};

export function LandingIcon({
  name,
  className = "h-5 w-5",
}: {
  name: LandingIconName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={24}
      height={24}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {PATHS[name]}
    </svg>
  );
}
