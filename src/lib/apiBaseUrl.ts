/** Backend base URL — supports both env var names. */
export function getApiBaseUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    "";
  return url.trim().replace(/\/$/, "");
}
