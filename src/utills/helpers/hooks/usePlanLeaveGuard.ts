"use client";

import { useEffect, useRef } from "react";

/** Marks the extra history entry that catches Back while the guard is on. */
const GUARD_KEY = "__planLeaveGuard";

function onGuardEntry(): boolean {
  return !!(window.history.state as Record<string, unknown> | null)?.[
    GUARD_KEY
  ];
}

function pushGuard() {
  window.history.pushState({ [GUARD_KEY]: true }, "", window.location.href);
}

/**
 * While `enabled` (a running timed test), Back and a reload/close ask first.
 *
 * Back: an extra history entry with the same URL sits on top. Back lands on
 * the step's own entry (same URL, so Next's router changes nothing and the
 * test stays mounted); the guard entry is pushed again and `onBlocked` shows
 * the in-page confirm. Reload / tab close: the browser's "leave site?" prompt.
 * When the guard turns off without leaving (test finished), the extra entry
 * is dropped so one Back still closes the step.
 */
export function usePlanLeaveGuard(enabled: boolean, onBlocked: () => void) {
  const blockedRef = useRef(onBlocked);
  const leaving = useRef(false);
  useEffect(() => {
    blockedRef.current = onBlocked;
  }, [onBlocked]);

  useEffect(() => {
    if (!enabled) return;
    leaving.current = false;
    if (!onGuardEntry()) pushGuard();
    const onPop = () => {
      if (leaving.current || onGuardEntry()) return;
      pushGuard();
      blockedRef.current();
    };
    const onUnload = (event: BeforeUnloadEvent) => {
      if (leaving.current) return;
      event.preventDefault();
      // Older Safari / Chrome need a returnValue to show the prompt.
      event.returnValue = "";
    };
    window.addEventListener("popstate", onPop);
    window.addEventListener("beforeunload", onUnload);
    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("beforeunload", onUnload);
      if (!leaving.current && onGuardEntry()) window.history.back();
    };
  }, [enabled]);

  return {
    /** Leave on purpose: drop the guard entry first, then run `then`. */
    leave(then: () => void) {
      leaving.current = true;
      if (!onGuardEntry()) {
        then();
        return;
      }
      const after = () => {
        window.removeEventListener("popstate", after);
        then();
      };
      window.addEventListener("popstate", after);
      window.history.back();
    },
  };
}
