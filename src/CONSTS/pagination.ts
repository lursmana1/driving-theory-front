/** Default items per page */
export const DEFAULT_PAGE_SIZE = 10;

/** Items per page for tickets (same as default) */
export const TICKETS_PAGE_SIZE = DEFAULT_PAGE_SIZE;

/** Items per page for profile exam history */
export const EXAM_HISTORY_PAGE_SIZE = DEFAULT_PAGE_SIZE;

/** Items per page for blogs */
export const BLOGS_PAGE_SIZE = 9;

/** URL search param key for page number */
export const PAGE_PARAM = "page";

/** Show all page numbers when total pages <= this */
export const VISIBLE_PAGES_THRESHOLD = 7;

/** Pages shown at start when current is near beginning */
export const START_EDGE_COUNT = 5;

/** Pages shown at end when current is near end */
export const END_EDGE_OFFSET = 3;

/** Pages on each side of current in middle */
export const PAGES_AROUND_CURRENT = 1;

/** Pagination button styles (shared) */
export const PAGINATION_STYLES = {
  navButton:
    "inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-50",
  pageButtonBase:
    "h-9 min-w-9 rounded-lg px-2 text-sm font-medium transition cursor-pointer",
  pageButtonActive: "bg-slate-900 text-white",
  pageButtonInactive:
    "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900",
} as const;
