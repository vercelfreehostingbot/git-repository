import { ChevronDown } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  showLabel: string;
  entriesLabel: string;
  limitOptions?: number[];
  windowSize?: number;
  locale?: string;
}

function getPageWindow(current: number, total: number, windowSize: number): number[] {
  if (total <= windowSize) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  let start = Math.max(1, current - Math.floor(windowSize / 2));
  let end = start + windowSize - 1;
  if (end > total) {
    end = total;
    start = end - windowSize + 1;
  }
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function Pagination({
  page,
  totalPages,
  limit,
  onPageChange,
  onLimitChange,
  showLabel,
  entriesLabel,
  limitOptions = [10, 25, 50],
  windowSize = 5,
  locale = "en-GB",
}: PaginationProps) {
  const safeTotalPages = Math.max(totalPages, 1);
  const pageNumbers = getPageWindow(page, safeTotalPages, windowSize);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-surface-border px-[22px] py-4">
      <div className="flex items-center gap-2 text-[13px] text-text-secondary">
        {showLabel}
        <div className="relative">
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="cursor-pointer appearance-none rounded-md border border-surface-border py-[5px] pl-2 pr-6 text-[13px] text-text-secondary outline-none transition hover:bg-header-row-bg"
          >
            {limitOptions.map((n) => (
              <option key={n} value={n}>
                {n.toLocaleString(locale)}
              </option>
            ))}
          </select>
          <ChevronDown
            size={12}
            strokeWidth={2}
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary"
          />
        </div>
        {entriesLabel}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-[7px] border border-surface-border bg-surface text-text-secondary transition hover:bg-hover-bg disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-surface"
        >
          ‹
        </button>

        {pageNumbers.map((n) => (
          <button
            key={n}
            onClick={() => onPageChange(n)}
            className={`flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-[7px] border text-[13px] font-bold transition ${
              n === page
                ? "border-primary bg-primary text-white hover:bg-primary-hover"
                : "border-surface-border bg-surface text-text-secondary hover:bg-hover-bg"
            }`}
          >
            {n.toLocaleString(locale)}
          </button>
        ))}

        <button
          onClick={() => onPageChange(Math.min(safeTotalPages, page + 1))}
          disabled={page >= safeTotalPages}
          className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-[7px] border border-surface-border bg-surface text-text-secondary transition hover:bg-hover-bg disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-surface"
        >
          ›
        </button>
      </div>
    </div>
  );
}