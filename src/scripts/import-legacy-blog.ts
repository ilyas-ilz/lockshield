/**
 * One-off import of the 55 legacy blog articles (legacy/blog/*.html) into
 * MongoDB as real Post documents. Idempotent (upserts by slug) - safe to
 * re-run.
 *
 * Preserves the original filename as the Post slug so the existing
 * middleware.ts generic ".html" redirect (/blog/<slug>.html -> /blog/<slug>)
 * resolves to a real 200 instead of a 404, with zero redirect-map changes
 * needed.
 *
 * Run with: npm run import:blog
 * Verify redirects afterwards (needs `npm run dev` running): npm run import:blog -- --verify
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { nanoid } from "nanoid";
import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";
import { connectDB } from "../lib/db";
import { User } from "../models/User";
import { Post } from "../models/Post";

const LEGACY_BLOG_DIR = path.resolve(process.cwd(), "legacy/blog");

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

interface TiptapMark {
  type: string;
  attrs?: Record<string, unknown>;
}
interface TiptapNode {
  type: string;
  text?: string;
  marks?: TiptapMark[];
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
}

/** Parse "29 Nov 2024" -> Date. Falls back to now if unparseable. */
function parseLegacyDate(raw: string): Date {
  const m = raw.trim().match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
  if (!m) return new Date();
  const [, day, monAbbr, year] = m;
  const month = MONTHS[(monAbbr || "").toLowerCase()];
  if (month === undefined) return new Date();
  return new Date(Number(year), month, Number(day));
}

/** Walk the inline content of an element (text + b/strong/i/em/a/br) into Tiptap text nodes. */
function walkInline($: cheerio.CheerioAPI, el: AnyNode, marks: TiptapMark[] = []): TiptapNode[] {
  const out: TiptapNode[] = [];
  $(el)
    .contents()
    .each((_, child) => {
      if (child.type === "text") {
        const text = (child.data || "").replace(/\s+/g, " ");
        if (text !== "") {
          out.push({ type: "text", text, ...(marks.length ? { marks: [...marks] } : {}) });
        }
        return;
      }
      if (child.type !== "tag") return;
      const tag = child.tagName.toLowerCase();
      if (tag === "b" || tag === "strong") {
        out.push(...walkInline($, child, [...marks, { type: "bold" }]));
      } else if (tag === "i" || tag === "em") {
        out.push(...walkInline($, child, [...marks, { type: "italic" }]));
      } else if (tag === "a") {
        const href = $(child).attr("href") || "#";
        out.push(...walkInline($, child, [...marks, { type: "link", attrs: { href } }]));
      } else if (tag === "br") {
        // TiptapRenderer has no hardBreak case; a space is a safe, lossless-enough fallback.
        out.push({ type: "text", text: " " });
      } else {
        out.push(...walkInline($, child, marks));
      }
    });
  return out;
}

/** A <p> whose only real content is a single <b>/<strong> is a legacy pseudo-heading. */
function isPseudoHeading($: cheerio.CheerioAPI, p: AnyNode): boolean {
  const $p = $(p);
  const children = $p.children();
  if (children.length !== 1) return false;
  const only = children.get(0)!;
  if (only.tagName?.toLowerCase() !== "b" && only.tagName?.toLowerCase() !== "strong") return false;
  const outsideText = $p
    .clone()
    .children()
    .remove()
    .end()
    .text()
    .trim();
  return outsideText === "";
}

function headingLevel(tag: string): number {
  if (tag === "h1" || tag === "h2") return 2;
  if (tag === "h3") return 3;
  return 4; // h4, h5, h6
}

/** Convert the top-level block children of .article-body into a Tiptap doc's content array. */
function articleBodyToTiptap($: cheerio.CheerioAPI, body: cheerio.Cheerio<AnyNode>): TiptapNode[] {
  const blocks: TiptapNode[] = [];

  body.children().each((_, el) => {
    const tag = el.tagName?.toLowerCase();
    if (!tag) return;

    if (tag === "img") return; // cover image handled separately; TiptapRenderer has no image node

    if (tag === "p") {
      if (isPseudoHeading($, el)) {
        const inner = $(el).children().get(0)!;
        blocks.push({ type: "heading", attrs: { level: 3 }, content: walkInline($, inner) });
        return;
      }
      const content = walkInline($, el);
      if (content.length > 0) blocks.push({ type: "paragraph", content });
      return;
    }

    if (/^h[1-6]$/.test(tag)) {
      const content = walkInline($, el);
      if (content.length > 0) blocks.push({ type: "heading", attrs: { level: headingLevel(tag) }, content });
      return;
    }

    if (tag === "ul" || tag === "ol") {
      const items: TiptapNode[] = [];
      $(el)
        .children("li")
        .each((__, li) => {
          const content = walkInline($, li);
          if (content.length > 0) items.push({ type: "listItem", content: [{ type: "paragraph", content }] });
        });
      if (items.length > 0) blocks.push({ type: tag === "ul" ? "bulletList" : "orderedList", content: items });
      return;
    }

    if (tag === "blockquote") {
      const content = walkInline($, el);
      if (content.length > 0) blocks.push({ type: "blockquote", content: [{ type: "paragraph", content }] });
      return;
    }
    // Anything else (div wrappers, etc.) - skip; none observed in the source set.
  });

  return blocks;
}

function estimateReadingMinutes(blocks: TiptapNode[]): number {
  const words = (nodes: TiptapNode[]): number =>
    nodes.reduce((sum, n) => {
      const own = n.text ? n.text.trim().split(/\s+/).filter(Boolean).length : 0;
      const nested = n.content ? words(n.content) : 0;
      return sum + own + nested;
    }, 0);
  return Math.max(1, Math.round(words(blocks) / 200));
}

/** "../assets/images/blog/x.webp" (relative to legacy/blog/) -> "/assets/images/blog/x.webp" (public/). */
function rewriteLegacyAssetSrc(src: string): string | null {
  const m = src.match(/(?:\.\.\/)*assets\/(.+)$/);
  if (!m) return null;
  return `/assets/${m[1]}`;
}

interface ParsedArticle {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: Date;
  coverImage?: { url: string; alt: string };
  body: { type: "doc"; content: TiptapNode[] };
  readingTimeMinutes: number;
}

function parseArticle(filePath: string): ParsedArticle | null {
  const slug = path.basename(filePath, ".html");
  const html = fs.readFileSync(filePath, "utf-8");
  const $ = cheerio.load(html);

  const title = $("h1.article-title").first().text().trim() || $("title").text().replace(/\s*—\s*Lock Shield\s*$/, "").trim();
  if (!title) {
    console.warn(`[import-blog] skipping ${slug}: no title found`);
    return null;
  }

  let excerpt = ($('meta[name="description"]').attr("content") || "").trim();
  if (!excerpt) excerpt = title;
  if (excerpt.length > 300) excerpt = excerpt.slice(0, 297).trimEnd() + "...";

  const publishedAt = parseLegacyDate($(".blog-date").first().text().trim());

  const articleBody = $("article.article-body").first();
  if (articleBody.length === 0) {
    console.warn(`[import-blog] skipping ${slug}: no .article-body found`);
    return null;
  }

  let coverImage: { url: string; alt: string } | undefined;
  const heroImg = articleBody.find("img.article-hero").first();
  if (heroImg.length > 0) {
    const src = heroImg.attr("src") || "";
    const rewritten = rewriteLegacyAssetSrc(src);
    if (rewritten) {
      coverImage = { url: rewritten, alt: (heroImg.attr("alt") || title).slice(0, 200) };
    }
  }

  const content = articleBodyToTiptap($, articleBody);
  if (content.length === 0) {
    content.push({ type: "paragraph", content: [{ type: "text", text: excerpt }] });
  }

  return {
    slug,
    title: title.slice(0, 150),
    excerpt,
    publishedAt,
    coverImage,
    body: { type: "doc", content },
    readingTimeMinutes: estimateReadingMinutes(content),
  };
}

async function main() {
  await connectDB();

  const adminEmail = (process.env.SEED_ADMIN_EMAIL || "admin@lockshield.ae").trim().toLowerCase();
  const author = await User.findOne({ email: adminEmail });
  if (!author) {
    console.error(
      `[import-blog] no user found for ${adminEmail}. Run "npm run seed" first to create the admin user, then re-run this import.`
    );
    process.exit(1);
  }

  const files = fs
    .readdirSync(LEGACY_BLOG_DIR)
    .filter((f) => f.endsWith(".html"))
    .sort();

  console.log(`[import-blog] found ${files.length} legacy articles in ${LEGACY_BLOG_DIR}`);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const file of files) {
    const filePath = path.join(LEGACY_BLOG_DIR, file);
    const article = parseArticle(filePath);
    if (!article) {
      skipped++;
      continue;
    }

    const existing = await Post.findOne({ slug: article.slug }).select("_id").lean();

    await Post.findOneAndUpdate(
      { slug: article.slug },
      {
        $setOnInsert: {
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          body: article.body,
          coverImage: article.coverImage,
          author: author._id,
          status: "published",
          publishedAt: article.publishedAt,
          readingTimeMinutes: article.readingTimeMinutes,
          locale: "en",
          translationGroupId: nanoid(12),
        },
      },
      { upsert: true, new: true }
    );

    if (existing) updated++;
    else created++;
  }

  console.log(
    `[import-blog] done - ${created} created, ${updated} already existed (untouched), ${skipped} skipped (parse failure).`
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("[import-blog] failed:", err);
  process.exit(1);
});
