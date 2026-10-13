import * as React from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Label, big number, quiet hint. The number is the focal point; the icon is
 * a small marker, not decoration. 2-up on phones, 4-up on desktop.
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  href,
  highlight = false,
}: {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  hint?: React.ReactNode;
  href?: string;
  /** Needs attention (e.g. unanswered leads): red icon + faint brand border. */
  highlight?: boolean;
}) {
  const body = (
    <div
      className={cn(
        "flex h-full flex-col rounded-2xl border bg-surface p-4 transition-colors sm:p-5",
        highlight ? "border-[var(--color-brand-500)]/30" : "border-app",
        href && "group-hover:border-[color-mix(in_srgb,var(--color-brand-500)_35%,var(--border))]"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="truncate text-xs font-medium text-muted sm:text-sm">{label}</p>
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg sm:size-9",
            highlight
              ? "bg-[var(--color-brand-50)] text-[var(--color-brand-500)] dark:bg-[var(--color-brand-500)]/12 dark:text-[var(--color-brand-400)]"
              : "bg-surface-2 text-muted"
          )}
        >
          <Icon className="size-4 sm:size-5" aria-hidden />
        </span>
      </div>
      <p className="mt-1 text-2xl font-semibold leading-none tracking-tight text-app tabular-nums sm:mt-2 sm:text-3xl">{value}</p>
      {hint && <p className="mt-2 truncate text-xs text-muted sm:text-[13px]">{hint}</p>}
    </div>
  );

  return href ? (
    <Link
      href={href}
      className="group block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
    >
      {body}
    </Link>
  ) : (
    body
  );
}
