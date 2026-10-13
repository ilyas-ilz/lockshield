"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/admin/api-client";

export interface Pulse {
  newCount: number;
  latestId: string | null;
  latestName: string | null;
}

/**
 * What a poll result means compared to the previous one. `null` prev is the
 * first answer after page load: only a baseline, never a "new lead".
 */
export function pulseChange(prev: Pulse | null, next: Pulse): { newLead: boolean; refresh: boolean } {
  if (!prev) return { newLead: false, refresh: false };
  const newLead = next.latestId !== null && next.latestId !== prev.latestId;
  return { newLead, refresh: newLead || next.newCount !== prev.newCount };
}

/** Often enough that a lead shows up "on its own"; rare enough to cost nothing. */
const POLL_MS = 20_000;

/**
 * Keeps the admin in step with new leads without a manual reload.
 *
 * WHY: the bell, sidebar badge, stat cards and lead list are server-rendered
 * once per navigation, so a lead submitted while the admin sat open stayed
 * invisible until someone clicked something. This polls /api/leads/pulse
 * (two indexed lookups) and, when the newest lead or the "new" count
 * changes, calls router.refresh() - which re-renders every server component
 * on the page (layout bell/badge, the leads page and its list) in place,
 * keeping scroll position, filters and client state.
 *
 * Polling pauses while the tab is hidden and runs immediately when it comes
 * back, so a background tab costs nothing and a returning admin sees fresh
 * data at once. Renders nothing.
 */
export function LeadsLiveSync() {
  const router = useRouter();
  const last = React.useRef<Pulse | null>(null);

  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;

    async function check() {
      if (stopped || document.visibilityState !== "visible") return;
      try {
        const pulse = await api.get<Pulse>("/api/leads/pulse");
        const { newLead, refresh } = pulseChange(last.current, pulse);
        last.current = pulse;
        if (newLead) {
          toast.success(`New lead from ${pulse.latestName ?? "a visitor"}`, {
            action: { label: "View", onClick: () => router.push("/admin/leads") },
          });
        }
        if (refresh) router.refresh();
      } catch {
        // Offline / session expired: stay quiet; the next tick retries and
        // any real auth problem surfaces on the next navigation.
      }
    }

    function schedule() {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        await check();
        if (!stopped) schedule();
      }, POLL_MS);
    }

    function onVisible() {
      if (document.visibilityState === "visible") {
        void check();
        schedule();
      }
    }

    void check();
    schedule();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router]);

  return null;
}
