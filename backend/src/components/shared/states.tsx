"use client";

import * as React from "react";
import { AlertCircle, Inbox, RotateCw, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/card";

/**
 * The three states every data region needs (per the UI rules): a skeleton
 * shaped like the real content, an empty state that says what's empty and
 * offers a way forward, and an error state with a retry. Never a blank
 * area, never a bare spinner.
 */

export function TableSkeleton({ rows = 8, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div aria-busy="true" aria-live="polite">
      {/* Mobile: card-shaped skeletons, matching the card list below md */}
      <div className="space-y-2 md:hidden">
        {Array.from({ length: Math.min(rows, 5) }).map((_, i) => (
          <div key={i} className="rounded-xl border border-app bg-surface p-4 space-y-2.5">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        ))}
      </div>
      {/* Desktop: table-row skeletons with the same column count as the real table */}
      <div className="hidden md:block rounded-xl border border-app bg-surface overflow-hidden">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-app px-4 py-3.5 last:border-0">
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton key={c} className="h-4" style={{ flex: c === 0 ? 3 : 1 } as React.CSSProperties} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-app bg-surface px-6 py-12 text-center">
      <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-surface-2">
        <Icon className="size-5 text-muted" aria-hidden />
      </div>
      <h3 className="mt-3 text-sm font-semibold text-app">{title}</h3>
      {description && <p className="mt-1 text-sm text-muted max-w-sm mx-auto">{description}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-xl border border-[color-mix(in_srgb,var(--danger)_30%,transparent)] bg-[var(--danger-bg)] px-6 py-10 text-center">
      <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--danger)_15%,transparent)]">
        <AlertCircle className="size-5 text-[var(--danger)]" aria-hidden />
      </div>
      <h3 className="mt-3 text-sm font-semibold text-app">Something went wrong</h3>
      <p className="mt-1 text-sm text-muted max-w-md mx-auto break-words">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
          <RotateCw aria-hidden />
          Retry
        </Button>
      )}
    </div>
  );
}
