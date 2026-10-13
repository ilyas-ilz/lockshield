"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ArrowDown, ArrowUp, ChevronsUpDown, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataPagination } from "@/components/shared/data-pagination";
import { TableSkeleton, EmptyState, ErrorState } from "@/components/shared/states";
import { api, type PageResult } from "@/lib/admin/api-client";
import { SORTABLE_FIELDS, type SortableResource } from "@/lib/sortable-fields";
import type { ResourceConfig } from "@/lib/admin/field-types";
import { initialsOf } from "@/lib/initials";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { cellText, isImageColumn, renderCell, singular, type Row } from "./data-table-cells";
import { DataTableToolbar } from "./data-table-toolbar";
import { MediaGrid } from "./data-table-media-grid";
import { RowActionsMenu } from "./row-actions-menu";

const EXPORT_PAGE_SIZE = 100;
const EXPORT_MAX_PAGES = 50;

export function DataTable({
  config,
  initialData,
}: {
  config: ResourceConfig;
  initialData?: PageResult<Row>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Number(searchParams.get("pageSize") ?? 20);
  const search = searchParams.get("search") ?? "";
  const sort = searchParams.get("sort") ?? "";
  const order = (searchParams.get("order") ?? "desc") as "asc" | "desc";
  const statusFilter = searchParams.get("status") ?? "all";

  const [data, setData] = React.useState<PageResult<Row> | null>(initialData ?? null);
  const [loading, setLoading] = React.useState(!initialData);
  const [error, setError] = React.useState<string | null>(null);
  const [searchDraft, setSearchDraft] = React.useState(search);
  const [deleteTarget, setDeleteTarget] = React.useState<Row | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);

  const sortable = (SORTABLE_FIELDS[config.key as SortableResource] ?? []) as readonly string[];
  const columns = config.columns;
  const hasStatusColumn = columns.some((c) => c.key === "status" || c.key === "publishStatus");
  const isMediaGrid = config.key === "media";
  const showAvatar = !isImageColumn(columns[0]!);

  // Sync initialData updates if props change (e.g. on SSR navigation)
  React.useEffect(() => {
    if (initialData) {
      setData(initialData);
      setLoading(false);
    }
  }, [initialData]);

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

  const queryParams = React.useCallback(
    (overrides: Record<string, string> = {}) => {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize), order });
      if (search) params.set("search", search);
      if (sort) params.set("sort", sort);
      if (hasStatusColumn && statusFilter !== "all") params.set("status", statusFilter);
      for (const [k, v] of Object.entries(overrides)) params.set(k, v);
      return params;
    },
    [page, pageSize, order, search, sort, statusFilter, hasStatusColumn]
  );

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await api.get<PageResult<Row>>(`${config.apiPath}?${queryParams()}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [config.apiPath, queryParams]);

  // Load when searchParams change, unless initialData was provided on first mount
  const isFirstMount = React.useRef(true);
  React.useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      if (initialData) return;
    }
    void load();
  }, [load, initialData]);

  React.useEffect(() => {
    if (searchDraft === search) return;
    const timer = setTimeout(() => setParams({ search: searchDraft || null }), 300);
    return () => clearTimeout(timer);
  }, [searchDraft, search, setParams]);

  React.useEffect(() => {
    setSearchDraft(search);
  }, [search]);

  // Selection only ever covers rows on screen: whenever the visible rows
  // change (page, sort, size, filter, delete), drop ids that left the view so
  // a bulk action can't hit rows the user no longer sees.
  React.useEffect(() => {
    setSelectedIds((prev) => {
      if (prev.size === 0) return prev;
      const visible = new Set((data?.items ?? []).map((r) => String(r._id)));
      const next = new Set([...prev].filter((id) => visible.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [data]);

  function toggleSort(field: string) {
    if (sort === field) setParams({ sort: field, order: order === "asc" ? "desc" : "asc" });
    else setParams({ sort: field, order: "asc" });
  }

  function toggleSelectAll() {
    if (!data?.items) return;
    if (selectedIds.size === data.items.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(data.items.map((r) => String(r._id))));
  }

  function toggleSelectRow(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
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

  async function handleBulkDelete() {
    const ids = Array.from(selectedIds);
    try {
      await Promise.all(ids.map((id) => api.delete(`${config.apiPath}/${id}`)));
      toast.success(`${ids.length} ${ids.length === 1 ? singular(config.label) : config.label} deleted`);
      setSelectedIds(new Set());
      setBulkDeleteOpen(false);
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bulk delete failed");
    }
  }

  async function handleBulkStatus(targetStatus: string) {
    const ids = Array.from(selectedIds);
    const fieldName = config.key === "projects" ? "publishStatus" : "status";
    try {
      await Promise.all(ids.map((id) => api.patch(`${config.apiPath}/${id}`, { [fieldName]: targetStatus })));
      toast.success(`${ids.length} item${ids.length === 1 ? "" : "s"} updated to ${targetStatus}`);
      setSelectedIds(new Set());
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bulk status update failed");
    }
  }

  // Export every row matching the current search/filter/sort, not just this page.
  async function handleExport() {
    setExporting(true);
    try {
      const rows: Row[] = [];
      let truncated = false;
      for (let p = 1; p <= EXPORT_MAX_PAGES; p++) {
        const res = await api.get<PageResult<Row>>(
          `${config.apiPath}?${queryParams({ page: String(p), pageSize: String(EXPORT_PAGE_SIZE) })}`
        );
        rows.push(...res.items);
        if (!res.hasNextPage) break;
        if (p === EXPORT_MAX_PAGES) truncated = true;
      }
      const escape = (v: string) => (/[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
      const csv = [
        columns.map((c) => escape(c.label)).join(","),
        ...rows.map((row) => columns.map((c) => escape(cellText(row, c))).join(",")),
      ].join("\r\n");
      // BOM so Excel opens the UTF-8 file with Arabic/accented names intact.
      const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${config.key}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      // Revoking synchronously can cancel the download in Firefox/Safari.
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      const noun = rows.length === 1 ? singular(config.label).toLowerCase() : config.label.toLowerCase();
      if (truncated) toast.warning(`Exported the first ${rows.length} ${noun}. Narrow the search to export the rest.`);
      else toast.success(`Exported ${rows.length} ${noun}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }

  const hasFilters = Boolean(search || (hasStatusColumn && statusFilter !== "all"));
  const allSelected = Boolean(data?.items.length && selectedIds.size === data.items.length);
  const editHref = (row: Row) => `/admin/${config.key}/${row._id}`;
  const rowLabel = (row: Row) => cellText(row, columns[0]!) || singular(config.label);

  const pagination = data && (
    <div className="border-t border-app px-4 py-3 sm:px-5">
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
    </div>
  );

  return (
    <div className="rounded-2xl border border-app bg-surface">
      <div className="p-4 sm:p-5">
        <DataTableToolbar
          label={config.label}
          searchable={Boolean(config.searchable)}
          searchDraft={searchDraft}
          onSearchDraft={setSearchDraft}
          hasStatusFilter={hasStatusColumn}
          statusFilter={statusFilter}
          onStatusFilter={(v) => setParams({ status: v === "all" ? null : v })}
          sortable={sortable}
          sort={sort}
          order={order}
          onSort={(field, o) => setParams({ sort: field, order: o })}
          onRefresh={() => void load()}
          refreshing={loading}
          onExport={() => void handleExport()}
          exporting={exporting}
        />
      </div>

      {selectedIds.size > 0 && (
        <div className="sticky top-18 z-10 mx-4 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-app bg-surface-2 px-4 py-2.5 shadow-sm sm:mx-5">
          <p className="flex items-center gap-2 text-sm font-medium text-app">
            <span className="flex h-6 min-w-6 items-center justify-center rounded-md bg-[var(--color-brand-500)] px-1.5 text-xs font-bold text-white">
              {selectedIds.size}
            </span>
            selected
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {hasStatusColumn && (
              <>
                <Button variant="secondary" size="sm" onClick={() => handleBulkStatus("published")}>
                  Mark published
                </Button>
                <Button variant="secondary" size="sm" onClick={() => handleBulkStatus("draft")}>
                  Mark draft
                </Button>
              </>
            )}
            <Button variant="danger" size="sm" onClick={() => setBulkDeleteOpen(true)}>
              <Trash2 aria-hidden />
              Delete
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())} aria-label="Clear selection">
              <X aria-hidden />
            </Button>
          </div>
        </div>
      )}

      {loading && !data ? (
        <div className="px-4 pb-4 sm:px-5 sm:pb-5">
          <TableSkeleton rows={Math.min(pageSize, 8)} columns={columns.length} />
        </div>
      ) : error ? (
        <div className="px-4 pb-4 sm:px-5 sm:pb-5">
          <ErrorState message={error} onRetry={() => void load()} />
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="px-4 pb-4 sm:px-5 sm:pb-5">
          <EmptyState
            title={hasFilters ? `No ${config.label.toLowerCase()} match your filters` : `No ${config.label.toLowerCase()} yet`}
            description={
              hasFilters
                ? "Try a different search term or status filter, or clear them to view everything."
                : isMediaGrid
                  ? "Images you upload from any image field in the admin (cover photos, logos, etc.) will show up here."
                  : `Create your first ${singular(config.label).toLowerCase()} to get started.`
            }
            action={
              hasFilters ? (
                <Button variant="secondary" size="sm" onClick={() => setParams({ search: null, status: null })}>
                  Clear filters
                </Button>
              ) : isMediaGrid ? undefined : (
                <Button variant="primary" size="sm" asChild>
                  <Link href={`/admin/${config.key}/new`}>
                    <Plus aria-hidden />
                    New {singular(config.label).toLowerCase()}
                  </Link>
                </Button>
              )
            }
          />
        </div>
      ) : isMediaGrid ? (
        <>
          <div className={cn("px-4 pb-4 sm:px-5 sm:pb-5", loading && "opacity-60")}>
            <MediaGrid items={data.items} selectedIds={selectedIds} onToggle={toggleSelectRow} onDelete={setDeleteTarget} />
          </div>
          {pagination}
        </>
      ) : (
        <div className={cn("transition-opacity", loading && "opacity-60")}>
          {/* Mobile: compact list */}
          <ul className="divide-y divide-line border-t border-app md:hidden">
            {data.items.map((row) => {
              const id = String(row._id);
              const isSelected = selectedIds.has(id);
              return (
                <li key={id} className={cn("flex items-start gap-3 px-4 py-3.5", isSelected && "bg-surface-2/70")}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelectRow(id)}
                    className="mt-3 size-4 cursor-pointer rounded accent-[var(--color-brand-500)]"
                    aria-label={`Select ${rowLabel(row)}`}
                  />
                  <Link href={editHref(row)} className="min-w-0 flex-1">
                    <span className="flex items-center gap-3">
                      {showAvatar && <RowAvatar text={rowLabel(row)} />}
                      <span className="min-w-0 truncate text-[15px] font-medium text-app">{renderCell(row, columns[0]!)}</span>
                    </span>
                    <dl className="mt-2 space-y-1">
                      {columns.slice(1).map((col) => (
                        <div key={col.key} className="flex items-center gap-2 text-sm">
                          <dt className="shrink-0 text-muted">{col.label}</dt>
                          <dd className="min-w-0 truncate text-app">{renderCell(row, col)}</dd>
                        </div>
                      ))}
                    </dl>
                  </Link>
                  <RowActionsMenu editHref={editHref(row)} itemLabel={rowLabel(row)} onDelete={() => setDeleteTarget(row)} />
                </li>
              );
            })}
          </ul>

          {/* Desktop: table */}
          <div className="hidden overflow-x-auto px-5 pb-2 md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="w-10 rounded-l-xl bg-surface-2 py-3 pl-4">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="size-4 cursor-pointer rounded accent-[var(--color-brand-500)]"
                      aria-label="Select all"
                    />
                  </th>
                  {columns.map((col) => {
                    const canSort = sortable.includes(col.key);
                    const isSorted = sort === col.key;
                    return (
                      <th
                        key={col.key}
                        aria-sort={isSorted ? (order === "asc" ? "ascending" : "descending") : undefined}
                        className="bg-surface-2 px-4 py-3 text-sm font-medium text-muted"
                      >
                        {canSort ? (
                          <button
                            type="button"
                            onClick={() => toggleSort(col.key)}
                            className="inline-flex cursor-pointer items-center gap-1.5 transition-colors hover:text-app"
                          >
                            {col.label}
                            {isSorted ? (
                              order === "asc" ? (
                                <ArrowUp className="size-3.5 text-[var(--color-brand-500)]" aria-hidden />
                              ) : (
                                <ArrowDown className="size-3.5 text-[var(--color-brand-500)]" aria-hidden />
                              )
                            ) : (
                              <ChevronsUpDown className="size-3.5 opacity-50" aria-hidden />
                            )}
                          </button>
                        ) : (
                          col.label
                        )}
                      </th>
                    );
                  })}
                  <th className="w-14 rounded-r-xl bg-surface-2 py-3 pr-2">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.items.map((row) => {
                  const id = String(row._id);
                  const isSelected = selectedIds.has(id);
                  return (
                    <tr key={id} className={cn("transition-colors hover:bg-surface-2/50", isSelected && "bg-surface-2/70")}>
                      <td className="py-3.5 pl-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(id)}
                          className="size-4 cursor-pointer rounded accent-[var(--color-brand-500)]"
                          aria-label={`Select ${rowLabel(row)}`}
                        />
                      </td>
                      {columns.map((col, i) => (
                        <td key={col.key} className={cn("px-4 py-3.5 text-app", i === 0 && "font-medium")}>
                          {i === 0 ? (
                            <Link
                              href={editHref(row)}
                              className="group inline-flex max-w-md items-center gap-3 transition-colors hover:text-[var(--color-brand-600)] dark:hover:text-[var(--color-brand-400)]"
                            >
                              {showAvatar && <RowAvatar text={rowLabel(row)} />}
                              <span className="min-w-0 truncate">{renderCell(row, col)}</span>
                            </Link>
                          ) : (
                            renderCell(row, col)
                          )}
                        </td>
                      ))}
                      <td className="py-2 pr-2 text-right">
                        <RowActionsMenu editHref={editHref(row)} itemLabel={rowLabel(row)} onDelete={() => setDeleteTarget(row)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {pagination}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete this ${singular(config.label).toLowerCase()}?`}
        description="Are you sure you want to permanently delete this item? This action cannot be undone."
        onConfirm={async () => {
          if (deleteTarget) await handleDelete(deleteTarget);
        }}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title={`Delete ${selectedIds.size} selected items?`}
        description={`Are you sure you want to permanently delete ${selectedIds.size} ${selectedIds.size === 1 ? singular(config.label).toLowerCase() : config.label.toLowerCase()}? This action cannot be undone.`}
        onConfirm={handleBulkDelete}
      />
    </div>
  );
}

function RowAvatar({ text }: { text: string }) {
  return (
    <span
      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-semibold text-muted"
      aria-hidden
    >
      {initialsOf(text)}
    </span>
  );
}
