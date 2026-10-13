import { cache } from "react";
import { unstable_cache } from "next/cache";
import { connectDB } from "./db";
import { getSettings } from "./settings";
import { PUBLIC_PAGE_SIZE, parsePage, totalPagesFor } from "./public-listing";
import { publicTag, SETTINGS_TAG } from "./revalidate";
import { defaultBlogCover } from "./default-images";
import { Post, Project, Service } from "@/models";
import type { ISettings } from "@/models/Settings";

/**
 * WHY a 5-minute ceiling on the data cache: matches the pages' ISR window, so
 * a write that somehow bypassed the admin (seed script, manual Atlas edit)
 * still shows up within the same time the rest of the site would.
 * Admin saves bust these instantly via revalidateTag in lib/revalidate.ts.
 */
const DATA_TTL = 300;

/**
 * The Settings singleton for public pages (Navbar, Footer, home JSON-LD,
 * contact). WHY both caches: unstable_cache keeps it across requests, so the
 * per-request listing pages don't hit Mongo for it every time; React cache()
 * dedupes the layout + page reading it in the same render. Returned as a
 * plain object - unstable_cache JSON-serializes anyway.
 */
export const getPublicSettings = cache(
  unstable_cache(
    async (): Promise<ISettings> => {
      const doc = await getSettings();
      return JSON.parse(
        JSON.stringify(doc.toObject ? doc.toObject() : doc),
      ) as ISettings;
    },
    ["public-settings"],
    { tags: [SETTINGS_TAG], revalidate: DATA_TTL },
  ),
);

/** /blog grid: one page of published posts (summary fields only - never the body). */
export const loadBlogListing = unstable_cache(
  async (requestedPage: number) => {
    await connectDB();
    const filter = { status: "published" };
    const total = await Post.countDocuments(filter);
    const totalPages = totalPagesFor(total, PUBLIC_PAGE_SIZE);
    const page = parsePage(String(requestedPage), totalPages);
    const posts = await Post.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip((page - 1) * PUBLIC_PAGE_SIZE)
      .limit(PUBLIC_PAGE_SIZE)
      .select("title slug excerpt coverImage publishedAt")
      .lean();
    return {
      total,
      totalPages,
      page,
      posts: posts.map((p) => ({
        _id: String(p._id),
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        coverImage: p.coverImage?.url
          ? { url: p.coverImage.url, alt: p.coverImage.alt }
          : defaultBlogCover(p.title),
        publishedAt: p.publishedAt
          ? new Date(p.publishedAt).toISOString()
          : undefined,
      })),
    };
  },
  ["public-blog-listing"],
  { tags: [publicTag("Post")], revalidate: DATA_TTL },
);

/**
 * Sector tabs for /projects, from the whole published collection so they stay
 * identical on every page. Also the allow-list for `?sector=` cache keys.
 */
export const loadProjectSectors = unstable_cache(
  async (): Promise<string[]> => {
    await connectDB();
    const all = await Project.distinct("sector", {
      publishStatus: "published",
    });
    return (all as unknown[])
      .filter(
        (value): value is string =>
          typeof value === "string" && value.trim() !== "",
      )
      .sort((a, b) => a.localeCompare(b));
  },
  ["public-project-sectors"],
  { tags: [publicTag("Project")], revalidate: DATA_TTL },
);

/**
 * /projects grid: one page, optionally one sector. Callers must pass only a
 * sector from loadProjectSectors() (or undefined) - see pageKey for why.
 */
export const loadProjectListing = unstable_cache(
  async (requestedPage: number, sector: string | undefined) => {
    await connectDB();
    const baseFilter: Record<string, unknown> = { publishStatus: "published" };
    const filter = sector ? { ...baseFilter, sector } : baseFilter;
    const total = await Project.countDocuments(filter);
    const totalPages = totalPagesFor(total, PUBLIC_PAGE_SIZE);
    const page = parsePage(String(requestedPage), totalPages);

    const found = await Project.find(filter)
      .sort({ featured: -1, createdAt: -1 })
      .skip((page - 1) * PUBLIC_PAGE_SIZE)
      .limit(PUBLIC_PAGE_SIZE)
      .select("title slug client sector emirate year coverImage")
      .lean();

    const projects = found.map((p) => ({
      _id: String(p._id),
      title: String(p.title || ""),
      slug: String(p.slug || ""),
      client: p.client ? String(p.client) : undefined,
      sector: p.sector ? String(p.sector) : undefined,
      emirate: p.emirate ? String(p.emirate) : undefined,
      year: typeof p.year === "number" ? p.year : undefined,
      coverImage: p.coverImage?.url
        ? {
            url: String(p.coverImage.url),
            alt: p.coverImage.alt ? String(p.coverImage.alt) : undefined,
          }
        : undefined,
    }));

    return { total, totalPages, page, projects };
  },
  ["public-project-listing"],
  { tags: [publicTag("Project")], revalidate: DATA_TTL },
);

/** /services grid: one page of published services. */
export const loadServiceListing = unstable_cache(
  async (requestedPage: number) => {
    await connectDB();
    const filter = { status: "published" };
    const total = await Service.countDocuments(filter);
    const totalPages = totalPagesFor(total, PUBLIC_PAGE_SIZE);
    const page = parsePage(String(requestedPage), totalPages);
    const found = await Service.find(filter)
      .sort({ order: 1, title: 1 })
      .skip((page - 1) * PUBLIC_PAGE_SIZE)
      .limit(PUBLIC_PAGE_SIZE)
      .select("title slug summary")
      .lean();
    const services = found.map((s) => ({
      title: String(s.title ?? ""),
      slug: String(s.slug ?? ""),
      summary: String(s.summary ?? ""),
    }));
    return { total, totalPages, page, services };
  },
  ["public-service-listing"],
  { tags: [publicTag("Service")], revalidate: DATA_TTL },
);

/**
 * Published-document lookups shared by a detail page and its
 * generateMetadata. WHY React cache(): both run in the same request and
 * used to issue the identical findOne twice; cache() dedupes them per
 * request (it is not a cross-request cache - ISR handles that).
 * Errors propagate so each caller keeps its own fallback behaviour.
 */
export const getPublishedPost = cache(async (slug: string) => {
  await connectDB();
  return Post.findOne({ slug, status: "published" }).lean();
});

export const getPublishedProject = cache(async (slug: string) => {
  await connectDB();
  return Project.findOne({ slug, publishStatus: "published" }).lean();
});

export const getPublishedService = cache(async (slug: string) => {
  await connectDB();
  return Service.findOne({ slug, status: "published" }).lean();
});

type SlugParams = { slug: string }[];

/**
 * generateStaticParams helper. WHY it exists at all: in Next 15 a dynamic
 * [slug] route without generateStaticParams is rendered on every request
 * (Cache-Control: no-store) even with `export const revalidate`. Exporting
 * it - even with an empty list - opts the route into ISR, so unlisted slugs
 * are rendered once on first visit and then served from cache.
 * WHY swallow errors: the build must not fail because the DB is briefly
 * unreachable; an empty list just means pages render on first request.
 */
async function slugsOf(
  load: () => Promise<{ slug?: unknown }[]>,
): Promise<SlugParams> {
  try {
    await connectDB();
    const docs = await load();
    return docs
      .filter(
        (d): d is { slug: string } =>
          typeof d.slug === "string" && d.slug !== "",
      )
      .map((d) => ({ slug: d.slug }));
  } catch {
    return [];
  }
}

export const publishedPostSlugs = () =>
  slugsOf(() => Post.find({ status: "published" }).select("slug").lean());
export const publishedProjectSlugs = () =>
  slugsOf(() =>
    Project.find({ publishStatus: "published" }).select("slug").lean(),
  );
export const publishedServiceSlugs = () =>
  slugsOf(() => Service.find({ status: "published" }).select("slug").lean());
