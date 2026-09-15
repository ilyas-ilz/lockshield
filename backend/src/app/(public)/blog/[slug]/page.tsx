import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Calendar, User, Clock, ArrowLeft } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Post } from "@/models";
import { BlockRenderer } from "@/components/frontend/BlockRenderer";

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

  // Article JSON-LD
  const jsonLdArticle = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage?.url ? [post.coverImage.url] : undefined,
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Organization",
      name: "Lock Shield Fire Safety Engineering Desk",
      url: "https://lockshield.ae/",
    },
    publisher: {
      "@type": "Organization",
      name: "Lock Shield Firefighting & Safety Equipment Installation LLC",
      logo: {
        "@type": "ImageObject",
        url: "https://lockshield.ae/assets/images/logo-shield.png",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />

      <section className="pt-36 pb-16 bg-[#0d1220] text-white relative overflow-hidden">
        <div className="blueprint-grid-dark absolute inset-0 opacity-20 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="size-3.5" />
            <Link href="/blog" className="hover:text-white transition-colors">
              Blog
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-white font-medium truncate">{post.title}</span>
          </div>

          <h1 className="font-tech text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight text-white leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 mt-6 text-xs sm:text-sm text-gray-300">
            <span className="flex items-center gap-2">
              <Calendar className="size-4 text-[#e01b24]" />
              {post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString("en-AE", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Published Recently"}
            </span>
            <span className="flex items-center gap-2">
              <User className="size-4 text-[#e01b24]" />
              Lock Shield Fire Engineering Desk
            </span>
            <span className="flex items-center gap-2">
              <Clock className="size-4 text-[#e01b24]" />
              5 min read
            </span>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-white">
        <article className="max-w-4xl mx-auto px-4 sm:px-6">
          {post.coverImage?.url && (
            <div className="rounded-3xl overflow-hidden shadow-lg border border-gray-100 mb-12">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.coverImage.url}
                alt={post.coverImage.alt || post.title}
                className="w-full h-auto max-h-[480px] object-cover"
              />
            </div>
          )}

          {post.excerpt && (
            <div className="text-lg sm:text-xl text-gray-700 font-medium leading-relaxed border-l-4 border-[#e01b24] pl-6 py-2 mb-10 bg-gray-50/80 rounded-r-2xl">
              {post.excerpt}
            </div>
          )}

          {/* Article Body */}
          <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed space-y-6">
            {post.body ? (
              typeof post.body === "string" ? (
                <div dangerouslySetInnerHTML={{ __html: post.body }} />
              ) : (
                <BlockRenderer blocks={[{ type: "richText", body: post.body, id: "body" }]} />
              )
            ) : (
              <p>Content for this article is being finalized.</p>
            )}
          </div>

          {/* Bottom Navigation */}
          <div className="mt-16 pt-8 border-t border-gray-200 flex items-center justify-between">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-[#e01b24] transition-colors"
            >
              <ArrowLeft className="size-4" />
              <span>Back to all articles</span>
            </Link>

            <Link
              href="/contact"
              className="btn-pill inline-flex items-center gap-2 bg-[#e01b24] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#b3121a] transition-colors"
            >
              <span>Consult an Engineer</span>
            </Link>
          </div>
        </article>
      </section>
    </>
  );
}
