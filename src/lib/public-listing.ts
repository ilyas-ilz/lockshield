/**
 * Shared query-param handling for the public listing pages (/services,
 * /projects, /blog). The URL is the source of truth: refreshing, sharing or
 * hitting back must reproduce the exact same view, and every page link is a
 * real href so crawlers can follow it.
 */

/** 9 keeps a 3-column grid full on desktop and a 1-column list short on mobile. */
export const PUBLIC_PAGE_SIZE = 9;

export type PublicSearchParams = Record<string, string | string[] | undefined>;

function firstValue(raw: string | string[] | undefined): string | undefined {
  return Array.isArray(raw) ? raw[0] : raw;
}

/**
 * Clamp `?page=` to something sane. A junk or out-of-range value falls back to
 * page 1 rather than rendering an empty grid — `?page=99` on a 3-page listing
 * used to be indistinguishable from "we have no projects".
 */
export function parsePage(raw: string | string[] | undefined, totalPages = Number.POSITIVE_INFINITY): number {
  const parsed = Number.parseInt(firstValue(raw) ?? "1", 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.min(parsed, Math.max(1, totalPages));
}

/** Read a single-value filter param, normalised to undefined when absent/blank. */
export function parseFilter(raw: string | string[] | undefined): string | undefined {
  const value = firstValue(raw)?.trim();
  return value ? value : undefined;
}

export function totalPagesFor(total: number, pageSize: number = PUBLIC_PAGE_SIZE): number {
  return Math.max(1, Math.ceil(total / pageSize));
}
