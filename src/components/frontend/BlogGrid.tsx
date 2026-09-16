"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, Flame, Loader2 } from "lucide-react";
import { Reveal } from "./Reveal";

export interface BlogPostSummary {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: { url: string; alt?: string };
  publishedAt?: string | number | Date;
}

const PAGE_SIZE = 9;

function PostCard({ post, idx }: { post: BlogPostSummary; idx: number }) {
  return (
    <Reveal delayMs={(idx % 3) * 80}>
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
            </div>
            <h3 className="font-tech line-clamp-2 text-lg font-bold uppercase tracking-wide text-navy-900 transition-colors group-hover:text-brand-500">
              {post.title}
            </h3>
            <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-ink/62">{post.excerpt}</p>
          </div>
        </div>

        <div className="flex items-center justify-between px-5 pb-5 pt-2 text-xs font-semibold text-brand-500 sm:px-6 sm:pb-6">
          <span>Read Full Article</span>
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </div>
      </Link>
    </Reveal>
  );
}

/**
 * Paginated blog grid - renders the first page server-side, further pages
 * load on demand so the listing never becomes an 11,000px endless scroll.
 */
export function BlogGrid({ initialPosts, total }: { initialPosts: BlogPostSummary[]; total: number }) {
  const [posts, setPosts] = React.useState(initialPosts);
  const [loading, setLoading] = React.useState(false);

  const hasMore = posts.length < total;

  async function loadMore() {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/blog?skip=${posts.length}&limit=${PAGE_SIZE}`);
      if (!res.ok) throw new Error("load failed");
      const data = (await res.json()) as { posts: BlogPostSummary[] };
      setPosts((prev) => [...prev, ...(data.posts || [])]);
    } catch {
      // Silent fail - the button stays so the user can retry.
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {posts.map((post, idx) => (
          <PostCard key={post._id} post={post} idx={idx} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-10 text-center sm:mt-12">
          <p className="mb-4 text-xs text-ink/45">
            Showing {posts.length} of {total} articles
          </p>
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="btn-pill inline-flex min-h-11 items-center gap-2 border border-[var(--marketing-line)] bg-white px-6 py-3 text-sm font-semibold text-navy-900 shadow-xs transition-all hover:border-brand-500 hover:text-brand-500 active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Loading…
              </>
            ) : (
              <>
                Load More Articles
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </div>
      )}
    </>
  );
}
