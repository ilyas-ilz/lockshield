import * as React from "react";
import { Badge } from "@/components/ui/card";
import type { ColumnConfig } from "@/lib/admin/field-types";

export type Row = Record<string, unknown>;

const DATE_RE = /^\d{4}-\d{2}-\d{2}T/;

export function renderCell(row: Row, col: ColumnConfig): React.ReactNode {
  if (col.render) return col.render(row);
  const value = row[col.key];

  if (value === null || value === undefined || value === "") return <span className="text-muted">—</span>;

  if (typeof value === "boolean") {
    return value ? (
      <Badge tone="success" className="text-[11px] shadow-none">Yes</Badge>
    ) : (
      <span className="text-xs text-muted">No</span>
    );
  }

  if (col.key === "status" || col.key === "publishStatus") {
    const s = String(value).toLowerCase();
    const tone =
      s === "published" || s === "active" || s === "closed"
        ? "success"
        : s === "draft"
          ? "warning"
          : s === "new"
            ? "brand"
            : "neutral";
    return (
      <Badge tone={tone} className="capitalize text-[11px] shadow-none">
        {s}
      </Badge>
    );
  }

  if (col.key === "role") {
    const r = String(value);
    return (
      <Badge tone={r === "ADMIN" ? "brand" : "neutral"} className="text-[11px] shadow-none">
        {r}
      </Badge>
    );
  }

  if ((col.key === "image" || col.key === "coverImage") && typeof value === "object" && "url" in value) {
    const img = value as { url: string; alt?: string };
    return <Thumb src={img.url} alt={img.alt || "Thumbnail"} />;
  }

  if (
    col.key === "url" &&
    typeof value === "string" &&
    // https covers the R2 public domain and legacy Spaces/Cloudinary URLs.
    (value.startsWith("/uploads/") || value.startsWith("/assets/") || value.startsWith("https://"))
  ) {
    return <Thumb src={value} alt="Thumbnail" />;
  }

  if (typeof value === "string" && DATE_RE.test(value)) {
    // Fixed locale + zone so the SSR'd table and the hydrated one match.
    return new Date(value).toLocaleDateString("en-AE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "Asia/Dubai",
    });
  }

  return String(value);
}

function Thumb({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="flex size-10 items-center justify-center overflow-hidden rounded-lg border border-app bg-surface-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="size-full object-cover" loading="lazy" />
    </div>
  );
}

/** Plain-text version of a cell for CSV export. */
export function cellText(row: Row, col: ColumnConfig): string {
  const value = row[col.key];
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object" && "url" in value) return String((value as { url: unknown }).url ?? "");
  if (typeof value === "string" && DATE_RE.test(value)) {
    // Same calendar day the table shows (Dubai), as sortable YYYY-MM-DD.
    return new Date(value).toLocaleDateString("en-CA", { timeZone: "Asia/Dubai" });
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

/** True when the first column already shows an image, so no initials avatar is needed. */
export function isImageColumn(col: ColumnConfig): boolean {
  return col.key === "url" || col.key === "image" || col.key === "coverImage";
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function singular(label: string): string {
  if (label.endsWith("ies")) return `${label.slice(0, -3)}y`;
  if (label.endsWith("s")) return label.slice(0, -1);
  return label;
}

export function humanize(field: string): string {
  const spaced = field.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/At$/, "").trim();
  if (field === "createdAt") return "Date created";
  if (field === "updatedAt") return "Last updated";
  if (field === "publishedAt") return "Published date";
  if (field === "publishStatus") return "Status";
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
