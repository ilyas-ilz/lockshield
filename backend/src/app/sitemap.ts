import type { MetadataRoute } from "next";
import { connectDB } from "@/lib/db";
import { Post, Page, Service, Project, Job } from "@/models";
import { getEnv } from "@/lib/env";

// WHY this fixes the real gap found on the legacy site: sitemap.xml there
// hand-lists 12 URLs while 40+ blog posts exist unlisted. This route
// queries every published document across every content model, so the
// sitemap is always complete and always current — no more manually
// editing an XML file when a post goes live.
export const revalidate = 3600; // regenerate at most hourly; publishing also busts this via revalidateTag once frontend wiring lands

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDB();
  const { SITE_URL } = getEnv();

  const [posts, pages, services, projects, jobs] = await Promise.all([
    Post.find({ status: "published" }).select("slug updatedAt").lean(),
    Page.find({ status: "published" }).select("slug updatedAt").lean(),
    Service.find({ status: "published" }).select("slug updatedAt").lean(),
    Project.find({ publishStatus: "published" }).select("slug updatedAt").lean(),
    Job.find({ status: "published" }).select("slug updatedAt").lean(),
  ]);

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
  for (const p of pages) {
    entries.push({ url: `${SITE_URL}/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "monthly", priority: 0.5 });
  }
  for (const s of services) {
    entries.push({ url: `${SITE_URL}/services/${s.slug}`, lastModified: s.updatedAt, changeFrequency: "monthly", priority: 0.8 });
  }
  for (const p of projects) {
    entries.push({ url: `${SITE_URL}/projects/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "monthly", priority: 0.6 });
  }
  for (const j of jobs) {
    entries.push({ url: `${SITE_URL}/careers/${j.slug}`, lastModified: j.updatedAt, changeFrequency: "weekly", priority: 0.5 });
  }

  return entries;
}
