/**
 * Copies every project and blog image that is not on Cloudflare R2 yet
 * (static /assets, local /uploads, legacy DigitalOcean Spaces, legacy
 * Cloudinary) into the R2 bucket, then points the database at the R2 copy.
 *
 * Covers: Project coverImage / gallery / clientLogo / seo.ogImage and
 * Post coverImage / seo.ogImage / images inside the Tiptap body. Media
 * library records with the same URL are moved over too, so the admin's
 * library shows the R2 copy.
 *
 * WHY originals are never deleted: the old URLs keep working, so a bad run
 * is undone by restoring the old URLs, not by recovering lost files. Clean
 * up Spaces/Cloudinary by hand once the site is verified.
 *
 * Re-running is safe: URLs already on R2_PUBLIC_URL are skipped, and one
 * source URL used by several documents is uploaded once.
 *
 * Run:  npm run migrate:r2            (dry run: lists what would move)
 *       npm run migrate:r2 -- --apply (uploads to R2 and updates MongoDB)
 */
import "dotenv/config";
import path from "node:path";
import fs from "node:fs";
import mongoose from "mongoose";
import { nanoid } from "nanoid";
import { connectDB } from "../lib/db";
import { hasR2, getEnv } from "../lib/env";
import { putPublicObject } from "../lib/r2";
import { sanitizeSvg } from "../lib/storage";

const EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  avif: "image/avif",
};

export type SourceKind = "r2" | "assets" | "uploads" | "spaces" | "cloudinary" | "skip";

/** Where an image URL currently lives, relative to the configured R2 public host. */
export function classifySource(url: string, r2PublicUrl: string): SourceKind {
  const trimmed = url.trim();
  if (!trimmed) return "skip";
  if (trimmed.startsWith(r2PublicUrl.replace(/\/+$/, "") + "/")) return "r2";
  if (trimmed.startsWith("/assets/")) return "assets";
  if (trimmed.startsWith("/uploads/")) return "uploads";
  let host: string;
  try {
    host = new URL(trimmed).host;
  } catch {
    return "skip";
  }
  if (host.endsWith(".r2.dev")) return "r2";
  if (host.endsWith("digitaloceanspaces.com")) return "spaces";
  if (host === "res.cloudinary.com") return "cloudinary";
  // Unknown third-party hosts are left alone - we don't own those files.
  return "skip";
}

/** Lower-case extension from a URL path, ignoring query strings. */
export function extensionOf(url: string): string {
  const pathname = url.startsWith("/") ? url.split(/[?#]/)[0]! : new URL(url).pathname;
  return path.extname(pathname).slice(1).toLowerCase();
}

/** Returns a copy of a Tiptap document with image node srcs replaced via `map`. */
export function rewriteBodyImages(node: unknown, map: (src: string) => string): unknown {
  if (Array.isArray(node)) return node.map((child) => rewriteBodyImages(child, map));
  if (!node || typeof node !== "object") return node;
  const n = node as { type?: string; attrs?: Record<string, unknown>; content?: unknown[] };
  const next: Record<string, unknown> = { ...n };
  if (n.type === "image" && typeof n.attrs?.src === "string") {
    next.attrs = { ...n.attrs, src: map(n.attrs.src) };
  }
  if (Array.isArray(n.content)) next.content = n.content.map((child) => rewriteBodyImages(child, map));
  return next;
}

/** Every image src inside a Tiptap document. */
export function collectBodyImages(node: unknown, out: string[] = []): string[] {
  if (Array.isArray(node)) {
    node.forEach((child) => collectBodyImages(child, out));
    return out;
  }
  if (!node || typeof node !== "object") return out;
  const n = node as { type?: string; attrs?: { src?: unknown }; content?: unknown[] };
  if (n.type === "image" && typeof n.attrs?.src === "string") out.push(n.attrs.src);
  if (Array.isArray(n.content)) n.content.forEach((child) => collectBodyImages(child, out));
  return out;
}

async function loadBytes(url: string, kind: SourceKind): Promise<Buffer> {
  if (kind === "assets" || kind === "uploads") {
    const file = path.join(process.cwd(), "public", decodeURIComponent(url.split(/[?#]/)[0]!));
    return fs.promises.readFile(file);
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

type ImageRef = { url?: string; publicId?: string } | null | undefined;

interface Migrated {
  url: string;
  key: string;
}

async function main() {
  const apply = process.argv.includes("--apply");
  if (!hasR2()) {
    throw new Error("R2 is not fully configured - run `npm run doctor` (R2_PUBLIC_URL is the usual missing one)");
  }
  const publicUrl = getEnv().R2_PUBLIC_URL!;

  await connectDB();
  const db = mongoose.connection.db!;
  console.log(`[migrate-r2] connected to "${mongoose.connection.name}" (${apply ? "APPLY" : "dry run"})`);

  const done = new Map<string, Migrated>(); // source URL -> R2 copy
  const failed = new Map<string, string>(); // source URL -> reason
  const counts: Record<string, number> = {};

  /** Uploads one source (once) and returns its R2 copy, or undefined to leave the URL as is. */
  async function migrate(url: string | undefined, folder: "projects" | "posts"): Promise<Migrated | undefined> {
    if (!url) return undefined;
    const kind = classifySource(url, publicUrl);
    counts[kind] = (counts[kind] ?? 0) + 1;
    if (kind === "r2" || kind === "skip") return undefined;
    if (done.has(url)) return done.get(url);
    if (failed.has(url)) return undefined;

    const ext = extensionOf(url);
    const mime = EXT_TO_MIME[ext];
    if (!mime) {
      failed.set(url, `unsupported extension ".${ext}"`);
      return undefined;
    }
    const now = new Date();
    const key = `lockshield/${folder}/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${nanoid(16)}.${ext === "jpeg" ? "jpg" : ext}`;

    if (!apply) {
      if ((kind === "assets" || kind === "uploads") && !fs.existsSync(path.join(process.cwd(), "public", url.split(/[?#]/)[0]!))) {
        failed.set(url, "file not found under public/");
        return undefined;
      }
      const planned = { url: `${publicUrl.replace(/\/+$/, "")}/${key}`, key };
      done.set(url, planned);
      console.log(`  [${kind}] ${url}`);
      return planned;
    }

    try {
      let body = await loadBytes(url, kind);
      if (mime === "image/svg+xml") body = Buffer.from(sanitizeSvg(body.toString("utf8")), "utf8");
      const r2Url = await putPublicObject(key, body, mime);
      const result = { url: r2Url, key };
      done.set(url, result);
      console.log(`  [${kind}] ${url}\n      -> ${r2Url}`);
      return result;
    } catch (err) {
      failed.set(url, err instanceof Error ? err.message : String(err));
      return undefined;
    }
  }

  /** $set entries for an embedded image object at `field`. */
  async function imageSet(field: string, ref: ImageRef, folder: "projects" | "posts", set: Record<string, unknown>) {
    const m = await migrate(ref?.url, folder);
    if (m) {
      set[`${field}.url`] = m.url;
      set[`${field}.publicId`] = m.key;
    }
  }

  let docsChanged = 0;

  console.log("\nProjects");
  for (const p of await db.collection("projects").find({}).toArray()) {
    const set: Record<string, unknown> = {};
    await imageSet("coverImage", p.coverImage, "projects", set);
    await imageSet("clientLogo", p.clientLogo, "projects", set);
    const gallery = (p.gallery ?? []) as ImageRef[];
    for (let i = 0; i < gallery.length; i++) await imageSet(`gallery.${i}`, gallery[i], "projects", set);
    const og = await migrate(p.seo?.ogImage, "projects");
    if (og) set["seo.ogImage"] = og.url;
    if (Object.keys(set).length > 0) {
      docsChanged++;
      if (apply) await db.collection("projects").updateOne({ _id: p._id }, { $set: set });
    }
  }

  console.log("\nBlog posts");
  for (const p of await db.collection("posts").find({}).toArray()) {
    const set: Record<string, unknown> = {};
    await imageSet("coverImage", p.coverImage, "posts", set);
    const og = await migrate(p.seo?.ogImage, "posts");
    if (og) set["seo.ogImage"] = og.url;
    let bodyChanged = false;
    for (const src of collectBodyImages(p.body)) {
      if (await migrate(src, "posts")) bodyChanged = true;
    }
    if (bodyChanged) set.body = rewriteBodyImages(p.body, (src) => done.get(src)?.url ?? src);
    if (Object.keys(set).length > 0) {
      docsChanged++;
      if (apply) await db.collection("posts").updateOne({ _id: p._id }, { $set: set });
    }
  }

  // Keep the admin media library in step with the documents that use it.
  let mediaChanged = 0;
  for (const [source, copy] of done) {
    if (!apply) continue;
    const res = await db
      .collection("media")
      .updateMany({ url: source }, { $set: { url: copy.url, publicId: copy.key, storage: "r2" } });
    mediaChanged += res.modifiedCount;
  }

  console.log(`\n[migrate-r2] image refs by source: ${JSON.stringify(counts)}`);
  console.log(`[migrate-r2] ${done.size} unique file(s) ${apply ? "copied to R2" : "would be copied"}, ${docsChanged} document(s) ${apply ? "updated" : "would change"}${apply ? `, ${mediaChanged} media record(s) updated` : ""}`);
  if (failed.size > 0) {
    console.log(`[migrate-r2] ${failed.size} file(s) NOT migrated (their URLs were left unchanged):`);
    for (const [url, reason] of failed) console.log(`  ${url}  - ${reason}`);
  }
  if (!apply && done.size > 0) console.log("\nRe-run with --apply to copy the files and update the database.");
  await mongoose.disconnect();
}

// Only run when executed directly (tests import the helpers).
if (process.argv[1]?.replace(/\\/g, "/").endsWith("scripts/migrate-images-to-r2.ts")) {
  main().catch(async (err) => {
    console.error("[migrate-r2] failed:", err instanceof Error ? err.message : err);
    await mongoose.disconnect();
    process.exit(1);
  });
}
