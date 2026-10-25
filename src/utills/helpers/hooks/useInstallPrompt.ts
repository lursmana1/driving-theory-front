import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

/** Chrome's install event (not in the TS DOM lib). */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  const ua = navigator.userAgent;
  // iPadOS reports itself as a Mac
  return /iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
}

const noSubscribe = () => () => undefined;

/**
 * "Install the app": Android/desktop Chrome get the native prompt,
 * iOS Safari has none, so it only gets `showIosHint` (Share → Add to Home Screen).
 */
export function useInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  // read once on the client; the server render has no install UI
  const showIosHint = useSyncExternalStore(
    noSubscribe,
    () => isIos() && !isStandalone(),
    () => false,
  );

  useEffect(() => {
    if (isStandalone()) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setPromptEvent(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    await promptEvent.userChoice.catch(() => undefined);
    // the event can only be used once
    setPromptEvent(null);
  }, [promptEvent]);

  return { canInstall: promptEvent !== null, install, showIosHint };
}
