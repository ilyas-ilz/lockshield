import { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { handleApi, created, ApiError } from "@/lib/http";
import { requireRole, STAFF } from "@/lib/rbac";
import { uploadFile } from "@/lib/storage";
import { Media } from "@/models/Media";
import { writeAudit } from "@/lib/audit";
import { getClientIp } from "@/lib/rate-limit";

// WHY a fixed folder set: the folder becomes the Spaces object key prefix,
// so a free-form value would let a staff session write anywhere in the bucket.
const folderSchema = z.enum(["posts", "pages", "services", "projects", "jobs", "media"]).catch("media");

export async function POST(req: NextRequest) {
  return handleApi(async () => {
    const actor = await requireRole(...STAFF);

    const formData = await req.formData().catch(() => null);
    if (!formData) {
      throw new ApiError(400, "Expected multipart/form-data with a file field");
    }

    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      throw new ApiError(400, "No valid file found in 'file' field");
    }

    const folder = folderSchema.parse(formData.get("folder") ?? "media");
    const rawAlt = (formData.get("alt") as string) || "";
    // Default alt text to human-readable filename if not provided
    const alt =
      rawAlt.trim() ||
      file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]+/g, " ")
        .slice(0, 100);

    const uploadResult = await uploadFile(file, `lockshield/${folder}`);

    await connectDB();
    const media = await Media.create({
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      storage: uploadResult.storage,
      alt,
      mimeType: uploadResult.mimeType,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
      bytes: uploadResult.bytes,
      uploadedBy: actor.id,
    });

    await writeAudit({
      user: actor,
      action: "create",
      resource: "Media",
      resourceId: String(media._id),
      ip: getClientIp(req.headers),
    });

    return created({
      _id: media._id,
      url: media.url,
      alt: media.alt,
      publicId: media.publicId,
      storage: media.storage,
      width: media.width,
      height: media.height,
      format: media.format,
      bytes: media.bytes,
    });
  });
}
