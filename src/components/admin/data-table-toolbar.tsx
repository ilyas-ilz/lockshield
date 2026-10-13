"use client";

import * as React from "react";
import { ArrowDownWideNarrow, ChevronDown, Download, Filter, RefreshCw, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { humanize } from "./data-table-cells";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];

const toolButton = "h-11 rounded-xl px-3.5 text-sm font-medium sm:h-10 [&_svg]:size-4";

export function DataTableToolbar({
  label,
  searchable,
  searchDraft,
  onSearchDraft,
  hasStatusFilter,
  statusFilter,
  onStatusFilter,
  sortable,
  sort,
  order,
  onSort,
  onRefresh,
  refreshing,
  onExport,
  exporting,
}: {
  label: string;
  searchable: boolean;
  searchDraft: string;
  onSearchDraft: (value: string) => void;
  hasStatusFilter: boolean;
  statusFilter: string;
  onStatusFilter: (value: string) => void;
  sortable: readonly string[];
  sort: string;
  order: "asc" | "desc";
  onSort: (field: string, order: "asc" | "desc") => void;
  onRefresh: () => void;
  refreshing: boolean;
  onExport: () => void;
  exporting: boolean;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  // "/" jumps to search from anywhere on the page, unless already typing.
  React.useEffect(() => {
    if (!searchable) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName))) return;
      e.preventDefault();
      inputRef.current?.focus();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchable]);

  const filterActive = hasStatusFilter && statusFilter !== "all";
  const sortField = sort || "createdAt";

  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center lg:flex-nowrap">
      {searchable && (
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <input
            ref={inputRef}
            value={searchDraft}
            onChange={(e) => onSearchDraft(e.target.value)}
            placeholder={`Search ${label.toLowerCase()}`}
            aria-label={`Search ${label}`}
            aria-keyshortcuts="/"
            className="h-11 w-full rounded-xl border border-app bg-surface pl-10 pr-12 text-sm text-app placeholder:text-muted transition-colors focus:border-[var(--color-brand-500)] focus:outline-none focus:ring-3 focus:ring-[var(--color-brand-500)]/15 sm:h-10"
          />
          {searchDraft ? (
            <button
              type="button"
              onClick={() => onSearchDraft("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-app"
            >
              <X className="size-4" aria-hidden />
            </button>
          ) : (
            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-app bg-surface-2 px-1.5 py-0.5 font-mono text-[11px] leading-none text-muted sm:block">
              /
            </kbd>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2.5 sm:flex sm:items-center">
        {hasStatusFilter && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                className={cn(
                  toolButton,
                  filterActive &&
                    "border-[var(--color-brand-500)]/40 bg-[var(--color-brand-50)] text-[var(--color-brand-700)] dark:bg-[var(--color-brand-500)]/12 dark:text-[var(--color-brand-300)]"
                )}
              >
                <Filter aria-hidden />
                {filterActive ? STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label : "Filter"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={statusFilter} onValueChange={onStatusFilter}>
                {STATUS_OPTIONS.map((o) => (
                  <DropdownMenuRadioItem key={o.value} value={o.value}>
                    {o.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {sortable.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className={toolButton}>
                <ArrowDownWideNarrow aria-hidden />
                <span className="truncate">{sort ? humanize(sort) : "Sort by"}</span>
                <ChevronDown className="text-muted" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={sortField} onValueChange={(f) => onSort(f, order)}>
                {sortable.map((field) => (
                  <DropdownMenuRadioItem key={field} value={field}>
                    {humanize(field)}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Order</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={order} onValueChange={(o) => onSort(sortField, o as "asc" | "desc")}>
                <DropdownMenuRadioItem value="asc">Ascending</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="desc">Descending</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <Button
          variant="secondary"
          size="icon"
          onClick={onRefresh}
          disabled={refreshing}
          aria-label="Refresh"
          title="Refresh"
          className="size-11 rounded-xl sm:size-10"
        >
          <RefreshCw className={cn(refreshing && "animate-spin")} aria-hidden />
        </Button>

        <Button variant="secondary" onClick={onExport} loading={exporting} className={toolButton}>
          {!exporting && <Download aria-hidden />}
          Export
        </Button>
      </div>
    </div>
  );
}
