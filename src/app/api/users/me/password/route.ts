import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { handleApi, ok, ApiError } from "@/lib/http";
import { requireSession } from "@/lib/rbac";
import { changePasswordSchema } from "@/lib/validation/user";
import { User } from "@/models/User";
import { hashPassword, verifyPassword, isPasswordStrong } from "@/lib/password";
import { writeAudit } from "@/lib/audit";
import { getClientIp } from "@/lib/rate-limit";

// WHY separate from PATCH /api/users/[id]: self-service password change
// requires proving the *current* password even for an ADMIN acting on their
// own account — an admin editing someone else's role must never be able to
// silently set that user's password in the same code path.
export async function POST(req: NextRequest) {
  return handleApi(async () => {
    const actor = await requireSession();
    await connectDB();
    const input = changePasswordSchema.parse(await req.json());

    const user = await User.findById(actor.id).select("+passwordHash");
    if (!user) throw new ApiError(404, "User not found");

    const valid = await verifyPassword(input.currentPassword, user.passwordHash);
    if (!valid) throw new ApiError(401, "Current password is incorrect");

    const strength = isPasswordStrong(input.newPassword);
    if (!strength.ok) throw new ApiError(400, strength.reason);

    user.passwordHash = await hashPassword(input.newPassword);
    await user.save();

    await writeAudit({ user: actor, action: "update", resource: "User", resourceId: actor.id, meta: { passwordChanged: true }, ip: getClientIp(req.headers) });
    return ok({ message: "Password updated" });
  });
}
