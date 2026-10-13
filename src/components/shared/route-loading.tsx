import { Skeleton } from "@/components/ui/card";
import { DashboardSkeleton, FormSkeleton, LeadsSkeleton, TableSkeleton } from "./states";

/**
 * Instant placeholders for admin route transitions (used by the loading.tsx
 * files under app/admin/(protected)).
 *
 * WHY: every admin page is server-rendered per request (fresh data, behind
 * auth), so a sidebar click used to leave the *previous* page frozen on
 * screen until the next one had finished its DB queries - it read as "the
 * admin is stuck". A loading.tsx makes Next swap in this skeleton the moment
 * the link is clicked, while the shell (sidebar, top bar) stays put.
 */

function HeaderSkeleton() {
  return (
    <div className="mb-6 flex items-center gap-4 border-b border-app pb-6">
      <Skeleton className="size-12 shrink-0 rounded-2xl" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-48 rounded-lg" />
        <Skeleton className="h-4 w-72 max-w-[60vw] rounded-md" />
      </div>
    </div>
  );
}

type Variant = "dashboard" | "table" | "leads" | "form";

export function RouteLoading({ variant }: { variant: Variant }) {
  return (
    <div role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      {variant === "dashboard" ? (
        <DashboardSkeleton />
      ) : variant === "form" ? (
        <FormSkeleton />
      ) : (
        <>
          <HeaderSkeleton />
          {variant === "leads" ? <LeadsSkeleton /> : <TableSkeleton />}
        </>
      )}
    </div>
  );
}
