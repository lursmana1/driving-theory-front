import axios from "axios";
import { routing } from "@/i18n/routing";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";

/** Returns true when a signed-in user was just signed out by the 401. */
type UnauthorizedHandler = () => boolean;

let unauthorizedHandler: UnauthorizedHandler | null = null;

/** Lets `UserProvider` drop its user when the API rejects the session cookie. */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler;
}

function getClientLocale(): string {
  if (typeof window === "undefined") return routing.defaultLocale;
  const segment = window.location.pathname.split("/")[1] ?? "";
  return routing.locales.includes(segment as "ka" | "en" | "ru")
    ? segment
    : routing.defaultLocale;
}

const instance = axios.create({
  baseURL: getApiBaseUrl(),
  // Prevent server/client components from hanging indefinitely when backend is down.
  timeout: 8000,
  headers: {
    "Content-Type": "application/json",
    "Accept-Language": "ka",
  },
  // Auth is the httpOnly `access_token` cookie set by the API; JS never sees the token.
  withCredentials: true,
});

instance.interceptors.request.use((config) => {
  config.headers["Accept-Language"] = getClientLocale();
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      typeof window !== "undefined"
    ) {
      const url = error.config?.url ?? "";
      const isAuthRoute =
        url.includes("/auth/login") ||
        url.includes("/auth/register") ||
        url.includes("/auth/logout") ||
        url.includes("/auth/me");
      if (!isAuthRoute && unauthorizedHandler?.()) {
        const locale = getClientLocale();
        window.location.href = `/${locale}/auth`;
      }
    }
    return Promise.reject(error);
  },
);

export default instance;
