const STATS_REFRESH_EVENT = "prava:stats-refresh";

export function markStatsStale(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem("prava:stats-stale", String(Date.now()));
  window.dispatchEvent(new Event(STATS_REFRESH_EVENT));
}

export function subscribeStatsRefresh(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(STATS_REFRESH_EVENT, listener);
  return () => window.removeEventListener(STATS_REFRESH_EVENT, listener);
}
