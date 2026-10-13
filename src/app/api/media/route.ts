import { NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { handleApi, ok, created } from "@/lib/http";
import { requireRole, STAFF } from "@/lib/rbac";
import { paginate, resolveSort } from "@/lib/pagination";
import { listQuerySchema } from "@/lib/validation/common";
import { SORTABLE_FIELDS } from "@/lib/sortable-fields";
import { Media, type IMedia } from "@/models/Media";
import { writeAudit } from "@/lib/audit";
import { assertWriteBudget, getClientIp } from "@/lib/rate-limit";
import { buildSearchFilter } from "@/lib/search-filter";
import { R2_UPLOAD_KEY } from "@/lib/storage";

// WHY POST here doesn't upload a file itself: uploads go through
// /api/upload (validated + sanitized, then stored on R2 or local disk).
// This only registers an already-hosted asset (url/publicId/dimensions) +
// required alt text so the media library can list/search it later.
const mediaRecordSchema = z.object({
  url: z.string().min(1).max(2048),
  // WHY the pattern: publicId later decides which R2 object DELETE removes.
  publicId: z.string().regex(R2_UPLOAD_KEY, "publicId is not an upload key").optional(),
  storage: z.enum(["local", "r2"]).default("local"),
  alt: z.string().min(1, "alt text is required"),
  mimeType: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  format: z.string().optional(),
  bytes: z.number().optional(),
});

/** Matches the `media` entry in admin/server-data.ts — see USER_SEARCH_FIELDS. */
const MEDIA_SEARCH_FIELDS = ["alt", "url"] as const;

export async function GET(req: NextRequest) {
  return handleApi(async () => {
    await requireRole(...STAFF);
    await connectDB();
    const { searchParams } = new URL(req.url);
    const query = listQuerySchema.parse(Object.fromEntries(searchParams));
    const filter = buildSearchFilter<IMedia>(query.search, MEDIA_SEARCH_FIELDS);
    const sort = resolveSort(query.sort, query.order, SORTABLE_FIELDS.media, { createdAt: -1 });
    const result = await paginate(Media, filter, { page: query.page, pageSize: query.pageSize, sort });
    return ok(result);
  });
}

export async function POST(req: NextRequest) {
  return handleApi(async () => {
    const actor = await requireRole(...STAFF);
    assertWriteBudget(actor.id);

    await connectDB();
    const input = mediaRecordSchema.parse(await req.json());
    const media = await Media.create({ ...input, uploadedBy: actor.id });
    await writeAudit({ user: actor, action: "create", resource: "Media", resourceId: String(media._id), ip: getClientIp(req.headers) });
    return created(media);
  });
}
