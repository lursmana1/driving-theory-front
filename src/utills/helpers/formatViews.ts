/**
 * Values for the `Blogs.views` message. `compact` gives 1.2K / 1,2 тыс. for cards;
 * full gives 1,234 for the post page.
 */
export function viewsMessageValues(
  n: number,
  locale: string,
  compact = false,
): { views: string; count: number } {
  const useCompact = compact && n >= 1000;
  return {
    views: new Intl.NumberFormat(locale, {
      notation: useCompact ? "compact" : "standard",
      maximumFractionDigits: 1,
    }).format(n),
    // "1,2 тыс." takes the plural for a round thousand (просмотров), not for 1234.
    count: useCompact ? 1000 : n,
  };
}
