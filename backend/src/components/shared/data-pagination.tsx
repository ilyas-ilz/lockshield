"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

export const PAGE_SIZES = [10, 20, 50, 100] as const;

/**
 * The single pagination component for every listing — never a
 * page-specific copy. Reads and writes the URL through the callbacks its
 * parent wires to search params, so refresh/back/forward and a shared
 * link all reproduce the same view.
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
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-sm text-muted order-2 sm:order-1">
        <span className="whitespace-nowrap">Rows</span>
        <Select
          value={String(pageSize)}
          onValueChange={(v) => onPageSizeChange(Number(v))}
          options={PAGE_SIZES.map((s) => ({ value: String(s), label: String(s) }))}
          className="w-[84px]"
        />
        <span className="whitespace-nowrap tabular-nums">
          {total.toLocaleString()} result{total === 1 ? "" : "s"}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 order-1 sm:order-2">
        <Button variant="secondary" size="sm" disabled={!hasPrevPage} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft aria-hidden />
          Prev
        </Button>
        <span className="text-sm text-muted tabular-nums whitespace-nowrap px-1">
          Page {page} of {totalPages}
        </span>
        <Button variant="secondary" size="sm" disabled={!hasNextPage} onClick={() => onPageChange(page + 1)}>
          Next
          <ChevronRight aria-hidden />
        </Button>
      </div>
    </div>
  );
}
