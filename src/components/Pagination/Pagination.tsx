"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  PAGE_PARAM,
  DEFAULT_PAGE_SIZE,
  PAGINATION_STYLES,
  EXAM_HISTORY_PAGINATION_COL_SPAN,
} from "@/CONSTS/pagination";
import { getPageNumbers } from "@/utills/helpers/pagination";
import { Icon } from "@/components/Icon/Icon";

type PaginationProps = {
  page: number;
  total: number;
  pathname: string;
  pageSize?: number;
  /** Current query (without relying on useSearchParams, so links SSR for crawlers). */
  params?: Record<string, string | undefined>;
  /** Participates in parent grid — range in col 1, controls span cols 2–4 */
  layout?: "default" | "table";
};

function hrefFor(
  pathname: string,
  params: Record<string, string | undefined>,
  nextPage: number,
): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key === PAGE_PARAM || value == null || value === "") continue;
    sp.set(key, value);
  }
  if (nextPage > 1) sp.set(PAGE_PARAM, String(nextPage));
  const query = sp.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export default function Pagination({
  page,
  total,
  pathname,
  pageSize = DEFAULT_PAGE_SIZE,
  params = {},
  layout = "default",
}: PaginationProps) {
  const t = useTranslations("Profile");

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, total);

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  if (total <= pageSize) return null;

  const rangeLabel = (
    <p className="text-sm text-slate-500">
      {t("paginationRange", { start, end, total })}
    </p>
  );

  const navClass = PAGINATION_STYLES.navButton;
  const disabledNavClass = `${navClass} pointer-events-none opacity-50`;

  const controls = (
    <div className="flex items-center justify-center gap-1 sm:justify-end">
      {currentPage <= 1 ? (
        <span
          aria-disabled="true"
          aria-label="Previous page"
          className={disabledNavClass}
        >
          <Icon name="chevronLeft" className="h-4 w-4" />
        </span>
      ) : (
        <Link
          href={hrefFor(pathname, params, currentPage - 1)}
          aria-label="Previous page"
          className={navClass}
        >
          <Icon name="chevronLeft" className="h-4 w-4" />
        </Link>
      )}

      <div className="flex items-center gap-0.5">
        {pageNumbers.map((p, i) =>
          p === "ellipsis" ? (
            <span key={`ellipsis-${i}`} className="px-2 text-slate-400">
              …
            </span>
          ) : (
            <Link
              key={p}
              href={hrefFor(pathname, params, p)}
              aria-current={p === currentPage ? "page" : undefined}
              className={`${PAGINATION_STYLES.pageButtonBase} inline-flex items-center justify-center ${
                p === currentPage
                  ? PAGINATION_STYLES.pageButtonActive
                  : PAGINATION_STYLES.pageButtonInactive
              }`}
            >
              {p}
            </Link>
          ),
        )}
      </div>

      {currentPage >= totalPages ? (
        <span
          aria-disabled="true"
          aria-label="Next page"
          className={disabledNavClass}
        >
          <Icon name="chevronRight" className="h-4 w-4" />
        </span>
      ) : (
        <Link
          href={hrefFor(pathname, params, currentPage + 1)}
          aria-label="Next page"
          className={navClass}
        >
          <Icon name="chevronRight" className="h-4 w-4" />
        </Link>
      )}
    </div>
  );

  if (layout === "table") {
    return (
      <nav className="contents" aria-label="Pagination">
        {rangeLabel}
        <div
          className={`${EXAM_HISTORY_PAGINATION_COL_SPAN} flex items-center justify-end`}
        >
          {controls}
        </div>
      </nav>
    );
  }

  return (
    <nav
      className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4"
      aria-label="Pagination"
    >
      <div className="text-center sm:text-left">{rangeLabel}</div>
      {controls}
    </nav>
  );
}
