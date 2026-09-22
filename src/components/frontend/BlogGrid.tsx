import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, Flame } from "lucide-react";
import { Reveal } from "./Reveal";
import { CardGrid } from "./CardGrid";

export interface BlogPostSummary {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: { url: string; alt?: string };
  publishedAt?: string | number | Date;
}

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
 * Blog card grid.
 *
 * WHY this no longer owns pagination: it used to hold the posts in state and
 * append to them from /api/blog on "Load More". That made pages 2+ invisible
 * to crawlers, unreachable by URL (you could not link someone to a post's
 * page), lost on back-navigation, and a failed fetch was swallowed in silence.
 * The page now queries the page it needs server-side and renders real
 * `<Pagination>` links; this component just draws the cards.
 */
export function BlogGrid({ posts }: { posts: BlogPostSummary[] }) {
  return (
    <CardGrid>
      {posts.map((post, idx) => (
        <PostCard key={post._id} post={post} idx={idx} />
      ))}
    </CardGrid>
  );
}
