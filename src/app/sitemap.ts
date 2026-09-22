import type { MetadataRoute } from "next";
import { connectDB } from "@/lib/db";
import { Post, Service, Project } from "@/models";
import { getEnv } from "@/lib/env";

// WHY this fixes the real gap found on the legacy site: sitemap.xml there
// hand-lists 12 URLs while 40+ blog posts exist unlisted. This route
// queries every published document across every content model, so the
// sitemap is always complete and always current — no more manually
// editing an XML file when a post goes live.
export const revalidate = 3600; // regenerate at most hourly; an admin publish also busts it explicitly via lib/revalidate.ts

type SlugDoc = { slug?: unknown; updatedAt?: Date };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { SITE_URL } = getEnv();

  // WHY the try/catch: this is the only public route that talked to Mongo
  // without a fallback, so an unreachable database failed the whole
  // `next build` at the prerender step ("Export encountered an error on
  // /sitemap.xml") rather than degrading. Every page under (public) already
  // falls back to static content; the sitemap now does the same and simply
  // ships the fixed top-level URLs, which always resolve.
  let posts: SlugDoc[] = [];
  let services: SlugDoc[] = [];
  let projects: SlugDoc[] = [];

  try {
    await connectDB();

    // NOTE: Page and Job documents are deliberately not queried. A sitemap must
    // only advertise URLs that resolve, and there is currently no route rendering
    // a Page, nor a /career/[slug] route. Add each back in the same change that
    // adds its route.
    [posts, services, projects] = await Promise.all([
      Post.find({ status: "published" }).select("slug updatedAt").lean() as Promise<SlugDoc[]>,
      Service.find({ status: "published" }).select("slug updatedAt").lean() as Promise<SlugDoc[]>,
      Project.find({ publishStatus: "published" }).select("slug updatedAt").lean() as Promise<SlugDoc[]>,
    ]);
  } catch {
    // Fall through with the static entries below.
    void 0;
  }

  const entries: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/services`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/projects`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/career`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  ];

  for (const p of posts) {
    entries.push({ url: `${SITE_URL}/blog/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "monthly", priority: 0.6 });
  }
  for (const s of services) {
    entries.push({ url: `${SITE_URL}/services/${s.slug}`, lastModified: s.updatedAt, changeFrequency: "monthly", priority: 0.8 });
  }
  for (const p of projects) {
    entries.push({ url: `${SITE_URL}/projects/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "monthly", priority: 0.6 });
  }

  return entries;
}
