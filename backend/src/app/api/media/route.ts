import { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { handleApi, ok, created } from "@/lib/http";
import { requireRole, STAFF } from "@/lib/rbac";
import { paginate, resolveSort } from "@/lib/pagination";
import { listQuerySchema } from "@/lib/validation/common";
import { SORTABLE_FIELDS } from "@/lib/sortable-fields";
import { Media } from "@/models/Media";
import { writeAudit } from "@/lib/audit";
import { getClientIp } from "@/lib/rate-limit";

// WHY POST here doesn't upload a file itself: the browser already uploaded
// directly to Cloudinary using the signature from /api/upload/sign. This
// just records the resulting asset (url/publicId/dimensions) + required alt
// text in our own registry so the media library can list/search it later.
const mediaRecordSchema = z.object({
  url: z.string().min(1),
  publicId: z.string().min(1),
  alt: z.string().min(1, "alt text is required"),
  width: z.number().optional(),
  height: z.number().optional(),
  format: z.string().optional(),
  bytes: z.number().optional(),
});

export async function GET(req: NextRequest) {
  return handleApi(async () => {
    await requireRole(...STAFF);
    await connectDB();
    const { searchParams } = new URL(req.url);
    const query = listQuerySchema.parse(Object.fromEntries(searchParams));
    const sort = resolveSort(query.sort, query.order, SORTABLE_FIELDS.media, { createdAt: -1 });
    const result = await paginate(Media, {}, { page: query.page, pageSize: query.pageSize, sort });
    return ok(result);
  });
}

export async function POST(req: NextRequest) {
  return handleApi(async () => {
    const actor = await requireRole(...STAFF);
    await connectDB();
    const input = mediaRecordSchema.parse(await req.json());
    const media = await Media.create({ ...input, uploadedBy: actor.id });
    await writeAudit({ user: actor, action: "create", resource: "Media", resourceId: String(media._id), ip: getClientIp(req.headers) });
    return created(media);
  });
}
