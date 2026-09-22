import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Public-site pagination.
 *
 * WHY this is not `components/shared/DataPagination`: that one is a client
 * component driven by `onPageChange` callbacks and styled for the admin
 * surface tokens. A marketing listing needs real crawlable `<a href>` links
 * so Google can reach page 2 onward, and it renders inside a Server
 * Component, so there is nowhere to hang a callback. Same job, genuinely
 * different constraints — not a restyled copy.
 */

function buildHref(basePath: string, params: Record<string, string | undefined>, page: number): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  // Page 1 is the canonical, param-free URL — keeping "?page=1" around would
  // hand search engines a duplicate of the listing's main address.
  if (page > 1) search.set("page", String(page));
  const qs = search.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/** Condensed page list: 1 … 4 5 6 … 20, so the control never wraps on mobile. */
function pageWindow(page: number, totalPages: number): (number | "gap")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  if (page <= 3) return [1, 2, 3, 4, "gap", totalPages];
  if (page >= totalPages - 2) return [1, "gap", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return [1, "gap", page - 1, page, page + 1, "gap", totalPages];
}

export function Pagination({
  page,
  totalPages,
  total,
  basePath,
  params = {},
  label = "items",
}: {
  page: number;
  totalPages: number;
  total: number;
  basePath: string;
  /** Other query params to carry across page links, e.g. an active filter. */
  params?: Record<string, string | undefined>;
  label?: string;
}) {
  if (totalPages <= 1) return null;

  const pages = pageWindow(page, totalPages);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const arrowBase =
    "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-xs font-semibold uppercase tracking-wide transition-all sm:text-sm";
  const arrowEnabled =
    "border-[var(--marketing-line)] bg-white text-navy-900 hover:border-brand-500 hover:text-brand-500";
  const arrowDisabled = "pointer-events-none border-[var(--marketing-line)] bg-white/50 text-ink/30";

  return (
    <nav aria-label="Pagination" className="mt-10 flex flex-col items-center gap-4 sm:mt-12">
      <div className="flex items-center gap-1.5 sm:gap-2">
        {hasPrev ? (
          <Link href={buildHref(basePath, params, page - 1)} rel="prev" className={`${arrowBase} ${arrowEnabled}`}>
            <ChevronLeft className="size-4" aria-hidden />
            <span className="hidden sm:inline">Prev</span>
          </Link>
        ) : (
          <span aria-hidden className={`${arrowBase} ${arrowDisabled}`}>
            <ChevronLeft className="size-4" />
            <span className="hidden sm:inline">Prev</span>
          </span>
        )}

        <div className="flex items-center gap-1 sm:gap-1.5">
          {pages.map((entry, index) =>
            entry === "gap" ? (
              <span key={`gap-${index}`} aria-hidden className="px-1 text-sm text-ink/40 select-none">
                …
              </span>
            ) : entry === page ? (
              <span
                key={entry}
                aria-current="page"
                className="inline-flex size-11 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white shadow-md"
              >
                {entry}
              </span>
            ) : (
              <Link
                key={entry}
                href={buildHref(basePath, params, entry)}
                aria-label={`Go to page ${entry}`}
                className="inline-flex size-11 items-center justify-center rounded-full border border-[var(--marketing-line)] bg-white text-sm font-semibold text-navy-900 transition-all hover:border-brand-500 hover:text-brand-500"
              >
                {entry}
              </Link>
            )
          )}
        </div>

        {hasNext ? (
          <Link href={buildHref(basePath, params, page + 1)} rel="next" className={`${arrowBase} ${arrowEnabled}`}>
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        ) : (
          <span aria-hidden className={`${arrowBase} ${arrowDisabled}`}>
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="size-4" />
          </span>
        )}
      </div>

      <p className="text-xs text-ink/55 tabular-nums">
        Page {page} of {totalPages} · {total.toLocaleString()} {label}
      </p>
    </nav>
  );
}
