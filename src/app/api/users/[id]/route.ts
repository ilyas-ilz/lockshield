import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { handleApi, ok, noContent, ApiError } from "@/lib/http";
import { requireRole, ADMIN_ONLY } from "@/lib/rbac";
import { objectIdSchema } from "@/lib/validation/common";
import { userUpdateSchema } from "@/lib/validation/user";
import { User } from "@/models/User";
import { writeAudit } from "@/lib/audit";
import { assertWriteBudget, getClientIp } from "@/lib/rate-limit";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handleApi(async () => {
    await requireRole(...ADMIN_ONLY);
    await connectDB();
    const { id } = await params;
    objectIdSchema.parse(id);
    const user = await User.findById(id);
    if (!user) throw new ApiError(404, "User not found");
    return ok(user);
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handleApi(async () => {
    const actor = await requireRole(...ADMIN_ONLY);
    assertWriteBudget(actor.id);

    await connectDB();
    const { id } = await params;
    objectIdSchema.parse(id);
    const input = userUpdateSchema.parse(await req.json());

    // WHY: an admin demoting/deactivating their own only-admin account would
    // lock everyone out of Settings/Users with no way back in short of a DB
    // console. Block self-demotion/self-deactivation specifically.
    if (id === actor.id) {
      if (input.role && input.role !== "ADMIN") throw new ApiError(400, "You cannot change your own role");
      if (input.active === false) throw new ApiError(400, "You cannot deactivate your own account");
    }

    const user = await User.findByIdAndUpdate(id, input, { new: true, runValidators: true });
    if (!user) throw new ApiError(404, "User not found");

    await writeAudit({ user: actor, action: "update", resource: "User", resourceId: id, meta: input, ip: getClientIp(req.headers) });
    return ok(user);
  });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handleApi(async () => {
    const actor = await requireRole(...ADMIN_ONLY);
    const { id } = await params;
    objectIdSchema.parse(id);
    if (id === actor.id) throw new ApiError(400, "You cannot delete your own account");

    await connectDB();
    const user = await User.findByIdAndDelete(id);
    if (!user) throw new ApiError(404, "User not found");

    await writeAudit({ user: actor, action: "delete", resource: "User", resourceId: id, ip: getClientIp(req.headers) });
    return noContent();
  });
}
