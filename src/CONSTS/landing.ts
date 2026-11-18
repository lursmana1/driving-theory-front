import { DEFAULT_CATEGORY_ID } from "@/CONSTS/categories";
import type { LandingIconName } from "@/components/landingSections/LandingIcons";

/* Colors come from the design tokens in globals.css (raw hex mirror: src/styles/tokens.ts). */

export const LANDING = {
  /** <main> wrapper */
  page: "landing-paper min-h-screen font-georgian text-fg antialiased",
  heroBg: "relative isolate overflow-hidden font-georgian",
  gradientCta:
    "inline-flex items-center justify-center gap-2 rounded-control bg-accent px-7 font-semibold text-on-accent transition hover:bg-accent-strong",
  heroPrimaryCta:
    "inline-flex h-13 items-center justify-center gap-3 whitespace-nowrap rounded-control bg-accent px-5 text-sm font-bold text-on-accent shadow-raised transition hover:bg-accent-strong sm:px-7 sm:text-base",
  heroSecondaryCta:
    "inline-flex h-13 items-center justify-center rounded-control border border-line-strong bg-surface px-7 text-base font-semibold text-fg transition hover:border-fg-faint hover:bg-surface-muted",
  footerLogoMark:
    "flex h-10 w-10 items-center justify-center rounded-full border border-fg text-sm font-bold text-fg",

  /** h2 — section titles */
  headingSection:
    "font-georgian text-balance font-bold tracking-tight text-fg text-3xl md:text-4xl lg:text-heading",
  /** h1 — hero */
  headingHero:
    "font-georgian font-extrabold tracking-display text-fg text-display-sm sm:text-5xl lg:text-display",
  headingCard: "font-georgian font-semibold text-fg text-lg md:text-xl",
  headingFooter: "font-georgian font-semibold text-fg text-base",

  /** shared bits */
  eyebrow:
    "text-2xs font-semibold uppercase tracking-eyebrow text-accent",
  body: "text-body leading-7 text-fg-muted",
} as const;

/** Category order in the landing rules table (most common first). */
export const LANDING_RULES_ORDER = [1, 2, 0, 3, 5, 4, 6, 7, 8, 9];

export type LandingFeature = {
  key: string;
  href: string;
  icon: LandingIconName;
  /** Works only when signed in */
  account?: boolean;
};

/** Feature grid tiles; copy is `Home.<key>Title` / `Home.<key>Text`. */
export const LANDING_FEATURES: LandingFeature[] = [
  { key: "featPlan", href: "/plan", icon: "calendar" },
  { key: "featTickets", href: `/tickets/${DEFAULT_CATEGORY_ID}`, icon: "ticket" },
  { key: "featExam", href: "/subjectpicker", icon: "timer" },
  { key: "featTrainer", href: "/practice", icon: "repeat", account: true },
  { key: "featSigns", href: "/signs", icon: "sign" },
  { key: "featReadiness", href: "/profile", icon: "gauge", account: true },
];

/** FAQ order; copy is `Home.<key>Q` / `Home.<key>A`. */
export const LANDING_FAQ = [
  "faqMistakes",
  "faqAccount",
  "faqPlan",
  "faqNew3",
  "faqSchool",
  "faqAfter",
  "faqNew2",
  "faqNew4",
] as const;
