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
  | "cityExam"
  | "auth"
  | "logout"
  | "createBlog";

const PAGE_PATH: Record<MetaPage, string> = {
  home: "/",
  tickets: "/tickets",
  subjectpicker: "/subjectpicker",
  exam: "/exam",
  profile: "/profile",
  blogs: "/blogs",
  cityExam: "/city-exam",
  auth: "/auth",
  logout: "/auth/logout",
  createBlog: "/createblog",
};

const NOINDEX: ReadonlySet<MetaPage> = new Set([
  "exam",
  "profile",
  "auth",
  "logout",
  "createBlog",
]);

type PageMetaOptions = {
  locale?: string;
  path?: string;
  category?: string;
  subject?: string;
  page?: number;
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
  const subject = options.subject?.trim();
  const listingPage =
    options.page != null && Number.isFinite(options.page) && options.page > 1
      ? Math.floor(options.page)
      : 1;
  const baseTitle =
    page === "tickets" && category && subject
      ? t("ticketsTitleCategorySubject", { category, subject })
      : page === "tickets" && category
        ? t("ticketsTitleCategory", { category })
        : t(`${page}Title`);
  const title =
    page === "tickets" && listingPage > 1
      ? t("ticketsTitlePage", { title: baseTitle, page: listingPage })
      : baseTitle;
  const description =
    page === "tickets" && category && subject
      ? t("ticketsDescriptionCategorySubject", { category, subject })
      : page === "tickets" && category
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
