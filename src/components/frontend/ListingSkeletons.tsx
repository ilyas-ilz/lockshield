import type { ReactNode } from "react";
import { CardGrid } from "./CardGrid";
import { PUBLIC_PAGE_SIZE } from "@/lib/public-listing";

/**
 * Shimmer placeholders for the public listing grids, shown while the
 * streamed results load (the page hero renders immediately - see the
 * <Suspense> in app/(public)/{blog,projects,services}/page.tsx).
 *
 * WHY they copy the real cards' boxes (aspect ratio, padding, radius, line
 * heights): when the cards stream in nothing moves, so there is no layout
 * shift (CLS) and the swap reads as content "filling in", not a page jump.
 */

const COUNT = PUBLIC_PAGE_SIZE;

function Bar({ className }: { className: string }) {
  return (
    <div className={`animate-shimmer rounded-full bg-ink/8 ${className}`} />
  );
}

function Loading({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading {label}…</span>
      <div aria-hidden>{children}</div>
    </div>
  );
}

/** Mirrors BlogGrid's PostCard. */
export function BlogGridSkeleton() {
  return (
    <Loading label="articles">
      <CardGrid>
        {Array.from({ length: COUNT }, (_, i) => (
          <div
            key={i}
            className="flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--marketing-line)] bg-white"
          >
            <div className="animate-shimmer aspect-[16/10] bg-paper-soft" />
            <div className="space-y-3 p-5 sm:p-6">
              <Bar className="h-3 w-24" />
              <Bar className="h-5 w-11/12" />
              <Bar className="h-5 w-2/3" />
              <div className="space-y-2 pt-1">
                <Bar className="h-3 w-full" />
                <Bar className="h-3 w-5/6" />
              </div>
            </div>
            <div className="px-5 pb-5 pt-2 sm:px-6 sm:pb-6">
              <Bar className="h-3 w-28" />
            </div>
          </div>
        ))}
      </CardGrid>
    </Loading>
  );
}

/** Mirrors ProjectsGallery: sector tab row, then the cards. */
export function ProjectGridSkeleton() {
  return (
    <Loading label="projects">
      <div className="space-y-8 sm:space-y-10">
        <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5">
          {["w-14", "w-24", "w-16", "w-28", "w-20"].map((w) => (
            <div
              key={w}
              className={`animate-shimmer h-10 rounded-full bg-ink/8 sm:h-11 ${w}`}
            />
          ))}
        </div>
        <CardGrid>
          {Array.from({ length: COUNT }, (_, i) => (
            <div
              key={i}
              className="flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--marketing-line)] bg-white"
            >
              <div className="animate-shimmer aspect-[16/10] bg-paper-soft" />
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <Bar className="h-3 w-32" />
                <Bar className="mt-3 h-5 w-10/12" />
                <Bar className="mt-2 h-5 w-1/2" />
                <div className="mt-6 border-t border-[var(--marketing-line)] pt-4">
                  <Bar className="h-3 w-24" />
                </div>
              </div>
            </div>
          ))}
        </CardGrid>
      </div>
    </Loading>
  );
}

/** Mirrors the /services card. */
export function ServiceGridSkeleton() {
  return (
    <Loading label="services">
      <CardGrid>
        {Array.from({ length: COUNT }, (_, i) => (
          <div
            key={i}
            className="flex h-full flex-col justify-between rounded-3xl border border-[var(--marketing-line)] bg-white p-6 sm:p-8"
          >
            <div>
              <div className="animate-shimmer mb-6 size-14 rounded-2xl bg-ink/8" />
              <Bar className="h-5 w-3/4" />
              <div className="mt-4 space-y-2">
                <Bar className="h-3 w-full" />
                <Bar className="h-3 w-11/12" />
                <Bar className="h-3 w-2/3" />
              </div>
            </div>
            <div className="mt-8 border-t border-[var(--marketing-line)] pt-4">
              <Bar className="h-3 w-40" />
            </div>
          </div>
        ))}
      </CardGrid>
    </Loading>
  );
}
