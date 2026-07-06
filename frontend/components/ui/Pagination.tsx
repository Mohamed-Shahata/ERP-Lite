"use client";

import { useTranslations } from "@/lib/i18n/use-translations";

const DOTS = "..." as const;

export interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  siblingCount?: number;
  showSummary?: boolean;
  itemLabel?: string;
  className?: string;
}

function range(start: number, end: number) {
  const length = end - start + 1;
  return Array.from({ length }, (_, i) => start + i);
}

function buildPageList(
  currentPage: number,
  totalPages: number,
  siblingCount: number,
): (number | typeof DOTS)[] {
  const totalSlots = siblingCount * 2 + 5;

  if (totalPages <= totalSlots) {
    return range(1, totalPages);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const showLeftDots = leftSiblingIndex > 2;
  const showRightDots = rightSiblingIndex < totalPages - 1;

  if (!showLeftDots && showRightDots) {
    const leftItemCount = 3 + siblingCount * 2;
    return [...range(1, leftItemCount), DOTS, totalPages];
  }

  if (showLeftDots && !showRightDots) {
    const rightItemCount = 3 + siblingCount * 2;
    return [1, DOTS, ...range(totalPages - rightItemCount + 1, totalPages)];
  }

  return [
    1,
    DOTS,
    ...range(leftSiblingIndex, rightSiblingIndex),
    DOTS,
    totalPages,
  ];
}

export function Pagination({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  siblingCount = 1,
  showSummary = true,
  itemLabel,
  className = "",
}: PaginationProps) {
  const { t } = useTranslations();
  const resolvedItemLabel = itemLabel ?? t("pagination.items");

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);

  const pages = buildPageList(safePage, totalPages, siblingCount);

  const startItem = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, totalItems);

  function goTo(page: number) {
    const clamped = Math.min(Math.max(page, 1), totalPages);
    if (clamped !== safePage) {
      onPageChange(clamped);
    }
  }

  if (totalItems === 0) {
    return null;
  }

  return (
    <div
      className={`flex flex-col gap-3 border-t border-slate-200 dark:border-slate-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      {showSummary && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t("pagination.showing")}{" "}
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {startItem}
          </span>
          {"–"}
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {endItem}
          </span>{" "}
          {t("pagination.of")}{" "}
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {totalItems}
          </span>{" "}
          {resolvedItemLabel}
        </p>
      )}

      <div className="flex items-center gap-3">
        {onPageSizeChange && (
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            {t("pagination.rowsPerPage")}
            <select
              className="h-9 rounded-md border border-slate-300 dark:border-slate-700 px-2 text-sm focus:border-slate-500 dark:focus:border-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:focus:ring-slate-600"
              onChange={(event) => {
                onPageSizeChange(Number(event.target.value));
                onPageChange(1);
              }}
              value={pageSize}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        )}

        <nav className="flex items-center gap-1" aria-label="Pagination">
          <button
            aria-label={t("pagination.previous")}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={safePage === 1}
            onClick={() => goTo(safePage - 1)}
            type="button"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 12L6 8L10 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {pages.map((page, index) =>
            page === DOTS ? (
              <span
                key={`dots-${index}`}
                className="flex h-9 w-9 items-center justify-center text-sm text-slate-400 dark:text-slate-500"
              >
                {DOTS}
              </span>
            ) : (
              <button
                key={page}
                aria-current={page === safePage ? "page" : undefined}
                className={`flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium ${
                  page === safePage
                    ? "border-slate-950 dark:border-emerald-600 bg-slate-950 dark:bg-emerald-600 text-white"
                    : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                onClick={() => goTo(page)}
                type="button"
              >
                {page}
              </button>
            ),
          )}

          <button
            aria-label={t("pagination.next")}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={safePage === totalPages}
            onClick={() => goTo(safePage + 1)}
            type="button"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 4L10 8L6 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  );
}

export function paginate<T>(
  items: T[],
  currentPage: number,
  pageSize: number,
): T[] {
  const start = (currentPage - 1) * pageSize;
  return items.slice(start, start + pageSize);
}
