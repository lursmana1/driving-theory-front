import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";

export type MetaPage =
  | "home"
  | "tickets"
  | "subjectpicker"
  | "exam"
  | "profile"
  | "blogs"
  | "auth"
  | "createBlog";

type PageMetaOptions = {
  locale?: string;
  titleSuffix?: string;
};

/** Primitive title + description only. */
export async function pageMeta(
  page: MetaPage,
  options: PageMetaOptions = {},
): Promise<Metadata> {
  if (options.locale && hasLocale(routing.locales, options.locale)) {
    setRequestLocale(options.locale);
  }

  const t = options.locale
    ? await getTranslations({ locale: options.locale, namespace: "Meta" })
    : await getTranslations("Meta");

  const baseTitle = t(`${page}Title`);
  const title = options.titleSuffix
    ? `${baseTitle} · ${options.titleSuffix}`
    : baseTitle;
  const description = t(`${page}Description`);

  if (page === "home") {
    return { title: { absolute: title }, description };
  }

  return { title, description };
}
