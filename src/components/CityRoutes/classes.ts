/*
 * City-routes class recipes. Design tokens only (globals.css); no raw palette, hex or arbitrary sizes.
 */

/** Route / category chip; the selected one is filled with the accent. */
export const chipClass = (selected: boolean) =>
  `rounded-control border text-sm font-semibold transition-colors ${
    selected ? "border-accent bg-accent text-on-accent" : "border-line bg-surface text-fg hover:border-accent"
  }`;

export const navButtonClass =
  "inline-flex items-center gap-1 rounded-control border border-line bg-surface px-3 py-1.5 text-sm font-semibold text-fg hover:border-accent";

/** Small uppercase label above a control in the desktop side panel. */
export const panelLabelClass = "hidden text-xs font-semibold uppercase text-fg-subtle lg:block";

/** Fixed-height box: antd's styles load lazily, and the unstyled Select is taller (CLS). */
export const selectBoxClass = "h-10 overflow-hidden";

export const infoCardClass = "rounded-card border border-line bg-surface p-5";

export const cityLinkClass =
  "inline-block rounded-control border border-line bg-surface-muted px-3 py-1.5 text-sm font-semibold text-fg hover:border-accent";

export const badgeClass = "rounded-xs bg-warning-soft px-2 py-0.5 text-xs font-semibold text-fg";
