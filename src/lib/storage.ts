import path from "node:path";
import fs from "node:fs";
import { nanoid } from "nanoid";
import { hasSpaces } from "./env";
import { putPublicObject, deleteSpacesObject } from "./spaces";
import { logger } from "./logger";

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/gif",
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/gif": "gif",
};

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

// "cloudinary" only survives on records uploaded before the move to Spaces.
export type StorageProvider = "local" | "spaces" | "cloudinary";

export interface UploadResult {
  url: string;
  publicId?: string; // Spaces object key
  storage: Exclude<StorageProvider, "cloudinary">;
  width?: number;
  height?: number;
  format?: string;
  bytes: number;
  mimeType: string;
}

/**
 * Strip dangerous executable elements and event handlers from SVGs to prevent Stored XSS.
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
 * Auto-detects whether DigitalOcean Spaces is configured via environment variables.
 * If yes -> uploads to Spaces ({folder}/{year}/{month}/{nanoid}.ext), served via its CDN.
 * If no  -> writes to local disk (public/uploads/{year}/{month}/{nanoid}.ext).
 * WHY Spaces in production: Vercel's filesystem is not persistent, so the
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
  let buffer = Buffer.from(arrayBuffer);

  let width: number | undefined;
  let height: number | undefined;
  let format = MIME_TO_EXT[file.type] || "webp";

  // Security: Sanitize SVG or Validate Image Buffers with Sharp
  if (file.type === "image/svg+xml") {
    const rawSvg = buffer.toString("utf8");
    const cleanSvg = sanitizeSvg(rawSvg);
    buffer = Buffer.from(cleanSvg, "utf8");
  } else {
    try {
      const sharpMod = (await import("sharp")).default;
      const meta = await sharpMod(buffer).metadata();
      if (!meta.format) {
        throw new Error("Invalid or corrupted image content");
      }
      width = meta.width;
      height = meta.height;
      if (meta.format) format = meta.format;
    } catch (err) {
      throw new Error(`File integrity check failed: ${err instanceof Error ? err.message : "Not a valid image"}`);
    }
  }

  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const ext = MIME_TO_EXT[file.type] || "webp";
  const id = nanoid(16);
  const filename = `${id}.${ext}`;

  if (hasSpaces()) {
    const key = `${folder}/${year}/${month}/${filename}`;
    const url = await putPublicObject(key, buffer, file.type);
    return {
      url,
      publicId: key,
      storage: "spaces",
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
 * Safely delete an asset from Spaces or local storage.
 */
export async function deleteStoredFile(media: {
  storage: StorageProvider;
  url: string;
  publicId?: string;
}): Promise<void> {
  if (media.storage === "spaces" && media.publicId) {
    await deleteSpacesObject(media.publicId);
  } else if (media.storage === "cloudinary") {
    // Pre-Spaces upload; the Cloudinary SDK is gone, so only the registry
    // entry is removed. Delete the remote copy in the Cloudinary console.
    logger.warn("legacy Cloudinary asset not deleted remotely", { url: media.url, publicId: media.publicId });
  } else if (media.storage === "local" && media.url.startsWith("/uploads/")) {
    const relativePath = media.url.replace(/^\//, "");
    const fullPath = path.join(process.cwd(), "public", relativePath);
    try {
      await fs.promises.unlink(fullPath);
    } catch {
      // Ignore errors if file already deleted or not found
    }
  }
}
