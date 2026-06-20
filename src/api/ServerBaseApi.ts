import axios, { type AxiosInstance } from "axios";
import { cookies } from "next/headers";
import { getLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";

/** Server-side API. Forwards request cookies and Accept-Language to backend. Use in Server Components only. */
export async function getServerBaseApi(): Promise<AxiosInstance> {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!baseUrl) throw new Error("NEXT_PUBLIC_BACKEND_URL is not set");

  const [cookieStore, locale] = await Promise.all([cookies(), getLocale()]);
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const acceptLanguage = routing.locales.includes(locale as "ka" | "en" | "ru")
    ? locale
    : routing.defaultLocale;

  const instance = axios.create({
    baseURL: baseUrl,
    // Avoid long hangs when backend is unreachable.
    timeout: 8000,
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": acceptLanguage,
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
  });

  instance.interceptors.request.use((config) => {
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  });

  return instance;
}
