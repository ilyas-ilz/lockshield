import path from "node:path";
import fs from "node:fs";
import { nanoid } from "nanoid";
import { hasR2 } from "./env";
import { putPublicObject, deleteR2Object } from "./r2";
import { logger } from "./logger";

/**
 * WHY no SVG: an SVG is a document that can carry script, and uploads are
 * served from cdn.lockshield.ae - same site as the admin - so a crafted SVG
 * opened directly could act on an admin session. The regex sanitizer below
 * was shown to be bypassable (entities, split tags, unterminated <script>),
 * and HTML sanitizers can't be made airtight for SVG cheaply. Raster formats
 * can't execute anything, so uploads are raster-only. Logos that need to be
 * vector belong in /public/assets (reviewed in git), not in the uploader.
 */
export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

/** The format sharp must detect for each declared type (see uploadFile). */
const MIME_TO_SHARP_FORMAT: Record<string, string> = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

/**
 * Shape of every key uploadFile writes: {folder}/{yyyy}/{mm}/{nanoid16}.{ext}
 * under one of the fixed upload folders (api/upload/route.ts).
 * WHY deletion checks it: a Media record's publicId decides which object is
 * deleted, so without this a forged record could delete any key in the bucket.
 */
export const R2_UPLOAD_KEY = /^lockshield\/(?:posts|pages|services|projects|jobs|media)\/\d{4}\/\d{2}\/[\w-]{16}\.(?:jpg|png|webp|gif)$/;

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

// "spaces" (DigitalOcean) and "cloudinary" only survive on records uploaded
// before the move to Cloudflare R2.
export type StorageProvider = "local" | "r2" | "spaces" | "cloudinary";

export interface UploadResult {
  url: string;
  publicId?: string; // R2 object key
  storage: "local" | "r2";
  width?: number;
  height?: number;
  format?: string;
  bytes: number;
  mimeType: string;
}

/**
 * Strip dangerous executable elements and event handlers from SVGs.
 * Best-effort only - NOT a security boundary (see ALLOWED_MIME_TYPES). Kept
 * for the image migration script, which only copies SVGs already reviewed
 * into /public/assets.
 */
export function sanitizeSvg(svgContent: string): string {
  return svgContent
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\bon\w+\s*=\s*(["'])[\s\S]*?\1/gi, "")
    .replace(/\bon\w+\s*=\s*[^>\s]+/gi, "")
    .replace(/<foreignObject\b[^<]*(?:(?!<\/foreignObject>)<[^<]*)*<\/foreignObject>/gi, "")
    .replace(/href\s*=\s*(["'])javascript:[\s\S]*?\1/gi, "");
}

/**
 * Single entry point for file uploads across Lock Shield.
 * Auto-detects whether Cloudflare R2 is configured via environment variables.
 * If yes -> uploads to R2 ({folder}/{year}/{month}/{nanoid}.ext), served from
 *           the bucket's public domain through Cloudflare's CDN.
 * If no  -> writes to local disk (public/uploads/{year}/{month}/{nanoid}.ext).
 * WHY R2 in production: Vercel's filesystem is not persistent, so the
 * local fallback only suits dev and disk-backed hosts.
 */
export async function uploadFile(
  file: File,
  folder: string = "lockshield"
): Promise<UploadResult> {
  if (!ALLOWED_MIME_TYPES.includes(file.type as AllowedMimeType)) {
    throw new Error(
      `Unsupported file type: ${file.type}. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`
    );
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `File size exceeds maximum limit of 10MB (${(file.size / (1024 * 1024)).toFixed(1)}MB provided)`
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let width: number | undefined;
  let height: number | undefined;
  let format = MIME_TO_EXT[file.type] || "webp";

  // Security: decode the bytes and require the real format to match the
  // declared one. WHY: file.type is whatever the client sent - without this,
  // an SVG/HTML payload labelled image/png would be stored and served as-is.
  try {
    const sharpMod = (await import("sharp")).default;
    const meta = await sharpMod(buffer).metadata();
    if (!meta.format) {
      throw new Error("Invalid or corrupted image content");
    }
    if (meta.format !== MIME_TO_SHARP_FORMAT[file.type]) {
      throw new Error(`content is ${meta.format}, not ${file.type}`);
    }
    width = meta.width;
    height = meta.height;
    format = meta.format;
  } catch (err) {
    throw new Error(`File integrity check failed: ${err instanceof Error ? err.message : "Not a valid image"}`);
  }

  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const ext = MIME_TO_EXT[file.type] || "webp";
  const id = nanoid(16);
  const filename = `${id}.${ext}`;

  if (hasR2()) {
    const key = `${folder}/${year}/${month}/${filename}`;
    const url = await putPublicObject(key, buffer, file.type);
    return {
      url,
      publicId: key,
      storage: "r2",
      width,
      height,
      format,
      bytes: buffer.length,
      mimeType: file.type,
    };
  }

  // Local storage fallback (Zero external keys required)
  const uploadDir = path.join(process.cwd(), "public", "uploads", year, month);

  await fs.promises.mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, filename);

  await fs.promises.writeFile(filePath, buffer);

  return {
    url: `/uploads/${year}/${month}/${filename}`,
    storage: "local",
    width,
    height,
    format,
    bytes: buffer.length,
    mimeType: file.type,
  };
}

/**
 * Safely delete an asset from R2 or local storage.
 */
export async function deleteStoredFile(media: {
  storage: StorageProvider;
  url: string;
  publicId?: string;
}): Promise<void> {
  if (media.storage === "r2" && media.publicId) {
    if (!R2_UPLOAD_KEY.test(media.publicId)) {
      logger.warn("refusing to delete R2 key outside the upload layout", { publicId: media.publicId });
      return;
    }
    await deleteR2Object(media.publicId);
  } else if (media.storage === "spaces" || media.storage === "cloudinary") {
    // Pre-R2 upload; that provider's client is gone, so only the registry
    // entry is removed. Delete the remote copy in the provider's console.
    logger.warn("legacy asset not deleted remotely", { storage: media.storage, url: media.url, publicId: media.publicId });
  } else if (media.storage === "local" && media.url.startsWith("/uploads/")) {
    // WHY resolve + prefix check: "/uploads/../../.env" passes startsWith()
    // but path.join() walks it out of public/uploads.
    const uploadsRoot = path.resolve(process.cwd(), "public", "uploads");
    const fullPath = path.resolve(process.cwd(), "public", media.url.replace(/^\//, ""));
    if (!fullPath.startsWith(uploadsRoot + path.sep)) {
      logger.warn("refusing to delete local path outside public/uploads", { url: media.url });
      return;
    }
    try {
      await fs.promises.unlink(fullPath);
    } catch {
      // Ignore errors if file already deleted or not found
    }
  }
}
