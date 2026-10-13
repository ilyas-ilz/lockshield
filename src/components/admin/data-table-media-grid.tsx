"use client";

import Link from "next/link";
import { Check, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBytes, type Row } from "./data-table-cells";
import { RowActionsMenu } from "./row-actions-menu";

export function MediaGrid({
  items,
  selectedIds,
  onToggle,
  onDelete,
}: {
  items: Row[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onDelete: (row: Row) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((row) => {
        const id = String(row._id);
        const isSelected = selectedIds.has(id);
        const url = typeof row.url === "string" ? row.url : "";
        const alt = typeof row.alt === "string" ? row.alt : "";
        const format = typeof row.format === "string" ? row.format : undefined;
        const bytes = typeof row.bytes === "number" ? row.bytes : undefined;

        return (
          <div
            key={id}
            className={cn(
              "group relative overflow-hidden rounded-2xl border border-app bg-surface transition-all",
              isSelected && "ring-2 ring-[var(--color-brand-500)]"
            )}
          >
            <button
              type="button"
              onClick={() => onToggle(id)}
              aria-label={isSelected ? "Deselect" : "Select"}
              aria-pressed={isSelected}
              className={cn(
                "absolute left-2 top-2 z-10 flex size-7 cursor-pointer items-center justify-center rounded-md border transition-all",
                isSelected
                  ? "border-[var(--color-brand-500)] bg-[var(--color-brand-500)] text-white"
                  : "border-white/70 bg-black/30 text-transparent opacity-100 backdrop-blur-xs sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
              )}
            >
              <Check className="size-3.5" aria-hidden />
            </button>

            <Link href={`/admin/media/${id}`} className="block">
              <div className="relative aspect-square bg-surface-2">
                {url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={url} alt={alt || "Media asset"} className="size-full object-cover" loading="lazy" />
                ) : (
                  <div className="flex size-full items-center justify-center text-muted/50">
                    <ImageOff className="size-6" aria-hidden />
                  </div>
                )}
              </div>
            </Link>

            <div className="flex items-center gap-2 py-1.5 pl-3 pr-1">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-app" title={alt}>
                  {alt || "—"}
                </p>
                <p className="truncate text-[10px] uppercase tracking-wide text-muted">
                  {[format, bytes ? formatBytes(bytes) : null].filter(Boolean).join(" · ") || "—"}
                </p>
              </div>
              <RowActionsMenu editHref={`/admin/media/${id}`} itemLabel={alt || "media asset"} onDelete={() => onDelete(row)} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
