"use client";

import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
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
  /** Participates in parent grid — range in col 1, controls span cols 2–4 */
  layout?: "default" | "table";
};

export default function Pagination({
  page,
  total,
  pathname,
  pageSize = DEFAULT_PAGE_SIZE,
  layout = "default",
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("Profile");

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, total);

  const goTo = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    const sp = new URLSearchParams(searchParams.toString());
    sp.set(PAGE_PARAM, String(nextPage));
    router.push(`${pathname}?${sp.toString()}`);
  };

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  if (total <= pageSize) return null;

  const rangeLabel = (
    <p className="text-sm text-slate-500">
      {t("paginationRange", { start, end, total })}
    </p>
  );

  const controls = (
    <div className="flex items-center justify-center gap-1 sm:justify-end">
      <button
        type="button"
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Previous page"
        className={PAGINATION_STYLES.navButton}
      >
        <Icon name="chevronLeft" className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-0.5">
        {pageNumbers.map((p, i) =>
          p === "ellipsis" ? (
            <span key={`ellipsis-${i}`} className="px-2 text-slate-400">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => goTo(p)}
              aria-current={p === currentPage ? "page" : undefined}
              className={`${PAGINATION_STYLES.pageButtonBase} ${
                p === currentPage
                  ? PAGINATION_STYLES.pageButtonActive
                  : PAGINATION_STYLES.pageButtonInactive
              }`}
            >
              {p}
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
        className={PAGINATION_STYLES.navButton}
      >
        <Icon name="chevronRight" className="h-4 w-4" />
      </button>
    </div>
  );

  if (layout === "table") {
    return (
      <nav className="contents" aria-label="Pagination">
        {rangeLabel}
        <div className={`${EXAM_HISTORY_PAGINATION_COL_SPAN} flex items-center justify-end`}>{controls}</div>
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
