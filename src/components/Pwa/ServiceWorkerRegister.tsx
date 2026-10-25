"use client";

import { useEffect } from "react";

/** Registers `public/sw.js` in production (installable app + offline fallback). */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => undefined);
  }, []);

  return null;
}
