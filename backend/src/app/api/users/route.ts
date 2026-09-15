import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { handleApi, ok, created, ApiError } from "@/lib/http";
import { requireRole, ADMIN_ONLY } from "@/lib/rbac";
import { paginate, resolveSort } from "@/lib/pagination";
import { listQuerySchema } from "@/lib/validation/common";
import { SORTABLE_FIELDS } from "@/lib/sortable-fields";
import { userCreateSchema } from "@/lib/validation/user";
import { User } from "@/models/User";
import { hashPassword, isPasswordStrong } from "@/lib/password";
import { writeAudit } from "@/lib/audit";
import { getClientIp } from "@/lib/rate-limit";

// WHY hand-written, not the CRUD factory: user creation hashes a password
// (never persisted as plaintext, never returned) and role assignment is
// the single most sensitive write in the whole system — worth its own
// explicit, readable route rather than a generic beforeCreate hook.
export async function GET(req: NextRequest) {
  return handleApi(async () => {
    await requireRole(...ADMIN_ONLY);
    await connectDB();
    const { searchParams } = new URL(req.url);
    const query = listQuerySchema.parse(Object.fromEntries(searchParams));
    const sort = resolveSort(query.sort, query.order, SORTABLE_FIELDS.users, { createdAt: -1 });
    const result = await paginate(User, {}, { page: query.page, pageSize: query.pageSize, sort });
    return ok(result);
  });
}

export async function POST(req: NextRequest) {
  return handleApi(async () => {
    const actor = await requireRole(...ADMIN_ONLY);
    await connectDB();
    const body = await req.json();
    const input = userCreateSchema.parse(body);

    const strength = isPasswordStrong(input.password);
    if (!strength.ok) throw new ApiError(400, strength.reason);

    const passwordHash = await hashPassword(input.password);
    const user = await User.create({ name: input.name, email: input.email, passwordHash, role: input.role });

    await writeAudit({
      user: actor,
      action: "create",
      resource: "User",
      resourceId: String(user._id),
      meta: { email: user.email, role: user.role },
      ip: getClientIp(req.headers),
    });

    const safe = user.toObject();
    delete (safe as { passwordHash?: string }).passwordHash;
    return created(safe);
  });
}
