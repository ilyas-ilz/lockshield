"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { markLeadsSeen } from "@/components/admin/mark-leads-seen";

/**
 * Rendered by the Leads page only while it holds leads newer than the user's
 * seen marker. Opening the page marks them seen and refreshes, so the bell
 * and sidebar badge clear. After the refresh the page no longer renders this,
 * so there is no loop. A lead arriving while the page is open (live sync)
 * changes `until` and gets marked too.
 */
export function LeadsSeenMarker({ until }: { until: string }) {
  const router = useRouter();

  React.useEffect(() => {
    let cancelled = false;
    void markLeadsSeen(until).then((marked) => {
      if (marked && !cancelled) router.refresh();
    });
    return () => {
      cancelled = true;
    };
  }, [until, router]);

  return null;
}
