import { Shimmer, SectionHeadSkeleton, CardGridSkeleton } from "@/components/frontend/skeletons";

/**
 * Homepage loading state.
 *
 * WHY it exists: every public route was missing a loading.tsx, so navigating
 * anywhere left the previous page frozen on screen while the server hit Mongo
 * — indistinguishable from a dead link. This is also the fallback for any
 * child route under (public) that does not define its own.
 *
 * Shaped like the real page: full-bleed ink hero, then the services and
 * projects teasers, so nothing shifts when the content lands.
 */
export default function HomeLoading() {
  return (
    <>
      {/* Hero — same min-heights as HeroSlider so the fold does not jump */}
      <section className="relative flex min-h-[92svh] items-center overflow-hidden bg-ink pb-28 pt-24 sm:min-h-[85vh] sm:pb-32 sm:pt-28 lg:min-h-[92vh]">
        <div className="blueprint-grid-dark pointer-events-none absolute inset-0 opacity-10" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(120% 180% at 85% 10%, rgba(224,27,36,.35), transparent 55%)" }}
        />
        <div className="wrap relative z-10 flex flex-col items-center gap-5 text-center sm:items-start sm:text-left">
          <Shimmer onDark className="h-3 w-44 rounded-full" />
          <div className="w-full space-y-4">
            <Shimmer onDark className="h-11 w-full max-w-2xl rounded-xl sm:h-14" />
            <Shimmer onDark className="h-11 w-4/5 max-w-xl rounded-xl sm:h-14" />
          </div>
          <div className="w-full max-w-xl space-y-2">
            <Shimmer onDark className="h-3.5 w-full rounded-md" />
            <Shimmer onDark className="h-3.5 w-3/4 rounded-md" />
          </div>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Shimmer onDark className="h-12 w-52 rounded-full" />
            <Shimmer onDark className="h-12 w-44 rounded-full" />
          </div>
        </div>
      </section>

      {/* Core services teaser */}
      <section className="section-y blueprint-grid bg-paper-soft">
        <div className="wrap space-y-8">
          <SectionHeadSkeleton />
          <CardGridSkeleton count={4} withImage={false} />
        </div>
      </section>

      {/* Projects teaser */}
      <section className="section-y bg-white">
        <div className="wrap space-y-8">
          <SectionHeadSkeleton />
          <CardGridSkeleton count={3} />
        </div>
      </section>

      {/* Stats band */}
      <section className="section-y bg-ink">
        <div className="wrap grid grid-cols-2 gap-6 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3 text-center">
              <Shimmer onDark className="mx-auto h-9 w-24 rounded-lg sm:h-11" />
              <Shimmer onDark className="mx-auto h-3 w-28 rounded-md" />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
