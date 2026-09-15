import path from "node:path";
import fs from "node:fs";
import { nanoid } from "nanoid";
import { getEnv, hasCloudinary } from "./env";
import { v2 as cloudinary } from "cloudinary";

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

export interface UploadResult {
  url: string;
  publicId?: string;
  storage: "local" | "cloudinary";
  width?: number;
  height?: number;
  format?: string;
  bytes: number;
  mimeType: string;
}

/**
 * Single entry point for file uploads across Lock Shield.
 * Auto-detects whether Cloudinary is configured via environment variables.
 * If yes -> uploads to Cloudinary with secure delivery.
 * If no  -> writes to local disk (public/uploads/{year}/{month}/{nanoid}.ext)
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

  if (hasCloudinary()) {
    const env = getEnv();
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    return new Promise<UploadResult>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "auto",
        },
        (error, result) => {
          if (error || !result) {
            return reject(
              error || new Error("Cloudinary upload failed with empty response")
            );
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            storage: "cloudinary",
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
            mimeType: file.type,
          });
        }
      );
      stream.end(buffer);
    });
  }

  // Local storage fallback (Zero external keys required)
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const uploadDir = path.join(process.cwd(), "public", "uploads", year, month);

  await fs.promises.mkdir(uploadDir, { recursive: true });

  const ext = MIME_TO_EXT[file.type] || "webp";
  const id = nanoid(16);
  const filename = `${id}.${ext}`;
  const filePath = path.join(uploadDir, filename);

  await fs.promises.writeFile(filePath, buffer);

  let width: number | undefined;
  let height: number | undefined;
  let format = ext;

  if (file.type !== "image/svg+xml") {
    try {
      const sharpMod = (await import("sharp")).default;
      const meta = await sharpMod(buffer).metadata();
      width = meta.width;
      height = meta.height;
      if (meta.format) format = meta.format;
    } catch {
      // Sharp failure shouldn't abort an otherwise valid upload
    }
  }

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
 * Safely delete an asset from either local storage or Cloudinary.
 */
export async function deleteStoredFile(media: {
  storage: "local" | "cloudinary";
  url: string;
  publicId?: string;
}): Promise<void> {
  if (media.storage === "cloudinary" && media.publicId) {
    const { destroyCloudinaryAsset } = await import("./cloudinary");
    await destroyCloudinaryAsset(media.publicId);
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
