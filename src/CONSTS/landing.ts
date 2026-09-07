import type { CSSProperties } from "react";
import type { FeatureTone } from "@/types/landingData";

/** Landing palette (sand paper / olive ink / rust) — mirrors the `@theme` tokens in globals.css */
export const LANDING_PAPER = "#F0EBDF";
export const LANDING_INK = "#22251C";
export const LANDING_OLIVE = "#59663C";
export const LANDING_LINE = "#DCD5C4";

/** Single accent for the whole product — Tailwind `accent` / `accent-strong`.
 *  Needed as raw hex for libraries that can't read theme classes (Ant Design). */
export const BRAND_ACCENT = "#B4543C";
export const BRAND_ACCENT_STRONG = "#9C4530";

/** Faint vertical pinstripe overlay for large paper panels */
export const LANDING_PIN_STRIPE_STYLE: CSSProperties = {
  opacity: 0.5,
  backgroundImage:
    "repeating-linear-gradient(90deg, transparent 0, transparent 22px, rgba(34,37,28,0.03) 22px, rgba(34,37,28,0.03) 23px)",
};

export const LANDING = {
  /** <main> wrapper */
  page: "landing-paper min-h-screen font-georgian text-ink antialiased",
  heroBg: "relative font-georgian",
  ctaSection: "relative border-t border-hairline py-16 md:py-24",
  ctaGlow: "hidden",
  gradientCta:
    "inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-8 font-semibold text-paper transition hover:bg-accent-strong",
  heroPrimaryCta:
    "inline-flex h-13 items-center justify-center gap-3 rounded-xl bg-accent px-7 text-base font-bold text-paper transition hover:bg-accent-strong",
  heroSecondaryCta:
    "inline-flex h-13 items-center justify-center rounded-xl border border-ink/25 px-7 text-base font-semibold text-ink transition hover:border-ink/45 hover:bg-ink/5",
  howSection: "relative border-t border-hairline px-4 py-16 md:px-6 md:py-24",
  footerLogoMark:
    "flex h-10 w-10 items-center justify-center rounded-full border border-ink text-sm font-bold text-ink",

  /** h2 — section titles */
  headingSection:
    "font-georgian text-balance font-bold tracking-tight text-ink text-3xl md:text-4xl lg:text-[2.6rem] lg:leading-[1.12]",
  /** kept for API compatibility — landing is all one paper tone now */
  headingSectionDark:
    "font-georgian text-balance font-bold tracking-tight text-ink text-3xl md:text-4xl lg:text-[2.6rem] lg:leading-[1.12]",
  /** h1 — hero */
  headingHero:
    "font-georgian font-extrabold leading-[1.06] tracking-[-0.03em] text-ink text-[2.35rem] sm:text-5xl lg:text-[3.4rem]",
  headingCard: "font-georgian font-semibold text-ink text-lg md:text-xl",
  headingCardDark:
    "font-georgian font-semibold leading-snug text-ink text-lg md:text-xl",
  headingPanelTitle:
    "font-georgian text-balance font-bold tracking-tight text-ink text-[1.75rem] leading-[1.15] sm:text-3xl md:text-4xl",
  headingFooter: "font-georgian font-semibold text-ink text-base",

  /** shared bits */
  eyebrow:
    "text-[11px] font-semibold uppercase tracking-[0.22em] text-olive/70",
  body: "text-[15px] leading-7 text-ink/70",
  hairline: "border-hairline",
} as const;

const FEATURE_BADGE: Record<FeatureTone, string> = {
  blue: "bg-olive text-paper",
  violet: "bg-olive text-paper",
  emerald: "bg-olive text-paper",
  amber: "bg-accent text-paper",
};

const FEATURE_NUMBER: Record<FeatureTone, string> = {
  blue: "01",
  violet: "02",
  emerald: "03",
  amber: "04",
};

export function featureIconClass(tone: string): string {
  const badge = FEATURE_BADGE[tone as FeatureTone] ?? FEATURE_BADGE.blue;
  return `mb-5 inline-flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold tabular-nums ${badge}`;
}

export function featureEmoji(tone: string): string {
  return FEATURE_NUMBER[tone as FeatureTone] ?? "01";
}
