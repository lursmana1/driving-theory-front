import type { ReactNode } from "react";

type LandingEyebrowProps = {
  children: ReactNode;
  /** e.g. text-sky-600 (light bg) or text-sky-400 (dark bg) */
  tone?: "light" | "dark";
};

const toneClass = {
  light: "text-sky-600",
  dark: "text-sky-400",
} as const;

export function LandingEyebrow({ children, tone = "light" }: LandingEyebrowProps) {
  return (
    <p
      className={`text-center text-sm font-semibold uppercase tracking-widest ${toneClass[tone]}`}
    >
      {children}
    </p>
  );
}
