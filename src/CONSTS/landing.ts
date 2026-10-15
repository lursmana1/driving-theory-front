import type { CSSProperties } from "react";
import type { FeatureTone } from "@/types/landingData";

/* Colors come from the design tokens in globals.css (raw hex mirror: src/styles/tokens.ts). */

/** Faint vertical pinstripe overlay for large paper panels */
export const LANDING_PIN_STRIPE_STYLE: CSSProperties = {
  opacity: 0.5,
  backgroundImage:
    "repeating-linear-gradient(90deg, transparent 0, transparent 22px, color-mix(in srgb, var(--color-fg) 3%, transparent) 22px, color-mix(in srgb, var(--color-fg) 3%, transparent) 23px)",
};

export const LANDING = {
  /** <main> wrapper */
  page: "landing-paper min-h-screen font-georgian text-fg antialiased",
  heroBg: "relative font-georgian",
  ctaSection: "relative border-t border-line py-16 md:py-24",
  ctaGlow: "hidden",
  gradientCta:
    "inline-flex items-center justify-center gap-2 rounded-control bg-accent px-8 font-semibold text-on-accent transition hover:bg-accent-strong",
  heroPrimaryCta:
    "inline-flex h-13 items-center justify-center gap-3 rounded-control bg-accent px-7 text-base font-bold text-on-accent transition hover:bg-accent-strong",
  heroSecondaryCta:
    "inline-flex h-13 items-center justify-center rounded-control border border-fg/25 px-7 text-base font-semibold text-fg transition hover:border-fg/45 hover:bg-fg/5",
  howSection: "relative border-t border-line px-4 py-16 md:px-6 md:py-24",
  footerLogoMark:
    "flex h-10 w-10 items-center justify-center rounded-full border border-fg text-sm font-bold text-fg",

  /** h2 — section titles */
  headingSection:
    "font-georgian text-balance font-bold tracking-tight text-fg text-3xl md:text-4xl lg:text-heading",
  /** kept for API compatibility — landing is all one paper tone now */
  headingSectionDark:
    "font-georgian text-balance font-bold tracking-tight text-fg text-3xl md:text-4xl lg:text-heading",
  /** h1 — hero */
  headingHero:
    "font-georgian font-extrabold tracking-display text-fg text-display-sm sm:text-5xl lg:text-display",
  headingCard: "font-georgian font-semibold text-fg text-lg md:text-xl",
  headingCardDark:
    "font-georgian font-semibold leading-snug text-fg text-lg md:text-xl",
  headingPanelTitle:
    "font-georgian text-balance font-bold tracking-tight text-fg text-title sm:text-3xl md:text-4xl",
  headingFooter: "font-georgian font-semibold text-fg text-base",

  /** shared bits */
  eyebrow:
    "text-2xs font-semibold uppercase tracking-eyebrow text-secondary/70",
  body: "text-body leading-7 text-fg-muted",
  hairline: "border-line",
} as const;

const FEATURE_BADGE: Record<FeatureTone, string> = {
  blue: "bg-secondary text-on-accent",
  violet: "bg-secondary text-on-accent",
  emerald: "bg-secondary text-on-accent",
  amber: "bg-accent text-on-accent",
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
