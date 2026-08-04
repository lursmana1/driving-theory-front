"use client";

import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import {
  PAGE_PARAM,
  DEFAULT_PAGE_SIZE,
  PAGINATION_STYLES,
} from "@/CONSTS/pagination";
import { getPageNumbers } from "@/utills/helpers/pagination";

type PaginationProps = {
  page: number;
  total: number;
  pathname: string;
  pageSize?: number;
};

export default function Pagination({
  page,
  total,
  pathname,
  pageSize = DEFAULT_PAGE_SIZE,
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

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

  return (
    <nav
      className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4"
      aria-label="Pagination"
    >
      <p className="text-center text-sm text-slate-500 sm:text-left">
        <span className="font-medium text-slate-700">
          {start}–{end}
        </span>{" "}
        of <span className="font-medium text-slate-700">{total}</span>
      </p>

      <div className="flex items-center justify-center gap-1 sm:justify-end">
        <button
          type="button"
          onClick={() => goTo(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
          className={PAGINATION_STYLES.navButton}
        >
          <ChevronLeft />
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
            )
          )}
        </div>

        <button
          type="button"
          onClick={() => goTo(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
          className={PAGINATION_STYLES.navButton}
        >
          <ChevronRight />
        </button>
      </div>
    </nav>
  );
}

function ChevronLeft() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 19l-7-7 7-7"
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  );
}
