import { NextRequest } from "next/server";
import { z } from "zod";
import { handleApi, ok } from "@/lib/http";
import { requireRole, STAFF } from "@/lib/rbac";
import { createSignedUploadParams } from "@/lib/cloudinary";

const bodySchema = z.object({
  // WHY restrict to a fixed folder set: prevents a compromised staff
  // session from writing assets into an arbitrary Cloudinary path.
  folder: z.enum(["posts", "pages", "services", "projects", "jobs", "media"]).default("media"),
});

export async function POST(req: NextRequest) {
  return handleApi(async () => {
    await requireRole(...STAFF);
    const { folder } = bodySchema.parse(await req.json().catch(() => ({})));
    const params = createSignedUploadParams(`lockshield/${folder}`);
    return ok(params);
  });
}
