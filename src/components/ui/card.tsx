import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  hover = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { hover?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-app bg-surface shadow-[0_2px_12px_-3px_rgba(0,0,0,0.08),0_1px_3px_0_rgba(0,0,0,0.04)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.45)] transition-all duration-200",
        hover &&
          "hover:border-[color-mix(in_srgb,var(--brand-red)_35%,var(--border))] hover:shadow-[0_14px_32px_-8px_rgba(0,0,0,0.12),0_4px_12px_-2px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_14px_32px_-8px_rgba(0,0,0,0.7)] hover:-translate-y-0.5",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 py-4 border-b border-app", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-sm font-semibold tracking-tight text-app", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}

export function Badge({
  className,
  tone = "neutral",
  dot = false,
  children,
}: {
  className?: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "brand" | "info";
  dot?: boolean;
  children: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    neutral:
      "bg-slate-100 text-slate-700 border-slate-200/80 dark:bg-slate-800/80 dark:text-slate-200 dark:border-slate-700",
    success:
      "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800/70",
    warning:
      "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800/70",
    danger:
      "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-800/70",
    brand:
      "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/60 dark:text-red-200 dark:border-red-800/70",
    info:
      "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-800/70",
  };

  const dotColors: Record<string, string> = {
    neutral: "bg-slate-400",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
    brand: "bg-red-600",
    info: "bg-blue-500",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap shadow-2xs",
        tones[tone],
        className
      )}
    >
      {dot && <span className={cn("size-1.5 rounded-full shrink-0", dotColors[tone])} aria-hidden />}
      {children}
    </span>
  );
}

export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-lg bg-surface-2",
        className
      )}
      style={style}
      aria-hidden
    />
  );
}

