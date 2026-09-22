import { PageHeroSkeleton, Shimmer } from "@/components/frontend/skeletons";

/** Career: hero, then the stacked job opening rows. */
export default function CareerLoading() {
  return (
    <>
      <PageHeroSkeleton />
      <section className="section-y blueprint-grid bg-paper-soft">
        <div className="wrap space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-4 rounded-3xl border border-[var(--marketing-line)] bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
            >
              <div className="space-y-3">
                <Shimmer className="h-5 w-56 rounded-lg" />
                <div className="flex flex-wrap gap-2">
                  <Shimmer className="h-6 w-24 rounded-full" />
                  <Shimmer className="h-6 w-28 rounded-full" />
                  <Shimmer className="h-6 w-20 rounded-full" />
                </div>
              </div>
              <Shimmer className="h-11 w-full rounded-full sm:w-36" />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
