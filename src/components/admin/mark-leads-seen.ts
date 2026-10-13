import { api } from "@/lib/admin/api-client";

/**
 * Tells the server this user has seen leads up to `until` (ISO time of the
 * newest lead on screen). Never throws: a failed mark only means the badge
 * stays until the next try.
 */
export async function markLeadsSeen(until?: string): Promise<boolean> {
  try {
    await api.post("/api/leads/seen", { until });
    return true;
  } catch {
    return false;
  }
}
