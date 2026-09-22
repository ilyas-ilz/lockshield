import type { Metadata } from "next";
import { Flame } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Post } from "@/models";
import { PageHero } from "@/components/frontend/PageHero";
import { Section } from "@/components/frontend/Section";
import { Reveal } from "@/components/frontend/Reveal";
import { ButtonLink } from "@/components/frontend/Button";
import { BlogGrid, type BlogPostSummary } from "@/components/frontend/BlogGrid";
import { Pagination } from "@/components/frontend/Pagination";
import { PUBLIC_PAGE_SIZE, parsePage, totalPagesFor, type PublicSearchParams } from "@/lib/public-listing";

// Rendered per request because the page reads ?page= from the URL. See the
// matching note in app/(public)/projects/page.tsx.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Fire Safety Blog & Knowledge Center | Lock Shield UAE",
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

export default async function BlogPage({ searchParams }: { searchParams: Promise<PublicSearchParams> }) {
  const sp = await searchParams;

  let posts: PostSummary[] = [];
  let total = 0;
  let page = 1;
  let totalPages = 1;

  try {
    await connectDB();

    const filter = { status: "published" };
    total = await Post.countDocuments(filter);
    totalPages = totalPagesFor(total, PUBLIC_PAGE_SIZE);
    page = parsePage(sp.page, totalPages);

    const foundPosts = await Post.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip((page - 1) * PUBLIC_PAGE_SIZE)
      .limit(PUBLIC_PAGE_SIZE)
      .lean();
    posts = (foundPosts as unknown as PostSummary[]) || [];
  } catch {
    // DB error fallback
  }

  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Blog" }]}
        title="Fire Safety"
        accent="Articles & Guides"
        description="Stay informed on UAE Civil Defence requirements, preventative maintenance protocols, and suppression technology innovations."
      />

      <Section className="blueprint-grid bg-paper-soft">
        {posts.length === 0 ? (
          <Reveal className="mx-auto max-w-xl rounded-3xl border border-[var(--marketing-line)] bg-white p-10 text-center sm:p-16">
            <Flame className="mx-auto mb-4 size-12 text-brand-500" />
            <h3 className="font-tech text-lg font-bold uppercase text-navy-900 sm:text-xl">
              Articles Publishing Soon
            </h3>
            <p className="mt-2 text-sm text-ink/62">
              Our fire engineers are preparing fresh technical guides and compliance case studies.
              Check back shortly or visit our services.
            </p>
            <div className="pt-6">
              <ButtonLink href="/services" variant="red">
                Explore Our Services
              </ButtonLink>
            </div>
          </Reveal>
        ) : (
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
        )}
      </Section>
    </>
  );
}
