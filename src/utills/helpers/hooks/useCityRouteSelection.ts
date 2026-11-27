"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { ViewerGroup, ViewerRoute } from "@/components/CityRoutes/types";

/**
 * Which category group and route are shown on a city-routes page.
 * `#route-N` in the URL opens that route; the hash is only read, never written (Next router).
 */
export function useCityRouteSelection(routes: ViewerRoute[], groups: ViewerGroup[]) {
  const [group, setGroup] = useState(groups[0]?.key ?? "");
  const [activeNo, setActiveNo] = useState(routes[0]?.no ?? 0);
  const tabRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  const visible = useMemo(() => routes.filter((r) => r.groups.includes(group)), [routes, group]);
  const index = Math.max(0, visible.findIndex((r) => r.no === activeNo));
  const route = visible[index] ?? routes[0];

  useEffect(() => {
    const fromHash = () => {
      const m = window.location.hash.match(/^#route-(\d+)$/);
      const target = m ? routes.find((r) => r.no === Number(m[1])) : undefined;
      if (target) {
        setGroup(target.groups[0]);
        setActiveNo(target.no);
      }
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [routes]);

  /** Switch group; keep the current route when it is in the new group too. */
  const pickGroup = useCallback(
    (key: string) => {
      setGroup(key);
      const current = routes.find((r) => r.no === activeNo);
      if (current?.groups.includes(key)) return;
      const first = routes.find((r) => r.groups.includes(key));
      if (first) setActiveNo(first.no);
    },
    [routes, activeNo],
  );

  /** Show route `i` of the visible list (wraps around). */
  const go = useCallback(
    (i: number, focus = false) => {
      if (visible.length === 0) return;
      const next = visible[(i + visible.length) % visible.length];
      setActiveNo(next.no);
      const tab = tabRefs.current.get(next.no);
      if (focus) tab?.focus();
      tab?.scrollIntoView({ block: "nearest", inline: "nearest" });
    },
    [visible],
  );

  /** Roving focus on the route tabs (WAI-ARIA tabs pattern). */
  const onTabKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") go(index + 1, true);
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") go(index - 1, true);
      else if (e.key === "Home") go(0, true);
      else if (e.key === "End") go(visible.length - 1, true);
      else return;
      e.preventDefault();
    },
    [go, index, visible.length],
  );

  const registerTab = useCallback((no: number, el: HTMLButtonElement | null) => {
    if (el) tabRefs.current.set(no, el);
    else tabRefs.current.delete(no);
  }, []);

  return { group, pickGroup, visible, index, route, go, onTabKey, registerTab };
}
