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

type ContentDoc = Record<string, unknown>;

export async function GET() {
  const { SITE_URL } = getEnv();

  // WHY the try/catch: an unreachable database used to fail the whole
  // `next build` here at the prerender step, the same way it did for
  // /sitemap.xml. Degrade to the site-level header instead — a short
  // llms.txt is fine, a broken build is not.
  let settings: Awaited<ReturnType<typeof getSettings>> | null = null;
  let services: ContentDoc[] = [];
  let projects: ContentDoc[] = [];
  let posts: ContentDoc[] = [];

  try {
    await connectDB();
    settings = await getSettings();

    [services, projects, posts] = await Promise.all([
      Service.find({ status: "published" }).select("title summary slug").sort({ order: 1 }).lean() as Promise<ContentDoc[]>,
      Project.find({ publishStatus: "published" }).select("title client sector emirate slug").sort({ order: 1 }).limit(20).lean() as Promise<ContentDoc[]>,
      Post.find({ status: "published" }).select("title excerpt slug").sort({ publishedAt: -1 }).limit(20).lean() as Promise<ContentDoc[]>,
    ]);
  } catch {
    void 0;
  }

  const siteName = settings?.siteName ?? "Lock Shield";
  const legalName = settings?.legalName ?? "LOCK SHIELD Firefighting and Safety Equipment Installation LLC";
  const email = settings?.emails?.[0] ?? "";
  const phone = settings?.phones?.[0] ?? "";

  const lines: string[] = [
    `# ${siteName}`,
    "",
    `> ${legalName} — Civil Defence approved fire protection systems across the UAE: design, installation, testing and 24/7 annual maintenance.`,
    "",
    `Website: ${SITE_URL}`,
    `Contact: ${email}${phone ? ` | ${phone}` : ""}`,
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
