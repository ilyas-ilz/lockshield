/**
 * "Unseen lead" bookkeeping for the admin bell and Leads badges.
 *
 * WHY a per-user seen marker instead of counting status "new": a lead stays
 * "new" until someone replies, so the badge never cleared just from looking
 * at it - it read as a stuck notification. The badge now means "arrived since
 * you last looked"; the "Awaiting reply" stat still tracks the work queue.
 */

/** Mongo filter for leads the user hasn't seen yet. No marker = all new leads. */
export function unseenLeadFilter(seenAt: Date | null | undefined): Record<string, unknown> {
  return seenAt ? { status: "new", createdAt: { $gt: seenAt } } : { status: "new" };
}

/**
 * The moment to mark as seen: the newest lead the client actually displayed,
 * so a lead arriving between render and this call stays unseen. Missing or
 * malformed input falls back to now; a future time is clamped to now so a
 * client can't silence leads that haven't arrived yet.
 */
export function seenUntil(until: unknown, now: Date = new Date()): Date {
  const parsed = typeof until === "string" ? new Date(until) : null;
  if (!parsed || Number.isNaN(parsed.getTime())) return now;
  return parsed.getTime() > now.getTime() ? now : parsed;
}
