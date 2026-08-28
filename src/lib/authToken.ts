const STORAGE_KEY = "access_token";
/** Google sign-in returns an httpOnly cookie we cannot read, so track it separately. */
const SESSION_KEY = "auth_session";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function setAccessToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, token);
  localStorage.setItem(SESSION_KEY, "1");
}

export function clearAccessToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SESSION_KEY);
}

/** Remember that `/auth/me` succeeded, so cookie sessions survive a reload. */
export function markSession(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, "1");
}

/** True for both Bearer (email/password) and cookie (Google) sessions. */
export function hasSession(): boolean {
  if (typeof window === "undefined") return false;
  return (
    localStorage.getItem(STORAGE_KEY) != null ||
    localStorage.getItem(SESSION_KEY) === "1"
  );
}

/**
 * Legacy Google callback handed the token back in the query string. The API now
 * sets a cookie instead; kept so a stale backend deploy still signs users in.
 */
export function captureAccessTokenFromUrl(): boolean {
  if (typeof window === "undefined") return false;

  const url = new URL(window.location.href);
  const token = url.searchParams.get("access_token");
  if (!token) return false;

  setAccessToken(token);
  url.searchParams.delete("access_token");
  const search = url.searchParams.toString();
  const next = `${url.pathname}${search ? `?${search}` : ""}${url.hash}`;
  window.history.replaceState({}, "", next);
  return true;
}
