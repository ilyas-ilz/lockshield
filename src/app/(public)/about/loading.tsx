import { PageHeroSkeleton, Shimmer, SectionHeadSkeleton } from "@/components/frontend/skeletons";

/** About: hero, two-column intro, then a values/stat row. */
export default function AboutLoading() {
  return (
    <>
      <PageHeroSkeleton />
      <section className="section-y bg-white">
        <div className="wrap grid gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            <SectionHeadSkeleton />
            {Array.from({ length: 5 }).map((_, i) => (
              <Shimmer key={i} className={`h-3.5 rounded-md ${i === 4 ? "w-2/3" : "w-full"}`} />
            ))}
          </div>
          <Shimmer className="aspect-[4/3] w-full rounded-3xl" />
        </div>
      </section>
      <section className="section-y blueprint-grid bg-paper-soft">
        <div className="wrap grid grid-cols-2 gap-6 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-3xl border border-[var(--marketing-line)] bg-white p-6">
              <Shimmer className="size-12 rounded-2xl" />
              <Shimmer className="h-4 w-24 rounded-md" />
              <Shimmer className="h-3 w-full rounded-md" />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
