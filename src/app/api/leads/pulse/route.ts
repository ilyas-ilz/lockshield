import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { handleApi } from "@/lib/http";
import { requireRole, STAFF } from "@/lib/rbac";
import { Lead } from "@/models/Lead";

/**
 * Cheap "has anything changed?" check for the admin's live lead sync
 * (components/admin/leads-live-sync.tsx), polled every ~20 s while an admin
 * tab is visible. Returns two indexed lookups, never lead lists or contact
 * details, so frequent polling costs almost nothing.
 */
export async function GET() {
  return handleApi(async () => {
    await requireRole(...STAFF);
    await connectDB();
    const [newCount, latest] = await Promise.all([
      Lead.countDocuments({ status: "new" }),
      Lead.findOne({}).sort({ createdAt: -1 }).select("name createdAt").lean(),
    ]);
    // WHY bypass ok(): this must never be cached by a browser or CDN - a
    // stale answer is exactly the "new lead didn't show up" bug.
    return NextResponse.json(
      {
        success: true,
        data: {
          newCount,
          latestId: latest ? String(latest._id) : null,
          latestName: latest?.name ?? null,
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  });
}
