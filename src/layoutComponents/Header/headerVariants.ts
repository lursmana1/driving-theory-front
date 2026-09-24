export type HeaderVariant = "default" | "landing";

export const headerNavLink: Record<HeaderVariant, string> = {
  default:
    "shrink-0 rounded-md px-1.5 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 sm:px-2 sm:text-xs md:px-3 md:py-2 md:text-sm",
  landing:
    "shrink-0 rounded-md px-1.5 py-1.5 text-[11px] font-medium text-ink/75 hover:bg-ink/5 hover:text-accent sm:px-2 sm:text-xs md:px-3 md:py-2 md:text-sm",
};

export const headerAuthLink: Record<HeaderVariant, string> = {
  default:
    "shrink-0 rounded-md px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 sm:px-3 sm:py-2 sm:text-sm",
  landing:
    "shrink-0 rounded-md px-2 py-1.5 text-xs font-medium text-ink/80 hover:bg-ink/5 hover:text-accent sm:px-3 sm:py-2 sm:text-sm",
};

export const headerAuthLogin: Record<HeaderVariant, string> = {
  default:
    "hidden h-10 shrink-0 items-center justify-center rounded-full border border-accent px-4 text-xs font-semibold text-accent transition hover:bg-accent/10 sm:text-sm lg:inline-flex",
  landing:
    "hidden h-10 shrink-0 items-center justify-center rounded-full bg-accent px-4 text-xs font-semibold text-white transition hover:bg-accent-strong sm:text-sm lg:inline-flex",
};

/** Shared accent pill (e.g. SubjectPicker start exam) */
export const examCtaPillBase =
  "rounded-full bg-accent font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50";

export const burgerDrawer: Record<HeaderVariant, string> = {
  default: "border-b border-slate-200 bg-white shadow-xl shadow-slate-900/10",
  landing: "border-b border-hairline bg-paper shadow-xl shadow-ink/10",
};

export const burgerNavItem: Record<HeaderVariant, string> = {
  default:
    "flex min-h-12 w-full items-center rounded-lg px-0 py-3 text-base font-medium leading-snug text-slate-800 transition-colors hover:bg-slate-100 active:bg-slate-200",
  landing:
    "flex min-h-12 w-full items-center rounded-lg px-0 py-3 text-base font-medium leading-snug text-ink transition-colors hover:bg-ink/5 active:bg-ink/10",
};

export const burgerDivider: Record<HeaderVariant, string> = {
  default: "mt-6 border-t border-slate-200 pt-6",
  landing: "mt-6 border-t border-hairline pt-6",
};

export const burgerAccountLink: Record<HeaderVariant, string> = {
  default:
    "inline-flex min-h-10 items-center text-base font-medium text-slate-700 hover:text-slate-900",
  landing:
    "inline-flex min-h-10 items-center text-base font-medium text-ink/85 hover:text-accent",
};

export const burgerOverlay: Record<HeaderVariant, string> = {
  default: "bg-slate-900/40",
  landing: "bg-ink/25",
};
