import type { ReactNode } from "react";
import { Spinner } from "../common/spinner/Spinner";

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  align?: "left" | "center" | "right";
  render: (row: T, rowIndex: number) => ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  isLoading: boolean;
  isFetching?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  retryLabel?: string;
  emptyMessage: string;
  loadingRowCount?: number;
  refreshingLabel?: string;
  headerInfo?: ReactNode;
  headerActions?: ReactNode;
}

function alignClass(align: DataTableColumn<unknown>["align"]): string {
  if (align === "center") return "text-center";
  if (align === "right") return "text-right";
  return "text-left";
}

// NOTE: this component intentionally does NOT render its own outer
// rounded/bordered card. Wrap it (and, if used, <Pagination />) in a
// shared `<div className="overflow-hidden rounded-[14px] border
// border-surface-border bg-surface">` from the caller.
export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading,
  isFetching = false,
  isError = false,
  errorMessage,
  onRetry,
  retryLabel,
  emptyMessage,
  loadingRowCount = 5,
  refreshingLabel,
  headerInfo,
  headerActions,
}: DataTableProps<T>) {
  return (
    <>
      {(headerInfo || headerActions || (isFetching && !isLoading && refreshingLabel)) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-border px-[22px] py-[18px] text-[13px] text-text-secondary">
          <div className="flex flex-wrap items-center gap-3">{headerInfo}</div>

          <div className="flex flex-wrap items-center gap-3">
            {isFetching && !isLoading && refreshingLabel && (
              <span className="flex items-center gap-1.5 text-[12px]">
                <Spinner size="h-4 w-4" />
                {refreshingLabel}
              </span>
            )}
            {headerActions && <div className="flex flex-wrap gap-2.5">{headerActions}</div>}
          </div>
        </div>
      )}

      {isError ? (
        <div className="flex flex-col items-center gap-2 px-[22px] py-10 text-center">
          <p className="text-[13.5px] font-semibold text-danger-soft-text">{errorMessage}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              disabled={isFetching}
              className="cursor-pointer flex items-center gap-1.5 rounded-[9px] bg-primary px-4 py-2 text-[12.5px] font-bold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-80"
            >
              {isFetching && <Spinner size="h-3.5 w-3.5" />}
              {retryLabel}
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-header-row-bg">
                {columns.map((col, i) => (
                  <th
                    key={col.key}
                    className={`whitespace-nowrap ${i === 0 ? "px-[22px]" : "px-3"} py-3 text-[12px] font-bold uppercase tracking-wide text-text-secondary ${alignClass(col.align)}`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: loadingRowCount }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="border-t border-surface-border">
                    <td className="px-[22px] py-[13px]" colSpan={columns.length}>
                      <div className="h-[18px] w-full animate-pulse rounded bg-header-row-bg" />
                    </td>
                  </tr>
                ))}

              {!isLoading &&
                data.map((row, rowIndex) => (
                  <tr
                    key={keyExtractor(row)}
                    className="border-t border-surface-border transition-colors hover:bg-hover-bg"
                  >
                    {columns.map((col, i) => (
                      <td
                        key={col.key}
                        className={`${i === 0 ? "px-[22px]" : "px-3"} py-[13px] text-[13.5px] ${alignClass(col.align)}`}
                      >
                        {col.render(row, rowIndex)}
                      </td>
                    ))}
                  </tr>
                ))}

              {!isLoading && data.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-[22px] py-10 text-center text-[13.5px] text-text-secondary"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}