/** Header styles — one look on every page (tokens live in globals.css). */
export const headerNavLink =
  "shrink-0 rounded-xs px-1.5 py-1.5 text-2xs font-medium text-fg-muted transition-colors hover:bg-fg/5 hover:text-fg sm:px-2 sm:text-xs md:px-3 md:py-2 md:text-sm lg:px-2 xl:px-3";

export const headerNavLinkActive = "bg-fg/5 text-fg";

export const headerAuthLink =
  "shrink-0 rounded-xs px-2 py-1.5 text-xs font-medium text-fg-muted transition-colors hover:bg-fg/5 hover:text-fg sm:px-3 sm:py-2 sm:text-sm lg:px-2 xl:px-3";

export const headerStreak =
  "inline-flex shrink-0 items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-semibold tabular-nums text-fg transition-colors hover:bg-fg/5 sm:text-sm";

export const headerAuthLogin =
  "hidden h-10 shrink-0 items-center justify-center rounded-full bg-accent px-4 text-xs font-semibold text-on-accent transition hover:bg-accent-strong sm:text-sm lg:inline-flex";

/** Shared accent pill (e.g. SubjectPicker start exam) */
export const examCtaPillBase =
  "rounded-full bg-accent font-semibold text-on-accent transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50";

/** Outlined secondary pill; add the size (h-*, px-*) at the call site. */
export const outlinePillBase =
  "inline-flex items-center justify-center rounded-full border border-line text-sm font-semibold text-fg transition-colors hover:bg-fg/5";

export const headerMenuPanel =
  "rounded-control border border-line bg-surface text-fg shadow-overlay";

export const headerMenuItem = "transition-colors hover:bg-surface-sunken hover:text-fg";

export const burgerDrawer = "border-b border-line bg-canvas shadow-overlay";

export const burgerNavItem =
  "flex min-h-11 w-full items-center rounded-control px-3 py-2 text-base font-medium leading-snug text-fg transition-colors hover:bg-fg/5 active:bg-fg/5";

/** Current page in the phone menu. */
export const burgerNavItemActive = "bg-fg/5 text-accent!";

/** "More" pages in the phone menu: same 44 px target, quieter text. */
export const burgerSubItem =
  "flex min-h-11 w-full items-center rounded-control px-3 py-2 text-sm font-medium leading-snug text-fg-muted transition-colors hover:bg-fg/5 hover:text-fg active:bg-fg/5";

export const burgerDivider = "mt-3 border-t border-line pt-3";

export const burgerAccountLink =
  "inline-flex min-h-11 items-center rounded-control px-3 text-base font-medium text-fg-muted transition-colors hover:bg-fg/5 hover:text-fg";

export const burgerOverlay = "bg-fg/25";
