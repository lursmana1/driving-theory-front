"use client";

import { useEffect, useState } from "react";
import { navButtonClass } from "./classes";
import type { ViewerLabels, ViewerRoute, ZoomMode } from "./types";

type Props = {
  route: ViewerRoute;
  mode: ZoomMode;
  canSwitch: boolean;
  labels: Pick<ViewerLabels, "prev" | "next" | "realSize" | "fitScreen" | "openFile" | "close" | "loading">;
  onMode: (mode: ZoomMode) => void;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

/**
 * Full-screen map: fit to the screen or real size (panning). Esc closes, ←/→ switch routes,
 * the page behind does not scroll. Loaded on demand (next/dynamic) the first time it opens.
 */
export default function RouteZoomDialog({ route, mode, canSwitch, labels, onMode, onClose, onPrev, onNext }: Props) {
  const [loadedNo, setLoadedNo] = useState<number | null>(null);
  const toggle = () => onMode(mode === "fit" ? "real" : "fit");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") onNext();
      else if (e.key === "ArrowLeft") onPrev();
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, onNext, onPrev]);

  return (
    <div role="dialog" aria-modal="true" aria-label={route.title} className="fixed inset-0 z-50 flex flex-col bg-canvas">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2">
        <p className="font-georgian font-bold text-fg">
          {route.title} <span className="text-sm font-normal text-fg-muted">{route.categories}</span>
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {canSwitch ? (
            <>
              <button type="button" onClick={onPrev} className={navButtonClass} aria-label={labels.prev}>
                ←
              </button>
              <button type="button" onClick={onNext} className={navButtonClass} aria-label={labels.next}>
                →
              </button>
            </>
          ) : null}
          <button type="button" onClick={toggle} className={navButtonClass}>
            {mode === "fit" ? labels.realSize : labels.fitScreen}
          </button>
          <a href={route.image} target="_blank" rel="noopener" className={`${navButtonClass} hidden sm:inline-flex`}>
            {labels.openFile}
          </a>
          <button
            type="button"
            onClick={onClose}
            className="rounded-control bg-accent px-3 py-1.5 text-sm font-semibold text-on-accent"
            autoFocus
          >
            ✕ {labels.close}
          </button>
        </div>
      </div>
      <div className="relative min-h-0 flex-1 overflow-auto bg-surface-sunken">
        <span className="absolute inset-0 flex animate-pulse items-center justify-center text-sm text-fg-subtle">
          {labels.loading}
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element -- plain img: real-size panning needs the file's own pixels */}
        <img
          key={route.no}
          src={route.image}
          alt={route.alt}
          width={route.width}
          height={route.height}
          onLoad={() => setLoadedNo(route.no)}
          onClick={toggle}
          className={`relative transition-opacity duration-300 ${loadedNo === route.no ? "opacity-100" : "opacity-0"} ${
            mode === "fit" ? "mx-auto h-full w-full cursor-zoom-in object-contain" : "h-auto max-w-none cursor-zoom-out bg-plate"
          }`}
        />
      </div>
    </div>
  );
}
