import * as React from "react";
import { Inbox, type LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/card";

export { ErrorState } from "./error-state";

/**
 * Modern shimmering skeletons and empty states tailored for every admin view.
 */

export function TableSkeleton({ rows = 8, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      {/* Top Toolbar shimmer */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-10 w-full sm:w-64 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      {/* Mobile: card-shaped skeletons */}
      <div className="space-y-3 md:hidden">
        {Array.from({ length: Math.min(rows, 5) }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-app bg-surface p-4 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-1/2 rounded-md" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-3/4 rounded-md" />
              <Skeleton className="h-3 w-1/3 rounded-md" />
            </div>
            <div className="flex gap-2 pt-2 border-t border-app">
              <Skeleton className="h-8 flex-1 rounded-lg" />
              <Skeleton className="h-8 w-10 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: realistic table skeleton */}
      <div className="hidden md:block rounded-2xl border border-app bg-surface overflow-hidden shadow-2xs">
        {/* Table Header */}
        <div className="flex items-center gap-4 border-b border-app bg-surface-2/60 px-5 py-3.5">
          <Skeleton className="size-4 rounded" />
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton
              key={c}
              className="h-3.5 rounded"
              style={{ flex: c === 0 ? 3 : c === columns - 1 ? 1 : 2 } as React.CSSProperties}
            />
          ))}
          <Skeleton className="h-3.5 w-14 rounded" />
        </div>
        {/* Table Rows */}
        <div className="divide-y divide-line">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <Skeleton className="size-4 rounded" />
              {Array.from({ length: columns }).map((_, c) => (
                <div
                  key={c}
                  style={{ flex: c === 0 ? 3 : c === columns - 1 ? 1 : 2 } as React.CSSProperties}
                  className="flex items-center gap-2"
                >
                  {c === 0 && <Skeleton className="size-9 rounded-lg shrink-0" />}
                  <Skeleton className={`h-4 rounded ${c === columns - 1 ? "w-16 rounded-full" : "w-full max-w-[85%]"}`} />
                </div>
              ))}
              <div className="flex justify-end gap-1.5 w-14">
                <Skeleton className="size-8 rounded-lg" />
                <Skeleton className="size-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40 rounded-lg" />
          <Skeleton className="h-4 w-64 rounded-md" />
        </div>
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>

      {/* 4 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-app bg-surface p-4.5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <Skeleton className="size-9 rounded-xl" />
              <Skeleton className="h-4 w-12 rounded-full" />
            </div>
            <div className="space-y-1.5 pt-2">
              <Skeleton className="h-7 w-16 rounded-md" />
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-3 w-32 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (lg:col-span-2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Enquiries Card */}
          <div className="rounded-2xl border border-app bg-surface shadow-2xs overflow-hidden">
            <div className="px-5 py-4 border-b border-app flex justify-between items-center">
              <div className="space-y-1">
                <Skeleton className="h-5 w-44 rounded-md" />
                <Skeleton className="h-3 w-60 rounded-md" />
              </div>
              <Skeleton className="h-4 w-20 rounded-md" />
            </div>
            <div className="divide-y divide-line">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 px-5">
                  <div className="flex items-center gap-3.5">
                    <Skeleton className="size-9.5 rounded-xl" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-32 rounded-md" />
                      <Skeleton className="h-3 w-48 rounded-md" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-20 rounded-md" />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-28 rounded-md" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-18 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (lg:col-span-1) */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-app bg-surface p-5 space-y-4 shadow-2xs">
            <Skeleton className="h-5 w-32 rounded-md" />
            <div className="space-y-3">
              <Skeleton className="h-8 w-full rounded-md" />
              <Skeleton className="h-8 w-full rounded-md" />
              <Skeleton className="h-8 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>

          <div className="rounded-2xl border border-app bg-surface p-5 space-y-4 shadow-2xs">
            <Skeleton className="h-5 w-36 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-9 w-full rounded-xl" />
              <Skeleton className="h-9 w-full rounded-xl" />
              <Skeleton className="h-9 w-full rounded-xl" />
              <Skeleton className="h-9 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LeadsSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      {/* Filter Tabs */}
      <div className="flex gap-2 pb-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-xl" />
        ))}
      </div>

      {/* Leads Cards */}
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-app bg-surface p-5 space-y-3 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-full shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-36 rounded-md" />
                  <Skeleton className="h-3 w-48 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-9 w-32 rounded-xl" />
            </div>
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="space-y-2">
        <Skeleton className="h-6 w-40 rounded-lg" />
        <Skeleton className="h-4 w-60 rounded-md" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="rounded-2xl border border-app bg-surface p-6 space-y-5 shadow-2xs">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3.5 w-28 rounded" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-app bg-surface p-6 space-y-5 shadow-2xs">
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
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
    <div className="rounded-2xl border border-dashed border-app bg-surface/50 px-6 py-14 text-center transition-all hover:bg-surface/80">
      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-surface-2 border border-app shadow-2xs">
        <Icon className="size-5 text-[var(--brand-red,#e01b24)]" aria-hidden />
      </div>
      <h3 className="mt-4 text-base font-semibold text-app tracking-tight">{title}</h3>
      {description && <p className="mt-1.5 text-xs text-muted max-w-sm mx-auto leading-relaxed">{description}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

