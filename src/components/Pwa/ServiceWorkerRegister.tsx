"use client";

import { useEffect } from "react";

/** Registers `public/sw.js` in production (installable app + offline fallback). */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    // after the page has loaded, so the worker doesn't compete with first paint
    const register = () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => undefined);
    };
    if (document.readyState === "complete") {
      register();
      return;
    }
    window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
