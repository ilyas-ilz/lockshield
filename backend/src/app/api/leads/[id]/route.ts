import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { handleApi, ok, noContent, ApiError } from "@/lib/http";
import { requireRole, STAFF, ADMIN_ONLY } from "@/lib/rbac";
import { objectIdSchema } from "@/lib/validation/common";
import { leadUpdateSchema } from "@/lib/validation/lead";
import { Lead } from "@/models/Lead";
import { writeAudit } from "@/lib/audit";
import { getClientIp } from "@/lib/rate-limit";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handleApi(async () => {
    await requireRole(...STAFF);
    await connectDB();
    const { id } = await params;
    objectIdSchema.parse(id);
    const lead = await Lead.findById(id);
    if (!lead) throw new ApiError(404, "Lead not found");
    return ok(lead);
  });
}

// Only status is editable — the submission content itself is what the visitor sent, never rewritten by staff.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handleApi(async () => {
    const actor = await requireRole(...STAFF);
    await connectDB();
    const { id } = await params;
    objectIdSchema.parse(id);
    const input = leadUpdateSchema.parse(await req.json());

    const lead = await Lead.findByIdAndUpdate(id, input, { new: true, runValidators: true });
    if (!lead) throw new ApiError(404, "Lead not found");

    await writeAudit({ user: actor, action: "update", resource: "Lead", resourceId: id, meta: input, ip: getClientIp(req.headers) });
    return ok(lead);
  });
}

// WHY ADMIN-only, unlike other DELETEs which are STAFF: leads are the one
// resource that can carry a data-deletion request (GDPR-style) rather than
// routine content cleanup — worth the higher bar.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handleApi(async () => {
    const actor = await requireRole(...ADMIN_ONLY);
    await connectDB();
    const { id } = await params;
    objectIdSchema.parse(id);
    const lead = await Lead.findByIdAndDelete(id);
    if (!lead) throw new ApiError(404, "Lead not found");
    await writeAudit({ user: actor, action: "delete", resource: "Lead", resourceId: id, ip: getClientIp(req.headers) });
    return noContent();
  });
}
