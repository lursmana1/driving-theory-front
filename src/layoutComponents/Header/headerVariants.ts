export type HeaderVariant = "default" | "landing";

export const headerNavLink: Record<HeaderVariant, string> = {
  default:
    "shrink-0 rounded-md px-1.5 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 sm:px-2 sm:text-xs md:px-3 md:py-2 md:text-sm",
  landing:
    "shrink-0 rounded-md px-1.5 py-1.5 text-[11px] font-medium text-white/80 hover:bg-white/10 hover:text-white sm:px-2 sm:text-xs md:px-3 md:py-2 md:text-sm",
};

export const headerAuthLink: Record<HeaderVariant, string> = {
  default:
    "shrink-0 rounded-md px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 sm:px-3 sm:py-2 sm:text-sm",
  landing:
    "shrink-0 rounded-md px-2 py-1.5 text-xs font-medium text-white/85 hover:bg-white/10 hover:text-white sm:px-3 sm:py-2 sm:text-sm",
};

/** Desktop “Start exam” pill — shared shadow differs slightly on landing */
export const examCtaPillBase =
  "rounded-full bg-linear-to-r from-sky-500 to-violet-600 font-semibold text-white shadow-md shadow-sky-500/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50";

export function headerExamCtaClass(isLanding: boolean): string {
  const base = `hidden h-10 items-center justify-center px-4 text-sm md:inline-flex ${examCtaPillBase}`;
  return isLanding ? `${base} shadow-lg shadow-sky-500/20` : base;
}

export const burgerDrawer: Record<HeaderVariant, string> = {
  default:
    "border-b border-slate-200 bg-white shadow-xl shadow-slate-900/10",
  landing:
    "border-b border-white/10 bg-[#0d1117] shadow-xl shadow-black/40",
};

export const burgerNavItem: Record<HeaderVariant, string> = {
  default:
    "flex min-h-12 w-full items-center rounded-lg px-0 py-3 text-base font-medium leading-snug text-slate-800 transition-colors hover:bg-slate-100 active:bg-slate-200",
  landing:
    "flex min-h-12 w-full items-center rounded-lg px-0 py-3 text-base font-medium leading-snug text-white/95 transition-colors hover:bg-white/10 active:bg-white/15",
};

export const burgerDivider: Record<HeaderVariant, string> = {
  default: "mt-6 border-t border-slate-200 pt-6",
  landing: "mt-6 border-t border-white/10 pt-6",
};

export const burgerAccountLink: Record<HeaderVariant, string> = {
  default:
    "inline-flex min-h-10 items-center text-base font-medium text-slate-700 hover:text-slate-900",
  landing:
    "inline-flex min-h-10 items-center text-base font-medium text-white/95 hover:text-white",
};

export const burgerOverlay: Record<HeaderVariant, string> = {
  default: "bg-slate-900/40",
  landing: "bg-black/55",
};

