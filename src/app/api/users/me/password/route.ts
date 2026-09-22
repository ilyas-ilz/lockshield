import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { handleApi, ok, ApiError } from "@/lib/http";
import { requireSession } from "@/lib/rbac";
import { changePasswordSchema } from "@/lib/validation/user";
import { User } from "@/models/User";
import { hashPassword, verifyPassword, isPasswordStrong } from "@/lib/password";
import { writeAudit } from "@/lib/audit";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

// WHY separate from PATCH /api/users/[id]: self-service password change
// requires proving the *current* password even for an ADMIN acting on their
// own account — an admin editing someone else's role must never be able to
// silently set that user's password in the same code path.
export async function POST(req: NextRequest) {
  return handleApi(async () => {
    const actor = await requireSession();

    // WHY the login preset, not the generic write budget: this endpoint
    // verifies `currentPassword`, so it is a password oracle. Anyone who gets
    // hold of a session could otherwise guess the current password at full
    // speed to escalate into a permanent credential. 10 attempts / 15 min per
    // account matches the sign-in form's ceiling.
    const rl = checkRateLimit(`password-change:${actor.id}`, RATE_LIMITS.login.max, RATE_LIMITS.login.windowMs);
    if (!rl.allowed) throw new ApiError(429, "Too many password attempts — try again later");

    await connectDB();
    const input = changePasswordSchema.parse(await req.json());

    const user = await User.findById(actor.id).select("+passwordHash");
    if (!user) throw new ApiError(404, "User not found");

    const valid = await verifyPassword(input.currentPassword, user.passwordHash);
    if (!valid) throw new ApiError(401, "Current password is incorrect");

    // Rotating to the same value is almost always a mistake, and it makes the
    // "your password was changed" audit entry a lie.
    if (input.currentPassword === input.newPassword) {
      throw new ApiError(400, "New password must be different from your current one");
    }

    const strength = isPasswordStrong(input.newPassword);
    if (!strength.ok) throw new ApiError(400, strength.reason);

    user.passwordHash = await hashPassword(input.newPassword);
    await user.save();

    await writeAudit({ user: actor, action: "update", resource: "User", resourceId: actor.id, meta: { passwordChanged: true }, ip: getClientIp(req.headers) });
    return ok({ message: "Password updated" });
  });
}
