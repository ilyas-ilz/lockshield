import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Calendar, User, Clock, ArrowLeft } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Post } from "@/models";
import { BlockRenderer } from "@/components/frontend/BlockRenderer";
import { Reveal } from "@/components/frontend/Reveal";
import { ButtonLink } from "@/components/frontend/Button";
import { getEnv } from "@/lib/env";
import { sanitizeRichHtml } from "@/lib/sanitize-html";
import { buildArticleSchema, buildBreadcrumbSchema } from "@/lib/seo/jsonld";

// Content is editable from the admin, so pages must not be frozen at build
// time. Revalidate every 5 minutes.
export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  await connectDB().catch(() => {});
  const post = await Post.findOne({ slug, status: "published" }).lean().catch(() => null);

  if (!post) {
    return { title: "Article Not Found | Lock Shield" };
  }

  return {
    title: `${post.title} | Lock Shield Safety Blog`,
    description: post.excerpt || post.seo?.description,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImage?.url ? [post.coverImage.url] : undefined,
    },
  };
}

interface BlogPostDoc {
  title: string;
  excerpt?: string;
  coverImage?: { url: string; alt?: string };
  body?: unknown;
  publishedAt?: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  let post: BlogPostDoc | null = null;

  try {
    await connectDB();
    post = await Post.findOne({ slug, status: "published" }).lean();
  } catch {
    // DB error
  }

  if (!post) {
    notFound();
  }

  const siteUrl = getEnv().SITE_URL;
  // coverImage.url is either an absolute CDN (Spaces) URL or a local /assets
  // path - schema.org/Google Rich Results want Article.image absolute.
  const absoluteCoverImageUrl = post.coverImage?.url
    ? post.coverImage.url.startsWith("http")
      ? post.coverImage.url
      : `${siteUrl}${post.coverImage.url}`
    : undefined;
  const jsonLdArticle = buildArticleSchema({
    title: post.title,
    excerpt: post.excerpt || "",
    url: `${siteUrl}/blog/${slug}`,
    imageUrl: absoluteCoverImageUrl,
    publishedAt: post.publishedAt || post.createdAt || new Date(),
    updatedAt: post.updatedAt || post.publishedAt || post.createdAt || new Date(),
    authorName: "Lock Shield Fire Safety Engineering Desk",
    publisherName: "Lock Shield Firefighting & Safety Equipment Installation LLC",
    publisherLogoUrl: `${siteUrl}/assets/images/logo-shield.png`,
  });
  const jsonLdBreadcrumb = buildBreadcrumbSchema([
    { name: "Home", url: siteUrl },
    { name: "Blog", url: `${siteUrl}/blog` },
    { name: post.title, url: `${siteUrl}/blog/${slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />

      {/* Header */}
      <section className="relative overflow-hidden bg-ink pb-12 pt-28 text-white sm:pb-16 sm:pt-32 lg:pt-36">
        <div className="blueprint-grid-dark pointer-events-none absolute inset-0 opacity-10" />
        <div className="wrap max-w-4xl relative z-10">
          <div className="font-tech mb-4 flex flex-wrap items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-white/55 sm:text-xs">
            <Link href="/" className="transition-colors hover:text-brand-400">
              Home
            </Link>
            <ChevronRight className="size-3 text-brand-500" />
            <Link href="/blog" className="transition-colors hover:text-brand-400">
              Blog
            </Link>
            <ChevronRight className="size-3 text-brand-500" />
            <span className="truncate font-medium text-white">{post.title}</span>
          </div>

          <h1 className="font-tech text-[clamp(1.8rem,6vw,3rem)] font-bold uppercase leading-[1.1] tracking-tight text-white">
            {post.title}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-xs text-white/70 sm:text-sm">
            <span className="flex items-center gap-2">
              <Calendar className="size-4 text-brand-500" />
              {post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString("en-AE", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Published Recently"}
            </span>
            <span className="flex items-center gap-2">
              <User className="size-4 text-brand-500" />
              Lock Shield Fire Engineering Desk
            </span>
            <span className="flex items-center gap-2">
              <Clock className="size-4 text-brand-500" />
              5 min read
            </span>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-20 lg:py-24">
        <article className="wrap max-w-4xl">
          {post.coverImage?.url && (
            <Reveal className="relative mb-10 aspect-[16/9] overflow-hidden rounded-3xl border border-[var(--marketing-line)] shadow-lg sm:mb-12">
              <Image
                src={post.coverImage.url}
                alt={post.coverImage.alt || post.title}
                fill
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="object-cover"
                priority
              />
            </Reveal>
          )}

          {post.excerpt && (
            <Reveal delayMs={60} className="mb-8 rounded-r-2xl border-l-4 border-brand-500 bg-paper-soft/80 py-2 pl-6 text-base font-medium leading-relaxed text-ink/80 sm:mb-10 sm:text-xl">
              {post.excerpt}
            </Reveal>
          )}

          {/* Article Body */}
          <Reveal delayMs={100} className="prose prose-lg max-w-none space-y-6 leading-relaxed text-ink/85">
            {post.body ? (
              typeof post.body === "string" ? (
                <div dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(post.body) }} />
              ) : (
                <BlockRenderer blocks={[{ type: "richText", body: post.body, id: "body" }]} />
              )
            ) : (
              <p>Content for this article is being finalized.</p>
            )}
          </Reveal>

          {/* Bottom Navigation */}
          <div className="mt-14 flex flex-col items-start gap-4 border-t border-[var(--marketing-line)] pt-8 sm:mt-16 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/blog"
              className="flex min-h-11 items-center gap-2 text-sm font-semibold text-ink/72 transition-colors hover:text-brand-500"
            >
              <ArrowLeft className="size-4" />
              <span>Back to all articles</span>
            </Link>

            <ButtonLink href="/contact" arrow={false} className="px-5 py-2.5 text-xs">
              Consult an Engineer
            </ButtonLink>
          </div>
        </article>
      </section>
    </>
  );
}
