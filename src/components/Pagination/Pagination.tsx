"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  DEFAULT_PAGE_SIZE,
  VISIBLE_PAGES_THRESHOLD,
  PAGINATION_STYLES,
  EXAM_HISTORY_PAGINATION_COL_SPAN,
} from "@/CONSTS/pagination";
import { getPageNumbers, pageHref } from "@/utills/helpers/pagination";
import { PageJump } from "./PageJump";
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
  /** A "go to page" box when there are many pages (the links stay for crawlers). */
  jump?: boolean;
  /** Element id the new page opens scrolled to (e.g. the list, not the page top). */
  hash?: string;
};

export default function Pagination({
  page,
  total,
  pathname,
  pageSize = DEFAULT_PAGE_SIZE,
  params = {},
  layout = "default",
  jump = false,
  hash,
}: PaginationProps) {
  const t = useTranslations("Profile");

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, total);

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  if (total <= pageSize) return null;

  const rangeLabel = (
    <p className="text-sm text-fg-subtle">
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
          href={pageHref(pathname, params, currentPage - 1, hash)}
          aria-label="Previous page"
          className={navClass}
        >
          <Icon name="chevronLeft" className="h-4 w-4" />
        </Link>
      )}

      <div className="flex items-center gap-0.5">
        {pageNumbers.map((p, i) =>
          p === "ellipsis" ? (
            <span key={`ellipsis-${i}`} className="px-2 text-fg-faint">
              …
            </span>
          ) : (
            <Link
              key={p}
              href={pageHref(pathname, params, p, hash)}
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
          href={pageHref(pathname, params, currentPage + 1, hash)}
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
      <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-end">
        {controls}
        {jump && totalPages > VISIBLE_PAGES_THRESHOLD && (
          <PageJump
            totalPages={totalPages}
            hrefOf={(p) => pageHref(pathname, params, p, hash)}
          />
        )}
      </div>
    </nav>
  );
}
