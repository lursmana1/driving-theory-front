import axios from "axios";
import { routing } from "@/i18n/routing";

function getClientLocale(): string {
  if (typeof window === "undefined") return routing.defaultLocale;
  const segment = window.location.pathname.split("/")[1] ?? "";
  return routing.locales.includes(segment as "ka" | "en" | "ru")
    ? segment
    : routing.defaultLocale;
}

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  // Prevent server/client components from hanging indefinitely when backend is down.
  timeout: 8000,
  headers: {
    "Content-Type": "application/json",
    "Accept-Language": "ka",
  },
  withCredentials: true,
});

instance.interceptors.request.use((config) => {
  config.headers["Accept-Language"] = getClientLocale();
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

/** Update Accept-Language for all future requests (e.g. when user switches locale). */
export function setApiLocale(locale: string) {
  instance.defaults.headers["Accept-Language"] =
    routing.locales.includes(locale as "ka" | "en" | "ru")
      ? locale
      : routing.defaultLocale;
}

export default instance;
