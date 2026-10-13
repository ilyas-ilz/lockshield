import type { Metadata } from "next";
import { Suspense } from "react";
import { Flame } from "lucide-react";
import { loadBlogListing } from "@/lib/public-data";
import { PageHero } from "@/components/frontend/PageHero";
import { Section } from "@/components/frontend/Section";
import { Reveal } from "@/components/frontend/Reveal";
import { ButtonLink } from "@/components/frontend/Button";
import { BlogGrid, type BlogPostSummary } from "@/components/frontend/BlogGrid";
import { Pagination } from "@/components/frontend/Pagination";
import { BlogGridSkeleton } from "@/components/frontend/ListingSkeletons";
import { pageKey, type PublicSearchParams } from "@/lib/public-listing";

// Rendered per request because the page reads ?page= from the URL; the DB
// result itself is cached (loadBlogListing) and busted on admin save.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Fire Safety Blog & Knowledge Center",
  description:
    "Insights, guidelines, UAE Fire Code updates, and maintenance best practices by certified fire protection specialists.",
};

interface PostSummary {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: { url: string; alt?: string };
  publishedAt?: string | number | Date;
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<PublicSearchParams>;
}) {
  const page = pageKey((await searchParams).page);

  // WHY Suspense: the hero needs no data, so it streams to the browser
  // straight away while the grid's query runs; the skeleton holds the grid's
  // exact footprint until then. Keyed by page so paging shows the skeleton
  // again instead of the previous page's cards.
  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Blog" }]}
        title="Fire Safety"
        accent="Articles & Guides"
        description="Stay informed on UAE Civil Defence requirements, preventative maintenance protocols, and suppression technology innovations."
      />

      <Section className="blueprint-grid bg-paper-soft">
        <Suspense key={page} fallback={<BlogGridSkeleton />}>
          <BlogResults page={page} />
        </Suspense>
      </Section>
    </>
  );
}

async function BlogResults({ page: requestedPage }: { page: number }) {
  let posts: PostSummary[] = [];
  let total = 0;
  let page = 1;
  let totalPages = 1;

  try {
    const listing = await loadBlogListing(requestedPage);
    ({ total, totalPages, page } = listing);
    posts = listing.posts as PostSummary[];
  } catch {
    // DB error fallback
  }

  if (posts.length === 0) {
    return (
      <Reveal className="mx-auto max-w-xl rounded-3xl border border-[var(--marketing-line)] bg-white p-10 text-center sm:p-16">
        <Flame className="mx-auto mb-4 size-12 text-brand-500" />
        <h3 className="font-tech text-lg font-bold uppercase text-navy-900 sm:text-xl">
          Articles Publishing Soon
        </h3>
        <p className="mt-2 text-sm text-ink/62">
          Our fire engineers are preparing fresh technical guides and compliance
          case studies. Check back shortly or visit our services.
        </p>
        <div className="pt-6">
          <ButtonLink href="/services" variant="red">
            Explore Our Services
          </ButtonLink>
        </div>
      </Reveal>
    );
  }

  return (
    <>
      <BlogGrid posts={posts as BlogPostSummary[]} />
      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        basePath="/blog"
        label="articles"
      />
    </>
  );
}
