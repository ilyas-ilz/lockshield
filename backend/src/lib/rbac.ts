import { auth } from "./auth";
import { ApiError } from "./http";
import type { UserRole } from "@/models/User";

export interface SessionUser {
  id: string;
  role: UserRole;
  name?: string | null;
  email?: string | null;
}

/** Throws 401 if not logged in. Use for any route requiring any staff session. */
export async function requireSession(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user) throw new ApiError(401, "Authentication required");
  return session.user;
}

/**
 * Throws 401/403. EDITOR can manage content (Post/Page/Service/Project/Job/
 * Media); ADMIN-only covers Settings, Users, and Redirects — anything that
 * affects the whole site or grants further access. See design doc:
 * "Single admin + a few editors".
 */
export async function requireRole(...roles: UserRole[]): Promise<SessionUser> {
  const user = await requireSession();
  if (!roles.includes(user.role)) {
    throw new ApiError(403, `Requires role: ${roles.join(" or ")}`);
  }
  return user;
}

export const ADMIN_ONLY: UserRole[] = ["ADMIN"];
export const STAFF: UserRole[] = ["ADMIN", "EDITOR"];
