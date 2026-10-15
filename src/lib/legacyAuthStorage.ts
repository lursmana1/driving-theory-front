/** Keys older builds used for the JWT and a "signed in" flag. Auth is cookie-only now. */
const LEGACY_KEYS = ["access_token", "auth_session"];

/** One-time cleanup so users who signed in before the cookie switch lose the stored copy. */
export function purgeLegacyAuthStorage(): void {
  if (typeof window === "undefined") return;
  for (const storage of [localStorage, sessionStorage]) {
    for (const key of LEGACY_KEYS) {
      try {
        storage.removeItem(key);
      } catch {
        // storage blocked (private mode / disabled site data)
      }
    }
  }
}
