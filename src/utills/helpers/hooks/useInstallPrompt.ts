import { useCallback, useSyncExternalStore } from "react";

/** Chrome's install event (not in the TS DOM lib). */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/**
 * Which written guide to show when there is no native install prompt:
 * - `ios-safari` — Share → Add to Home Screen
 * - `ios-browser` — same, but other iOS browsers (Chrome, Firefox, Edge) keep Share next to the address bar
 * - `in-app` — TikTok / Instagram / Facebook… browsers can't install, open the page in a real browser first
 */
export type InstallGuide = "ios-safari" | "ios-browser" | "in-app";

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function getGuide(): InstallGuide | null {
  if (isStandalone()) return null;
  const ua = navigator.userAgent;
  if (/Instagram|FBAN|FBAV|FB_IAB|musical_ly|BytedanceWebview|TikTok|Snapchat|LinkedInApp|\bLine\//i.test(ua)) {
    return "in-app";
  }
  // iPadOS reports itself as a Mac
  const ios = /iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
  if (!ios) return null;
  return /CriOS|FxiOS|EdgiOS/i.test(ua) ? "ios-browser" : "ios-safari";
}

// Chrome can fire `beforeinstallprompt` before React hydrates, so it's caught
// at module load (with this chunk) instead of in an effect.
let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    emit();
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    emit();
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const noSubscribe = () => () => undefined;

/**
 * "Install the app": Android/desktop Chrome get the native prompt,
 * iOS and in-app browsers have none, so they get a written `guide` instead.
 */
export function useInstallPrompt() {
  const promptEvent = useSyncExternalStore(subscribe, () => deferredPrompt, () => null);
  // read once on the client; the server render has no install UI
  const guide = useSyncExternalStore(noSubscribe, getGuide, () => null);

  const install = useCallback(async () => {
    const event = deferredPrompt;
    if (!event) return;
    // the event can only be used once
    deferredPrompt = null;
    emit();
    await event.prompt();
    await event.userChoice.catch(() => undefined);
  }, []);

  return { canInstall: promptEvent !== null, install, guide };
}
