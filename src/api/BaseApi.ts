import axios from "axios";
import { routing } from "@/i18n/routing";
import { getAccessToken, clearAccessToken } from "@/lib/authToken";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";

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
  // Bearer from localStorage (response.tokens.access_token) — no cross-origin cookies.
  withCredentials: false,
});

instance.interceptors.request.use((config) => {
  config.headers["Accept-Language"] = getClientLocale();
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
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
        url.includes("/auth/me");
      if (!isAuthRoute && getAccessToken()) {
        clearAccessToken();
        const locale = getClientLocale();
        window.location.href = `/${locale}/auth`;
      }
    }
    return Promise.reject(error);
  },
);

/** Update Accept-Language for all future requests (e.g. when user switches locale). */
export function setApiLocale(locale: string) {
  instance.defaults.headers["Accept-Language"] =
    routing.locales.includes(locale as "ka" | "en" | "ru")
      ? locale
      : routing.defaultLocale;
}

export default instance;
