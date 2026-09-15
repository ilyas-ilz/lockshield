"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const PAGE_SIZES = [10, 20, 50, 100] as const;

/**
 * Modern SSR-capable pagination component with numeric page jumps,
 * range indicators, page size selection, and responsive layouts.
 */
export function DataPagination({
  page,
  pageSize,
  total,
  totalPages,
  hasPrevPage,
  hasNextPage,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  const pages = React.useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (page <= 3) {
      return [1, 2, 3, 4, "...", totalPages];
    }
    if (page >= totalPages - 2) {
      return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  }, [page, totalPages]);

  return (
    <div className="flex flex-col gap-3 pt-3 pb-1 sm:flex-row sm:items-center sm:justify-between">
      {/* Left side: Range and page size selector */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
        <span className="tabular-nums">
          Showing <span className="font-semibold text-foreground">{from}</span>–
          <span className="font-semibold text-foreground">{to}</span> of{" "}
          <span className="font-semibold text-foreground">{total.toLocaleString()}</span> items
        </span>

        <div className="flex items-center gap-1.5 border-l border-app pl-3">
          <span>Show</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => onPageSizeChange(Number(v))}
            options={PAGE_SIZES.map((s) => ({ value: String(s), label: String(s) }))}
            className="w-[70px] h-8 text-xs"
          />
          <span>per page</span>
        </div>
      </div>

      {/* Right side: Page navigation */}
      <div className="flex items-center gap-1 self-center sm:self-auto">
        <Button
          variant="secondary"
          size="icon"
          disabled={!hasPrevPage}
          onClick={() => onPageChange(1)}
          aria-label="First page"
          className="size-8 hidden sm:inline-flex rounded-lg"
        >
          <ChevronsLeft className="size-3.5" aria-hidden />
        </Button>

        <Button
          variant="secondary"
          size="sm"
          disabled={!hasPrevPage}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
          className="h-8 px-2 text-xs rounded-lg gap-1"
        >
          <ChevronLeft className="size-3.5" aria-hidden />
          <span className="hidden sm:inline">Prev</span>
        </Button>

        {/* Numeric page buttons */}
        <div className="flex items-center gap-1 px-1">
          {pages.map((p, idx) => {
            if (p === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-1.5 text-xs text-muted select-none"
                  aria-hidden
                >
                  …
                </span>
              );
            }

            const pageNum = Number(p);
            const isActive = pageNum === page;

            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "size-8 rounded-lg text-xs font-medium transition-all select-none cursor-pointer",
                  isActive
                    ? "bg-[var(--color-brand-500)] text-white font-bold shadow-xs scale-105"
                    : "text-muted hover:text-foreground hover:bg-surface-2"
                )}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <Button
          variant="secondary"
          size="sm"
          disabled={!hasNextPage}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
          className="h-8 px-2 text-xs rounded-lg gap-1"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="size-3.5" aria-hidden />
        </Button>

        <Button
          variant="secondary"
          size="icon"
          disabled={!hasNextPage}
          onClick={() => onPageChange(totalPages)}
          aria-label="Last page"
          className="size-8 hidden sm:inline-flex rounded-lg"
        >
          <ChevronsRight className="size-3.5" aria-hidden />
        </Button>
      </div>
    </div>
  );
}

