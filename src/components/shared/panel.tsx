import * as React from "react";
import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Dashboard widget: icon tile, title and subtitle in a divided header, with
 * an optional action ("Review leads ->") on the right.
 */
export function Panel({
  title,
  subtitle,
  icon: Icon,
  actions,
  className,
  bodyClassName,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  actions?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  const headingId = React.useId();
  return (
    <section aria-labelledby={headingId} className={cn("flex flex-col rounded-2xl border border-app bg-surface", className)}>
      <header className="flex items-center gap-3 border-b border-app px-4 py-4 sm:px-6">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-app bg-surface-2/60 text-muted">
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id={headingId} className="truncate text-base font-semibold text-app">
            {title}
          </h2>
          {subtitle && <p className="truncate text-sm text-muted">{subtitle}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-1 sm:gap-3">{actions}</div>}
      </header>
      <div className={cn("flex-1 p-4 sm:p-6", bodyClassName)}>{children}</div>
    </section>
  );
}

export function PanelLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-1 text-sm font-semibold text-[var(--color-brand-600)] transition-colors hover:text-[var(--color-brand-700)] focus-visible:outline-2 focus-visible:outline-[var(--ring)] sm:min-h-0 dark:text-[var(--color-brand-400)]"
    >
      {children}
      <ArrowRight className="size-4" aria-hidden />
    </Link>
  );
}
