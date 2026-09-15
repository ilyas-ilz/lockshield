import { AuditLog } from "@/models/AuditLog";
import type { SessionUser } from "./rbac";
import { logger } from "./logger";

export async function writeAudit(params: {
  user: SessionUser;
  action: "create" | "update" | "delete" | "login_failed" | "login_success";
  resource: string;
  resourceId?: string;
  meta?: Record<string, unknown>;
  ip?: string;
}): Promise<void> {
  try {
    await AuditLog.create({
      userId: params.user.id,
      userEmail: params.user.email ?? "unknown",
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      meta: params.meta,
      ip: params.ip,
    });
  } catch (err) {
    // WHY: an audit write failing must never fail the actual mutation the
    // user asked for — log and move on, don't throw.
    logger.error("failed to write audit log", err, { resource: params.resource, action: params.action });
  }
}
