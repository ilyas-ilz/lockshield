"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ArrowDown, ArrowUp, ChevronsUpDown, Plus, Search, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataPagination } from "@/components/shared/data-pagination";
import { TableSkeleton, EmptyState, ErrorState } from "@/components/shared/states";
import { api, type PageResult } from "@/lib/admin/api-client";
import { SORTABLE_FIELDS, type SortableResource } from "@/lib/sortable-fields";
import type { ResourceConfig } from "@/lib/admin/field-types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Row = Record<string, unknown>;

/**
 * The one listing component for every resource.
 *
 * URL is the source of truth (?page&pageSize&search&sort&order): refresh,
 * back/forward and sharing a link all reproduce the same view, which
 * component-local state can't do. Changing search/sort/pageSize resets to
 * page 1.
 *
 * Below md it renders a card list instead of a table — these resources
 * have long titles and 3-4 meaningful columns, which squeeze badly into a
 * horizontally scrolling table on a phone.
 */
export function DataTable({ config }: { config: ResourceConfig }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Number(searchParams.get("pageSize") ?? 20);
  const search = searchParams.get("search") ?? "";
  const sort = searchParams.get("sort") ?? "";
  const order = (searchParams.get("order") ?? "desc") as "asc" | "desc";

  const [data, setData] = React.useState<PageResult<Row> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchDraft, setSearchDraft] = React.useState(search);
  const [deleteTarget, setDeleteTarget] = React.useState<Row | null>(null);

  const sortable = (SORTABLE_FIELDS[config.key as SortableResource] ?? []) as readonly string[];

  const setParams = React.useCallback(
    (updates: Record<string, string | number | null>, { resetPage = true } = {}) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") next.delete(key);
        else next.set(key, String(value));
      }
      if (resetPage && !("page" in updates)) next.delete("page");
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize), order });
      if (search) params.set("search", search);
      if (sort) params.set("sort", sort);
      const result = await api.get<PageResult<Row>>(`${config.apiPath}?${params}`);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [config.apiPath, page, pageSize, search, sort, order]);

  React.useEffect(() => {
    void load();
  }, [load]);

  // Debounce search input -> URL, so typing doesn't fire a request per keystroke.
  React.useEffect(() => {
    if (searchDraft === search) return;
    const timer = setTimeout(() => setParams({ search: searchDraft || null }), 300);
    return () => clearTimeout(timer);
  }, [searchDraft, search, setParams]);

  React.useEffect(() => {
    setSearchDraft(search);
  }, [search]);

  function toggleSort(field: string) {
    if (sort === field) {
      setParams({ sort: field, order: order === "asc" ? "desc" : "asc" });
    } else {
      setParams({ sort: field, order: "asc" });
    }
  }

  async function handleDelete(row: Row) {
    try {
      await api.delete(`${config.apiPath}/${row._id}`);
      toast.success(`${singular(config.label)} deleted`);
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }

  const hasFilters = Boolean(search);
  const columns = config.columns;

  return (
    <div className="space-y-4">
      {/* Toolbar — renders immediately, never behind the skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {config.searchable ? (
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
            <Input
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder={`Search ${config.label.toLowerCase()}…`}
              className="pl-9 pr-9"
              aria-label={`Search ${config.label}`}
            />
            {searchDraft && (
              <button
                type="button"
                onClick={() => setSearchDraft("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted hover:bg-surface-2"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            )}
          </div>
        ) : (
          <div />
        )}

        <Button variant="primary" asChild className="w-full sm:w-auto">
          <Link href={`/admin/${config.key}/new`}>
            <Plus className="size-4" aria-hidden />
            New {singular(config.label)}
          </Link>
        </Button>
      </div>

      {/* Data region */}
      {loading ? (
        <TableSkeleton rows={Math.min(pageSize, 8)} columns={columns.length} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          title={hasFilters ? `No ${config.label.toLowerCase()} match your search` : `No ${config.label.toLowerCase()} yet`}
          description={
            hasFilters
              ? "Try a different search term, or clear the filter to see everything."
              : `Create your first ${singular(config.label).toLowerCase()} to get started.`
          }
          action={
            hasFilters ? (
              <Button variant="secondary" onClick={() => setParams({ search: null })}>
                Clear filters
              </Button>
            ) : (
              <Button variant="primary" asChild>
                <Link href={`/admin/${config.key}/new`}>
                  <Plus className="size-4" aria-hidden />
                  New {singular(config.label)}
                </Link>
              </Button>
            )
          }
        />
      ) : (
        <>
          {/* Mobile: card list */}
          <div className="space-y-2 md:hidden">
            {data.items.map((row) => (
              <Card key={String(row._id)} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{renderCell(row, columns[0]!)}</p>
                    <dl className="mt-1.5 space-y-0.5">
                      {columns.slice(1).map((col) => (
                        <div key={col.key} className="flex gap-1.5 text-xs">
                          <dt className="text-muted">{col.label}:</dt>
                          <dd className="truncate">{renderCell(row, col)}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
                <div className="mt-3 flex gap-2 border-t border-app pt-3">
                  <Button variant="secondary" size="sm" asChild className="flex-1">
                    <Link href={`/admin/${config.key}/${row._id}`}>
                      <Pencil className="size-4" aria-hidden />
                      Edit
                    </Link>
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => setDeleteTarget(row)}>
                    <Trash2 className="size-4" aria-hidden />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Desktop: table */}
          <Card className="hidden md:block overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-app bg-surface-2/50 text-left">
                    {columns.map((col) => {
                      const canSort = sortable.includes(col.key);
                      const isSorted = sort === col.key;
                      return (
                        <th key={col.key} className="px-4 py-2.5 font-medium text-muted">
                          {canSort ? (
                            <button
                              type="button"
                              onClick={() => toggleSort(col.key)}
                              className="inline-flex items-center gap-1 hover:text-app transition-colors"
                              aria-label={`Sort by ${col.label}`}
                            >
                              {col.label}
                              {isSorted ? (
                                order === "asc" ? (
                                  <ArrowUp className="size-3.5" aria-hidden />
                                ) : (
                                  <ArrowDown className="size-3.5" aria-hidden />
                                )
                              ) : (
                                <ChevronsUpDown className="size-3.5 opacity-40" aria-hidden />
                              )}
                            </button>
                          ) : (
                            col.label
                          )}
                        </th>
                      );
                    })}
                    <th className="px-4 py-2.5 w-px" />
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((row) => (
                    <tr key={String(row._id)} className="border-b border-app last:border-0 hover:bg-surface-2/40">
                      {columns.map((col, i) => (
                        <td key={col.key} className={cn("px-4 py-3", i === 0 && "font-medium")}>
                          {renderCell(row, col)}
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/${config.key}/${row._id}`} aria-label="Edit">
                              <Pencil aria-hidden />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget(row)}
                            aria-label="Delete"
                            className="text-[var(--danger)]"
                          >
                            <Trash2 aria-hidden />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <DataPagination
            page={data.page}
            pageSize={data.pageSize ?? pageSize}
            total={data.total}
            totalPages={data.totalPages}
            hasPrevPage={data.hasPrevPage}
            hasNextPage={data.hasNextPage}
            onPageChange={(p) => setParams({ page: p }, { resetPage: false })}
            onPageSizeChange={(s) => setParams({ pageSize: s })}
          />
        </>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete this ${singular(config.label).toLowerCase()}?`}
        description={`"${deleteTarget ? String(renderCell(deleteTarget, columns[0]!)) : ""}" will be permanently removed. This cannot be undone.`}
        onConfirm={async () => {
          if (deleteTarget) await handleDelete(deleteTarget);
        }}
      />
    </div>
  );
}

function renderCell(row: Row, col: { key: string; render?: (row: Row) => string }): string {
  if (col.render) return col.render(row);
  const value = row[col.key];
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  // Dates come back as ISO strings over JSON — show them readably.
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }
  return String(value);
}

function singular(label: string): string {
  if (label.endsWith("ies")) return `${label.slice(0, -3)}y`;
  if (label.endsWith("s")) return label.slice(0, -1);
  return label;
}
