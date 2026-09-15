import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { handleApi, ok, noContent, ApiError } from "@/lib/http";
import { requireRole, STAFF } from "@/lib/rbac";
import { objectIdSchema } from "@/lib/validation/common";
import { mediaUpdateSchema } from "@/lib/validation/user";
import { Media } from "@/models/Media";
import { deleteStoredFile } from "@/lib/storage";
import { writeAudit } from "@/lib/audit";
import { getClientIp } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handleApi(async () => {
    await requireRole(...STAFF);
    await connectDB();
    const { id } = await params;
    objectIdSchema.parse(id);
    const media = await Media.findById(id);
    if (!media) throw new ApiError(404, "Media not found");
    return ok(media);
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handleApi(async () => {
    const actor = await requireRole(...STAFF);
    await connectDB();
    const { id } = await params;
    objectIdSchema.parse(id);
    const input = mediaUpdateSchema.parse(await req.json());
    const media = await Media.findByIdAndUpdate(id, input, { new: true, runValidators: true });
    if (!media) throw new ApiError(404, "Media not found");
    await writeAudit({ user: actor, action: "update", resource: "Media", resourceId: id, ip: getClientIp(req.headers) });
    return ok(media);
  });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handleApi(async () => {
    const actor = await requireRole(...STAFF);
    await connectDB();
    const { id } = await params;
    objectIdSchema.parse(id);
    const media = await Media.findById(id);
    if (!media) throw new ApiError(404, "Media not found");

    // WHY best-effort: if Cloudinary is briefly unreachable we still want
    // the library entry gone so it stops showing as "available" — an
    // orphaned remote asset is a cheaper failure than a stuck admin UI.
    try {
      await deleteStoredFile(media);
    } catch (err) {
      logger.error("failed to delete media file, deleting registry entry anyway", err, { url: media.url, publicId: media.publicId });
    }

    await media.deleteOne();
    await writeAudit({ user: actor, action: "delete", resource: "Media", resourceId: id, ip: getClientIp(req.headers) });
    return noContent();
  });
}
