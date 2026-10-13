import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { handleApi, ok } from "@/lib/http";
import { seenUntil } from "@/lib/leads-seen";
import { requireRole, STAFF } from "@/lib/rbac";
import { User } from "@/models/User";

/**
 * Marks leads up to `until` as seen by the signed-in user, which clears the
 * bell and Leads badges (see lib/leads-seen.ts). Called when the Leads page
 * opens and when the bell menu opens. Writes only the caller's own marker.
 */
export async function POST(req: NextRequest) {
  return handleApi(async () => {
    const user = await requireRole(...STAFF);
    const body: unknown = await req.json().catch(() => ({}));
    const until = seenUntil(body && typeof body === "object" ? (body as { until?: unknown }).until : undefined);
    await connectDB();
    // $max: an older tab posting a stale time can never move the marker back.
    await User.updateOne({ _id: user.id }, { $max: { leadsSeenAt: until } });
    return ok({ seenAt: until.toISOString() });
  });
}
