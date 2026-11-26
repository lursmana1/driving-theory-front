/**
 * Light / dark theme. The choice lives in `<html data-theme>` (set before
 * paint by `THEME_INIT_SCRIPT`) and, once the user picks one, in
 * localStorage. Without a saved choice the page follows the system setting,
 * also when it changes while the page is open.
 */

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "prava.theme";

const DARK_QUERY = "(prefers-color-scheme: dark)";

/**
 * Inline in <head>, runs before the first paint so a dark page never
 * flashes white. Same rule as `systemOrSavedTheme`, kept tiny on purpose.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark")t=matchMedia("${DARK_QUERY}").matches?"dark":"light";document.documentElement.dataset.theme=t}catch(e){}})()`;

function savedTheme(): Theme | null {
  try {
    const t = localStorage.getItem(THEME_STORAGE_KEY);
    return t === "light" || t === "dark" ? t : null;
  } catch {
    return null;
  }
}

function systemOrSavedTheme(): Theme {
  return (
    savedTheme() ?? (window.matchMedia(DARK_QUERY).matches ? "dark" : "light")
  );
}

/**
 * Puts the theme back on <html> when it's missing: React re-creates <html>
 * when it renders a page on the client (e.g. not-found), dropping the
 * attribute the head script set. Called once when the app mounts.
 */
export function ensureTheme() {
  if (!document.documentElement.dataset.theme) {
    document.documentElement.dataset.theme = systemOrSavedTheme();
  }
}

/** The theme on the page now. */
export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

/** The user picks a theme: applied now and remembered. */
export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Private mode: the choice lasts for this page only.
  }
}

/**
 * Calls `onChange` whenever the page's theme changes (a toggle, another tab,
 * or the system setting while nothing is saved). For useSyncExternalStore.
 */
export function subscribeTheme(onChange: () => void): () => void {
  const html = document.documentElement;
  const observer = new MutationObserver(onChange);
  observer.observe(html, { attributes: true, attributeFilter: ["data-theme"] });

  const media = window.matchMedia(DARK_QUERY);
  const onSystem = () => {
    if (!savedTheme()) html.dataset.theme = systemOrSavedTheme();
  };
  const onStorage = (e: StorageEvent) => {
    if (e.key === THEME_STORAGE_KEY) html.dataset.theme = systemOrSavedTheme();
  };
  media.addEventListener("change", onSystem);
  window.addEventListener("storage", onStorage);
  return () => {
    observer.disconnect();
    media.removeEventListener("change", onSystem);
    window.removeEventListener("storage", onStorage);
  };
}
