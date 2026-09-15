import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calendar, User, Clock, Flame } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Post, Category } from "@/models";

export const metadata: Metadata = {
  title: "Fire Safety Blog & Knowledge Center | Lock Shield UAE",
  description:
    "Insights, guidelines, UAE Fire Code updates, and maintenance best practices by certified fire protection specialists.",
};

export default async function BlogPage() {
  let posts: any[] = [];
  let categories: any[] = [];

  try {
    await connectDB();
    const [foundPosts, foundCategories] = await Promise.all([
      Post.find({ status: "published" })
        .sort({ publishedAt: -1, createdAt: -1 })
        .lean(),
      Category.find().lean(),
    ]);
    posts = foundPosts || [];
    categories = foundCategories || [];
  } catch {
    // DB error fallback
  }

  return (
    <>
      <section className="pt-36 pb-16 bg-[#0d1220] text-white relative overflow-hidden">
        <div className="blueprint-grid-dark absolute inset-0 opacity-20 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <span className="font-tech text-xs sm:text-sm font-bold uppercase tracking-widest text-[#e01b24]">
            Engineering Knowledge
          </span>
          <h1 className="font-tech text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-white mt-2">
            Fire Safety <span className="text-[#e01b24]">Articles</span> &amp; Guides
          </h1>
          <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto mt-4 font-light">
            Stay informed on UAE Civil Defence requirements, preventative maintenance protocols,
            and suppression technology innovations.
          </p>
        </div>
      </section>

      <section className="py-20 sm:py-28 bg-[#f7f8fa] blueprint-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {posts.length === 0 ? (
            <div className="rounded-3xl border border-gray-200 bg-white p-16 text-center max-w-xl mx-auto">
              <Flame className="size-12 text-[#e01b24] mx-auto mb-4" />
              <h3 className="font-tech text-xl font-bold uppercase text-gray-900">
                Articles Publishing Soon
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                Our fire engineers are preparing fresh technical guides and compliance case studies.
                Check back shortly or visit our services.
              </p>
              <div className="pt-6">
                <Link
                  href="/services"
                  className="btn-pill inline-flex items-center gap-2 bg-[#e01b24] px-6 py-3 text-sm font-semibold text-white hover:bg-[#b3121a] transition-all"
                >
                  <span>Explore Our Services</span>
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link
                  key={post._id}
                  href={`/blog/${post.slug}`}
                  className="group rounded-3xl overflow-hidden border border-gray-200 bg-white shadow-xs hover:border-[#e01b24] hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {post.coverImage?.url ? (
                      <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={post.coverImage.url}
                          alt={post.title}
                          className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[16/10] bg-gray-100 flex items-center justify-center text-gray-300">
                        <Flame className="size-12" />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
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
                      <h3 className="font-tech text-xl font-bold uppercase tracking-wide text-gray-900 line-clamp-2 group-hover:text-[#e01b24] transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-2.5 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-2 flex items-center justify-between text-xs font-semibold text-[#e01b24]">
                    <span>Read Full Article</span>
                    <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
