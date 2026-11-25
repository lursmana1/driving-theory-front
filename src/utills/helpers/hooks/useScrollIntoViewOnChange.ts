"use client";

import { useEffect, useRef } from "react";

/**
 * Step-by-step screens (plan lessons, plan rounds): when `key` changes (the
 * next card / ticket), bring the element's top back into view if the page is
 * still scrolled down from the previous item, so the new sign or picture is
 * on screen. Nothing happens on the first render or when the top is already
 * visible. The offset below the sticky header comes from the element's
 * `scroll-mt-*` class.
 */
export function useScrollIntoViewOnChange<T extends HTMLElement>(key: unknown) {
  const ref = useRef<T>(null);
  const firstKey = useRef(key);

  useEffect(() => {
    const el = ref.current;
    if (!el || Object.is(key, firstKey.current)) return;
    firstKey.current = key;
    const { top } = el.getBoundingClientRect();
    const offset = Number.parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
    if (top >= offset && top < window.innerHeight) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    el.scrollIntoView({
      block: "start",
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [key]);

  return ref;
}
