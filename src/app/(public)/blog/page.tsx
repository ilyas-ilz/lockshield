import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, Clock, Flame } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Post } from "@/models";
import { PageHero } from "@/components/frontend/PageHero";
import { Section } from "@/components/frontend/Section";
import { Reveal } from "@/components/frontend/Reveal";
import { ButtonLink } from "@/components/frontend/Button";

// Content is editable from the admin, so pages must not be frozen at build
// time. Revalidate every 5 minutes.
export const revalidate = 300;

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

export default async function BlogPage() {
  let posts: PostSummary[] = [];

  try {
    await connectDB();
    const foundPosts = await Post.find({ status: "published" })
      .sort({ publishedAt: -1, createdAt: -1 })
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {posts.map((post, idx) => (
              <Reveal key={post._id} delayMs={(idx % 3) * 80}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-[var(--marketing-line)] bg-white shadow-xs transition-all duration-300 hover:border-brand-500 hover:shadow-xl"
                >
                  <div>
                    {post.coverImage?.url ? (
                      <div className="relative aspect-[16/10] overflow-hidden bg-paper-soft">
                        <Image
                          src={post.coverImage.url}
                          alt={post.coverImage.alt || post.title}
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          priority={idx < 3}
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-[16/10] items-center justify-center bg-paper-soft text-ink/20">
                        <Flame className="size-12" />
                      </div>
                    )}
                    <div className="p-5 sm:p-6">
                      <div className="mb-3 flex items-center gap-4 text-xs text-ink/40">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="size-3.5" />
                          {post.publishedAt
                            ? new Date(post.publishedAt).toLocaleDateString("en-AE", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "Recent"}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="size-3.5" />
                          5 min read
                        </span>
                      </div>
                      <h3 className="font-tech line-clamp-2 text-lg font-bold uppercase tracking-wide text-navy-900 transition-colors group-hover:text-brand-500">
                        {post.title}
                      </h3>
                      <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-ink/62">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-5 pb-5 pt-2 text-xs font-semibold text-brand-500 sm:px-6 sm:pb-6">
                    <span>Read Full Article</span>
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
