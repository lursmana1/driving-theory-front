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
export function headerExamCtaClass(isLanding: boolean): string {
  const base =
    "hidden h-10 items-center justify-center rounded-full bg-linear-to-r from-sky-500 to-violet-600 px-4 text-sm font-semibold text-white transition hover:brightness-110 md:inline-flex";
  return isLanding ? `${base} shadow-lg shadow-sky-500/20` : `${base} shadow-md`;
}
