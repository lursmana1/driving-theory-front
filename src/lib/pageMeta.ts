import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";

export type MetaPage =
  | "home"
  | "tickets"
  | "subjectpicker"
  | "exam"
  | "profile"
  | "blogs"
  | "auth"
  | "createBlog";

const PAGE_PATH: Record<MetaPage, string> = {
  home: "/",
  tickets: "/tickets",
  subjectpicker: "/subjectpicker",
  exam: "/exam",
  profile: "/profile",
  blogs: "/blogs",
  auth: "/auth",
  createBlog: "/createblog",
};

const NOINDEX: ReadonlySet<MetaPage> = new Set([
  "exam",
  "profile",
  "auth",
  "createBlog",
]);

type PageMetaOptions = {
  locale?: string;
  path?: string;
  category?: string;
  index?: boolean;
};

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

  const category = options.category?.trim();
  const title =
    page === "tickets" && category
      ? t("ticketsTitleCategory", { category })
      : t(`${page}Title`);
  const description =
    page === "tickets" && category
      ? t("ticketsDescriptionCategory", { category })
      : t(`${page}Description`);

  return buildMetadata({
    title,
    description,
    path: options.path ?? PAGE_PATH[page],
    locale: options.locale,
    titleAbsolute: page === "home",
    index: options.index ?? !NOINDEX.has(page),
  });
}
