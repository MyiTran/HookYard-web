import ChevronRightIcon from "../icons/ChevronRightIcon";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalCount?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (pageSize: number) => void;
  disabled?: boolean;
};

type PageItem = number | "ellipsis";

const NAV_BUTTON_CLASS =
  "flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#C9DACE] text-[#405348] transition hover:bg-[#F1F6F2] disabled:cursor-not-allowed disabled:opacity-40";

const PAGE_BUTTON_CLASS = "h-9 min-w-9 cursor-pointer rounded-lg px-3 text-sm font-semibold transition";

function buildPageItems(current: number, total: number): PageItem[] {
  const candidates = new Set<number>([1, total, current - 1, current, current + 1]);

  if (current <= 3) [2, 3, 4].forEach((page) => candidates.add(page));
  if (current >= total - 2) [total - 3, total - 2, total - 1].forEach((page) => candidates.add(page));

  const pages = [...candidates].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);

  const items: PageItem[] = [];
  let previous = 0;

  pages.forEach((page) => {
    if (page - previous > 1) items.push("ellipsis");
    items.push(page);
    previous = page;
  });

  return items;
}

function formatSummary(page: number, pageSize: number, totalCount: number): string {
  const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);

  return `Showing ${from}–${to} of ${totalCount}`;
}

function Pagination({
  page,
  totalPages,
  onPageChange,
  totalCount,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  disabled = false,
}: PaginationProps) {
  const pageCount = Math.max(1, totalPages);

  const summary =
    typeof totalCount === "number" && typeof pageSize === "number"
      ? formatSummary(page, pageSize, totalCount)
      : null;

  function goTo(next: number) {
    if (disabled || next === page || next < 1 || next > pageCount) return;
    onPageChange(next);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3">
        {summary ? <p className="text-xs font-medium text-[#8A9990]">{summary}</p> : <span />}

        {pageSizeOptions && typeof pageSize === "number" && onPageSizeChange && (
          <label className="flex items-center gap-2 text-xs font-medium text-[#8A9990]">
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              disabled={disabled}
              aria-label="Rows per page"
              className="h-8 cursor-pointer rounded-lg border border-[#C9DACE] bg-white px-2 text-xs font-semibold text-[#405348] outline-none transition focus:border-[#23613F] focus:ring-2 focus:ring-[#23613F]/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option} / page
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <nav aria-label="Pagination" className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Previous page"
          onClick={() => goTo(page - 1)}
          disabled={disabled || page <= 1}
          className={NAV_BUTTON_CLASS}
        >
          <ChevronRightIcon className="h-4 w-4 rotate-180" />
        </button>

        <span className="hidden items-center gap-1 sm:flex">
          {buildPageItems(page, pageCount).map((item, index) =>
            item === "ellipsis" ? (
              <span key={`ellipsis-${index}`} className="flex h-9 w-9 items-center justify-center text-sm text-[#8A9990]">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                aria-current={item === page ? "page" : undefined}
                onClick={() => goTo(item)}
                disabled={disabled}
                className={`${PAGE_BUTTON_CLASS} ${
                  item === page
                    ? "bg-[#214E35] text-white"
                    : "border border-[#C9DACE] text-[#405348] hover:bg-[#F1F6F2]"
                }`}
              >
                {item}
              </button>
            ),
          )}
        </span>

        <span className="px-2 text-xs font-medium text-[#8A9990] sm:hidden">
          Page {page} of {pageCount}
        </span>

        <button
          type="button"
          aria-label="Next page"
          onClick={() => goTo(page + 1)}
          disabled={disabled || page >= pageCount}
          className={NAV_BUTTON_CLASS}
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
}

export default Pagination;
