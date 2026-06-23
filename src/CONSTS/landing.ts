import type { CSSProperties } from "react";
import type { FeatureTone } from "@/types/landingData";

/** Vertical pinstripe overlay for dark hero / panels */
export const LANDING_PIN_STRIPE_STYLE: CSSProperties = {
  opacity: 0.35,
  backgroundImage:
    "repeating-linear-gradient(90deg, transparent 0, transparent 12px, rgba(148,163,184,0.06) 12px, rgba(148,163,184,0.06) 13px)",
};

export const LANDING = {
  heroBg: "relative overflow-hidden border-b border-white/5 bg-[#060b14] pb-16 pt-8 font-georgian md:pb-24 md:pt-12",
  ctaSection:
    "relative overflow-hidden border-b border-white/5 bg-[#060b14] py-20 md:py-28",
  ctaGlow:
    "pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/20 blur-[100px]",
  gradientCta:
    "inline-flex items-center justify-center rounded-full bg-linear-to-r from-sky-500 to-violet-600 font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:brightness-110",
  heroPrimaryCta:
    "inline-flex h-12 w-full sm:w-auto sm:min-w-[200px] items-center justify-center rounded-full bg-linear-to-r from-sky-500 to-violet-600 px-8 font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:brightness-110",
  heroSecondaryCta:
    "inline-flex h-12 w-full sm:w-auto sm:min-w-[200px] items-center justify-center rounded-full border border-white/25 bg-white/5 px-8 font-semibold text-white backdrop-blur-sm transition hover:border-white/40 hover:bg-white/10",
  statTile:
    "rounded-2xl border border-white/10 bg-white/4 px-5 py-4 text-center backdrop-blur-sm",
  howSection:
    "relative overflow-hidden border-b border-white/5 bg-[#0a1120] px-4 py-16 md:px-6 md:py-24",
  footerLogoMark:
    "flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-sky-500 to-violet-600 text-sm font-bold text-white",

  /** h2 — section titles on light backgrounds (use inside `.section`) */
  headingSection:
    "font-georgian text-balance font-bold tracking-tight text-slate-900 text-3xl md:text-4xl lg:text-[2.75rem] lg:leading-[1.12]",
  /** h2 — section titles on dark backgrounds */
  headingSectionDark:
    "font-georgian text-balance font-bold tracking-tight text-white text-3xl md:text-4xl lg:text-[2.75rem] lg:leading-[1.12]",
  /** h1 — hero */
  headingHero:
    "font-georgian text-balance font-bold leading-tight tracking-tight text-white text-4xl md:text-5xl lg:text-6xl",
  /** h3 — feature cards, etc. (light) */
  headingCard:
    "font-georgian font-semibold text-slate-900 text-lg md:text-xl",
  /** h3 — steps / dark panels */
  headingCardDark:
    "font-georgian font-semibold leading-snug text-white text-lg md:text-xl",
  /** h3 — leaderboard card title (large, reference-style) */
  headingPanelTitle:
    "font-georgian text-balance font-bold tracking-tight text-white text-[1.75rem] leading-[1.15] sm:text-3xl md:text-4xl lg:text-[2.5rem] lg:leading-[1.1]",
  /** Footer column headings */
  headingFooter:
    "font-georgian font-semibold text-slate-900 text-base",
} as const;

const FEATURE_GRADIENT: Record<FeatureTone, string> = {
  blue: "from-sky-500 to-blue-600 shadow-sky-500/30",
  violet: "from-violet-500 to-purple-600 shadow-violet-500/30",
  emerald: "from-emerald-500 to-teal-600 shadow-emerald-500/30",
  amber: "from-amber-500 to-orange-500 shadow-amber-500/30",
};

const FEATURE_ICON: Record<FeatureTone, string> = {
  blue: "🧠",
  violet: "📊",
  emerald: "📋",
  amber: "🏆",
};

export function featureIconClass(tone: string): string {
  const g = FEATURE_GRADIENT[tone as FeatureTone] ?? FEATURE_GRADIENT.blue;
  return `mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br text-xl text-white shadow-lg ${g}`;
}

export function featureEmoji(tone: string): string {
  return FEATURE_ICON[tone as FeatureTone] ?? "✨";
}
