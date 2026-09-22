import { PageHeroSkeleton, Shimmer } from "@/components/frontend/skeletons";

/** Contact: hero, then the quote form beside the NAP/details column. */
export default function ContactLoading() {
  return (
    <>
      <PageHeroSkeleton />
      <section className="section-y bg-white">
        <div className="wrap grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-5 rounded-3xl border border-[var(--marketing-line)] bg-paper-soft p-6 sm:p-8">
            <Shimmer className="h-6 w-56 rounded-lg" />
            <div className="grid gap-5 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Shimmer className="h-3 w-24 rounded-md" />
                  <Shimmer className="h-12 w-full rounded-xl" />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Shimmer className="h-3 w-28 rounded-md" />
              <Shimmer className="h-28 w-full rounded-xl" />
            </div>
            <Shimmer className="h-12 w-44 rounded-full" />
          </div>
          <aside className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-3 rounded-3xl border border-[var(--marketing-line)] bg-white p-6">
                <Shimmer className="size-10 rounded-xl" />
                <Shimmer className="h-4 w-28 rounded-md" />
                <Shimmer className="h-3 w-full rounded-md" />
              </div>
            ))}
          </aside>
        </div>
      </section>
    </>
  );
}
