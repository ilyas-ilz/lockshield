"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ArrowDown, ArrowUp, ChevronsUpDown, Plus, Search, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, Badge } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataPagination } from "@/components/shared/data-pagination";
import { TableSkeleton, EmptyState, ErrorState } from "@/components/shared/states";
import { api, type PageResult } from "@/lib/admin/api-client";
import { SORTABLE_FIELDS, type SortableResource } from "@/lib/sortable-fields";
import type { ResourceConfig, ColumnConfig } from "@/lib/admin/field-types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Row = Record<string, unknown>;

export function DataTable({ config }: { config: ResourceConfig }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Number(searchParams.get("pageSize") ?? 20);
  const search = searchParams.get("search") ?? "";
  const sort = searchParams.get("sort") ?? "";
  const order = (searchParams.get("order") ?? "desc") as "asc" | "desc";
  const statusFilter = searchParams.get("status") ?? "all";

  const [data, setData] = React.useState<PageResult<Row> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchDraft, setSearchDraft] = React.useState(search);
  const [deleteTarget, setDeleteTarget] = React.useState<Row | null>(null);

  const sortable = (SORTABLE_FIELDS[config.key as SortableResource] ?? []) as readonly string[];
  const columns = config.columns;
  const hasStatusColumn = columns.some((c) => c.key === "status" || c.key === "publishStatus");

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
      if (hasStatusColumn && statusFilter !== "all") {
        params.set("status", statusFilter);
      }
      const result = await api.get<PageResult<Row>>(`${config.apiPath}?${params}`);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [config.apiPath, page, pageSize, search, sort, order, statusFilter, hasStatusColumn]);

  React.useEffect(() => {
    void load();
  }, [load]);

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

  const hasFilters = Boolean(search || (hasStatusColumn && statusFilter !== "all"));

  return (
    <div className="space-y-4">
      {/* Top Filter Tabs (if resource has status) */}
      {hasStatusColumn && (
        <div className="flex items-center gap-1 border-b border-app pb-2">
          {["all", "published", "draft"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setParams({ status: tab === "all" ? null : tab })}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors cursor-pointer",
                (statusFilter === tab || (tab === "all" && !searchParams.has("status")))
                  ? "bg-surface-2 text-foreground font-semibold shadow-xs"
                  : "text-muted hover:text-foreground hover:bg-surface-2/50"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {config.searchable ? (
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
            <Input
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder={`Search ${config.label.toLowerCase()}…`}
              className="pl-9 pr-9 text-xs"
              aria-label={`Search ${config.label}`}
            />
            {searchDraft && (
              <button
                type="button"
                onClick={() => setSearchDraft("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted hover:bg-surface-2 cursor-pointer"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            )}
          </div>
        ) : (
          <div />
        )}

        <Button variant="primary" size="sm" asChild className="w-full sm:w-auto">
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
          title={hasFilters ? `No ${config.label.toLowerCase()} match your filters` : `No ${config.label.toLowerCase()} yet`}
          description={
            hasFilters
              ? "Try a different search term or status filter, or clear them to see everything."
              : `Create your first ${singular(config.label).toLowerCase()} to get started.`
          }
          action={
            hasFilters ? (
              <Button variant="secondary" size="sm" onClick={() => setParams({ search: null, status: null })}>
                Clear filters
              </Button>
            ) : (
              <Button variant="primary" size="sm" asChild>
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
          <div className="space-y-2.5 md:hidden">
            {data.items.map((row) => (
              <Card key={String(row._id)} className="p-4 border-app hover:border-brand/40 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate text-foreground">{renderCell(row, columns[0]!)}</p>
                    <dl className="mt-2 space-y-1">
                      {columns.slice(1).map((col) => (
                        <div key={col.key} className="flex items-center gap-2 text-xs">
                          <dt className="text-muted shrink-0">{col.label}:</dt>
                          <dd className="truncate text-foreground font-medium">{renderCell(row, col)}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
                <div className="mt-3 flex gap-2 border-t border-app pt-3">
                  <Button variant="secondary" size="sm" asChild className="flex-1 text-xs">
                    <Link href={`/admin/${config.key}/${row._id}`}>
                      <Pencil className="size-3.5 mr-1" aria-hidden />
                      Edit
                    </Link>
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => setDeleteTarget(row)}>
                    <Trash2 className="size-3.5" aria-hidden />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Desktop: table */}
          <Card className="hidden md:block overflow-hidden border-app shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-app bg-surface-2/60 text-left">
                    {columns.map((col) => {
                      const canSort = sortable.includes(col.key);
                      const isSorted = sort === col.key;
                      return (
                        <th key={col.key} className="px-4 py-3 font-semibold text-xs text-muted uppercase tracking-wider">
                          {canSort ? (
                            <button
                              type="button"
                              onClick={() => toggleSort(col.key)}
                              className="inline-flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
                              aria-label={`Sort by ${col.label}`}
                            >
                              {col.label}
                              {isSorted ? (
                                order === "asc" ? (
                                  <ArrowUp className="size-3.5 text-brand" aria-hidden />
                                ) : (
                                  <ArrowDown className="size-3.5 text-brand" aria-hidden />
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
                    <th className="px-4 py-3 w-20 text-right pr-4 text-xs font-semibold text-muted uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-app">
                  {data.items.map((row) => (
                    <tr
                      key={String(row._id)}
                      className="transition-colors hover:bg-surface-2/50 group"
                    >
                      {columns.map((col, i) => (
                        <td key={col.key} className={cn("px-4 py-3", i === 0 && "font-medium text-foreground")}>
                          {renderCell(row, col)}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" asChild className="size-8">
                            <Link href={`/admin/${config.key}/${row._id}`} aria-label="Edit">
                              <Pencil className="size-3.5" aria-hidden />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget(row)}
                            aria-label="Delete"
                            className="size-8 text-[var(--danger)] hover:bg-[var(--danger)]/10"
                          >
                            <Trash2 className="size-3.5" aria-hidden />
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
        description={`Are you sure you want to permanently delete this item? This action cannot be undone.`}
        onConfirm={async () => {
          if (deleteTarget) await handleDelete(deleteTarget);
        }}
      />
    </div>
  );
}

function renderCell(row: Row, col: ColumnConfig): React.ReactNode {
  if (col.render) return col.render(row);
  const value = row[col.key];

  // Empty values
  if (value === null || value === undefined || value === "") return "—";

  // Boolean values
  if (typeof value === "boolean") {
    return value ? (
      <Badge tone="success" className="text-[11px]">Yes</Badge>
    ) : (
      <span className="text-xs text-muted">No</span>
    );
  }

  // Status & publishStatus badges
  if (col.key === "status" || col.key === "publishStatus") {
    const s = String(value).toLowerCase();
    if (s === "published" || s === "active") return <Badge tone="success" className="capitalize text-[11px]">{s}</Badge>;
    if (s === "draft") return <Badge tone="warning" className="capitalize text-[11px]">Draft</Badge>;
    if (s === "archived") return <Badge tone="neutral" className="capitalize text-[11px]">Archived</Badge>;
    if (s === "new") return <Badge tone="brand" className="capitalize text-[11px]">New</Badge>;
    if (s === "closed") return <Badge tone="success" className="capitalize text-[11px]">Closed</Badge>;
    return <Badge tone="neutral" className="capitalize text-[11px]">{s}</Badge>;
  }

  // Role badges
  if (col.key === "role") {
    const r = String(value);
    return <Badge tone={r === "ADMIN" ? "brand" : "neutral"} className="text-[11px]">{r}</Badge>;
  }

  // Image / coverImage thumbnail preview
  if (
    (col.key === "image" || col.key === "coverImage") &&
    typeof value === "object" &&
    value !== null &&
    "url" in value
  ) {
    const imgObj = value as { url: string; alt?: string };
    return (
      <div className="size-9 rounded-md border border-app overflow-hidden bg-surface-2 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imgObj.url} alt={imgObj.alt || "Thumbnail"} className="size-full object-cover" />
      </div>
    );
  }

  // Direct image URL string
  if (
    col.key === "url" &&
    typeof value === "string" &&
    (value.startsWith("/uploads/") || value.startsWith("/assets/") || value.includes("cloudinary.com"))
  ) {
    return (
      <div className="size-9 rounded-md border border-app overflow-hidden bg-surface-2 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={value} alt="Thumbnail" className="size-full object-cover" />
      </div>
    );
  }

  // Dates
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return String(value);
}

function singular(label: string): string {
  if (label.endsWith("ies")) return `${label.slice(0, -3)}y`;
  if (label.endsWith("s")) return label.slice(0, -1);
  return label;
}
