import * as React from "react";
import { CardGrid } from "./CardGrid";

/**
 * Loading skeletons for the public site.
 *
 * WHY a separate kit from `components/shared/states`: those are built on the
 * admin surface tokens (`bg-surface-2` on a dark-capable chrome). The public
 * pages sit on paper/white with `--marketing-line` hairlines and a dark ink
 * hero, so admin skeletons read as grey smudges there. Same shimmer
 * animation, correct palette.
 *
 * Each skeleton mirrors the real layout it stands in for — same hero height,
 * same grid columns, same card proportions — so the page does not jump when
 * the content arrives.
 */

/** One shimmering block. `onDark` flips the tint for use inside the ink hero. */
export function Shimmer({
  className = "",
  onDark = false,
  style,
}: {
  className?: string;
  onDark?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      aria-hidden
      style={style}
      className={`animate-shimmer rounded-lg ${onDark ? "bg-white/12" : "bg-[color-mix(in_srgb,var(--color-ink,#0d1220)_8%,transparent)]"} ${className}`}
    />
  );
}

/** Matches PageHero: dark ink band, breadcrumb line, two-line title, blurb. */
export function PageHeroSkeleton({ lines = 2 }: { lines?: number }) {
  return (
    <section className="relative overflow-hidden bg-ink pb-12 pt-28 text-white sm:pb-16 sm:pt-32 lg:pt-36">
      <div className="blueprint-grid-dark pointer-events-none absolute inset-0 opacity-10" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(120% 180% at 90% 0%, rgba(224,27,36,.4), transparent 55%)" }}
      />
      <div className="wrap relative z-10 flex flex-col items-center gap-4 sm:items-start">
        <Shimmer onDark className="h-3 w-40 rounded-full" />
        <div className="w-full space-y-3">
          <Shimmer onDark className="h-9 w-full max-w-md rounded-xl sm:h-12" />
          <Shimmer onDark className="h-9 w-2/3 max-w-sm rounded-xl sm:h-12" />
        </div>
        <div className="w-full max-w-2xl space-y-2 pt-1">
          {Array.from({ length: lines }).map((_, i) => (
            <Shimmer key={i} onDark className={`h-3.5 rounded-md ${i === lines - 1 ? "w-2/3" : "w-full"}`} />
          ))}
        </div>
      </div>
    </section>
  );
}

/** Eyebrow + heading pair that opens most sections. */
export function SectionHeadSkeleton({ centered = false }: { centered?: boolean }) {
  return (
    <div className={`space-y-3 ${centered ? "mx-auto max-w-xl text-center" : ""}`}>
      <Shimmer className={`h-3 w-32 rounded-full ${centered ? "mx-auto" : ""}`} />
      <Shimmer className={`h-7 w-full max-w-sm rounded-xl sm:h-8 ${centered ? "mx-auto" : ""}`} />
    </div>
  );
}

/**
 * The 3-across card grid used by /services, /projects and /blog.
 * `withImage` adds the 16/10 media band that project and blog cards carry.
 */
export function CardGridSkeleton({ count = 9, withImage = true }: { count?: number; withImage?: boolean }) {
  return (
    <CardGrid>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--marketing-line)] bg-white"
        >
          {withImage ? (
            <Shimmer className="aspect-[16/10] w-full rounded-none" />
          ) : (
            <div className="p-6 pb-0 sm:p-8 sm:pb-0">
              <Shimmer className="size-14 rounded-2xl" />
            </div>
          )}
          <div className={`flex flex-1 flex-col gap-3 p-5 sm:p-6 ${withImage ? "" : "pt-6"}`}>
            <Shimmer className="h-3 w-24 rounded-md" />
            <Shimmer className="h-5 w-4/5 rounded-lg" />
            <div className="space-y-2">
              <Shimmer className="h-3 w-full rounded-md" />
              <Shimmer className="h-3 w-11/12 rounded-md" />
              <Shimmer className="h-3 w-2/3 rounded-md" />
            </div>
            <div className="mt-auto flex items-center justify-between border-t border-[var(--marketing-line)] pt-4">
              <Shimmer className="h-3 w-28 rounded-md" />
              <Shimmer className="size-4 rounded" />
            </div>
          </div>
        </div>
      ))}
    </CardGrid>
  );
}

/** Pill row standing in for the sector filter tabs on /projects. */
export function FilterTabsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <Shimmer key={i} className="h-11 rounded-full" style={{ width: `${72 + ((i * 23) % 56)}px` }} />
      ))}
    </div>
  );
}

/** The numbered pagination row, so the page does not grow when it appears. */
export function PaginationSkeleton() {
  return (
    <div className="mt-10 flex flex-col items-center gap-4 sm:mt-12">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Shimmer className="h-11 w-20 rounded-full" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Shimmer key={i} className="size-11 rounded-full" />
        ))}
        <Shimmer className="h-11 w-20 rounded-full" />
      </div>
      <Shimmer className="h-3 w-40 rounded-md" />
    </div>
  );
}

/** Full listing page: hero + optional filters + card grid + pagination. */
export function ListingPageSkeleton({
  withFilters = false,
  withImage = true,
  count = 9,
}: {
  withFilters?: boolean;
  withImage?: boolean;
  count?: number;
}) {
  return (
    <>
      <PageHeroSkeleton />
      <section className="section-y blueprint-grid bg-paper-soft">
        <div className="wrap space-y-8 sm:space-y-10">
          {withFilters && <FilterTabsSkeleton />}
          <CardGridSkeleton count={count} withImage={withImage} />
          <PaginationSkeleton />
        </div>
      </section>
    </>
  );
}

/** Long-form detail page: hero, cover image, prose column, sidebar. */
export function ArticlePageSkeleton({ withSidebar = true }: { withSidebar?: boolean }) {
  return (
    <>
      <PageHeroSkeleton lines={1} />
      <section className="section-y bg-white">
        <div className={`wrap grid gap-10 ${withSidebar ? "lg:grid-cols-[minmax(0,1fr)_20rem]" : ""}`}>
          <div className="space-y-6">
            <Shimmer className="aspect-[16/9] w-full rounded-3xl" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Shimmer key={i} className={`h-3.5 rounded-md ${i === 3 ? "w-3/4" : "w-full"}`} />
              ))}
            </div>
            <Shimmer className="h-6 w-1/2 rounded-lg" />
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Shimmer key={i} className={`h-3.5 rounded-md ${i === 5 ? "w-2/3" : "w-full"}`} />
              ))}
            </div>
          </div>

          {withSidebar && (
            <aside className="space-y-4">
              <div className="space-y-3 rounded-3xl border border-[var(--marketing-line)] bg-paper-soft p-6">
                <Shimmer className="h-4 w-32 rounded-md" />
                {Array.from({ length: 4 }).map((_, i) => (
                  <Shimmer key={i} className="h-10 w-full rounded-xl" />
                ))}
              </div>
              <div className="space-y-3 rounded-3xl border border-[var(--marketing-line)] bg-paper-soft p-6">
                <Shimmer className="h-4 w-28 rounded-md" />
                <Shimmer className="h-11 w-full rounded-full" />
              </div>
            </aside>
          )}
        </div>
      </section>
    </>
  );
}
