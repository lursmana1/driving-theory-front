"use client";

import Image from "next/image";
import { useState } from "react";
import type { ViewerRoute } from "./types";

/** The map fits the screen height (desktop) and keeps its aspect ratio. */
const MAP_MAX_H = "max(20rem, 100vh - 12rem)";

type Props = { route: ViewerRoute; priority: boolean; loading: string };

/** Aspect-ratio box (no layout shift) with a placeholder until the map image has loaded. */
export default function MapFrame({ route, priority, loading }: Props) {
  const [loaded, setLoaded] = useState(false);
  const ratio = route.width / route.height;
  return (
    <span
      className="relative mx-auto block overflow-hidden bg-surface-muted"
      style={{
        aspectRatio: `${route.width} / ${route.height}`,
        width: `min(100%, calc((${MAP_MAX_H}) * ${ratio.toFixed(4)}))`,
      }}
    >
      {loaded ? null : (
        <span className="absolute inset-0 flex animate-pulse items-center justify-center text-sm text-fg-subtle">
          {loading}
        </span>
      )}
      <Image
        src={route.image}
        width={route.width}
        height={route.height}
        alt={route.alt}
        sizes="(min-width: 1024px) 900px, 100vw"
        priority={priority}
        onLoad={() => setLoaded(true)}
        className={`absolute inset-0 h-full w-full bg-plate transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </span>
  );
}
