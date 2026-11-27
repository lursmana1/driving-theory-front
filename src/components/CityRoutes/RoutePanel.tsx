"use client";

import MapFrame from "./MapFrame";
import RouteLegend from "./RouteLegend";
import { badgeClass, navButtonClass } from "./classes";
import type { ViewerLabels, ViewerRoute } from "./types";

type Props = {
  route: ViewerRoute;
  shown: boolean;
  priority: boolean;
  /** "2 / 8"-style position; null hides prev/next */
  position: { index: number; total: number } | null;
  labels: Pick<
    ViewerLabels,
    "prev" | "next" | "enlarge" | "loading" | "legendRoute" | "legendDirection" | "legendStart"
  >;
  onPrev: () => void;
  onNext: () => void;
  onEnlarge: () => void;
};

/**
 * One route's tab panel. Hidden panels stay in the HTML so every map is indexed;
 * their images are lazy, so a hidden map never downloads.
 */
export default function RoutePanel({ route, shown, priority, position, labels, onPrev, onNext, onEnlarge }: Props) {
  return (
    <section
      id={`route-${route.no}`}
      role="tabpanel"
      aria-labelledby={`route-tab-${route.no}`}
      hidden={!shown}
      className="overflow-hidden rounded-card border border-line bg-surface shadow-card"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="font-georgian text-lg font-bold text-fg">{route.title}</h2>
          <span className="text-sm text-fg-muted">{route.categories}</span>
          {route.badge ? <span className={`${badgeClass} lg:hidden`}>{route.badge}</span> : null}
        </div>
        {position ? (
          <div className="flex items-center gap-2">
            <button type="button" onClick={onPrev} className={navButtonClass} aria-label={labels.prev}>
              <span aria-hidden>←</span>
              <span className="hidden sm:inline">{labels.prev}</span>
            </button>
            <span className="text-sm tabular-nums text-fg-muted">
              {position.index + 1} / {position.total}
            </span>
            <button type="button" onClick={onNext} className={navButtonClass} aria-label={labels.next}>
              <span className="hidden sm:inline">{labels.next}</span>
              <span aria-hidden>→</span>
            </button>
          </div>
        ) : null}
      </header>

      {/* The official map is white; it keeps its light tile in the dark theme too. */}
      <button
        type="button"
        onClick={onEnlarge}
        className="group relative block w-full cursor-zoom-in bg-surface-sunken"
        aria-label={`${labels.enlarge}: ${route.title}`}
      >
        <MapFrame route={route} priority={priority} loading={labels.loading} />
        <span className="absolute bottom-3 right-3 rounded-control bg-canvas/90 px-3 py-1.5 text-xs font-semibold text-fg shadow-raised backdrop-blur-sm group-hover:bg-canvas">
          ⤢ {labels.enlarge}
        </span>
      </button>

      {/* Phones: legend + source under the map (desktop has them in the side panel). */}
      <footer className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-line px-4 py-3 text-xs text-fg-muted lg:hidden">
        <RouteLegend labels={labels} layout="row" />
        <span className="text-fg-subtle">{route.source}</span>
      </footer>
    </section>
  );
}
