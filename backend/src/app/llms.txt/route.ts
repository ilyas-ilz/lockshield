import { connectDB } from "@/lib/db";
import { Post, Service, Project } from "@/models";
import { getSettings } from "@/lib/settings";
import { getEnv } from "@/lib/env";

// WHY llms.txt (an emerging convention, not yet a web standard): AI answer
// engines (ChatGPT, Perplexity, Google AI Overviews) increasingly fetch
// this as a curated, high-signal summary of a site instead of crawling
// everything — the GEO half of "SEO and GEO need to be proper". Generated
// from published content so it can never drift out of date the way a
// hand-maintained one would.
export const revalidate = 3600;

export async function GET() {
  await connectDB();
  const { SITE_URL } = getEnv();
  const settings = await getSettings();

  const [services, projects, posts] = await Promise.all([
    Service.find({ status: "published" }).select("title summary slug").sort({ order: 1 }).lean(),
    Project.find({ publishStatus: "published" }).select("title client sector emirate slug").sort({ order: 1 }).limit(20).lean(),
    Post.find({ status: "published" }).select("title excerpt slug").sort({ publishedAt: -1 }).limit(20).lean(),
  ]);

  const lines: string[] = [
    `# ${settings.siteName}`,
    "",
    `> ${settings.legalName} — Civil Defence approved fire protection systems across the UAE: design, installation, testing and 24/7 annual maintenance.`,
    "",
    `Website: ${SITE_URL}`,
    `Contact: ${settings.emails[0] ?? ""}${settings.phones[0] ? ` | ${settings.phones[0]}` : ""}`,
    "",
    "## Services",
    "",
    ...services.map((s) => `- [${s.title}](${SITE_URL}/services/${s.slug}): ${s.summary}`),
    "",
    "## Recent Projects",
    "",
    ...projects.map((p) => `- [${p.title}](${SITE_URL}/projects/${p.slug}): ${p.client} — ${p.sector}, ${p.emirate}`),
    "",
    "## Blog",
    "",
    ...posts.map((p) => `- [${p.title}](${SITE_URL}/blog/${p.slug}): ${p.excerpt}`),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
