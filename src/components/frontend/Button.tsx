import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type MarketingButtonVariant = "red" | "ghost" | "darkGhost" | "dark";

interface BaseProps {
  variant?: MarketingButtonVariant;
  /** Show the sliding arrow after the label (legacy `<span class="arr">`). Default true. */
  arrow?: boolean;
  className?: string;
  children: React.ReactNode;
}

const VARIANT_CLASSES: Record<MarketingButtonVariant, string> = {
  // legacy .btn-red
  red: "bg-brand-500 text-white shadow-lg shadow-brand-500/30 hover:bg-brand-600 hover:-translate-y-0.5",
  // legacy .btn-ghost (used on dark sections)
  ghost: "border border-white/35 text-white hover:border-white hover:-translate-y-0.5",
  // legacy .btn-dark-ghost (used on light sections)
  darkGhost: "border border-[var(--marketing-line)] text-ink hover:border-brand-500 hover:text-brand-500 hover:-translate-y-0.5",
  // solid dark, used sparingly (e.g. "View all projects" on white sections)
  dark: "bg-navy-900 text-white hover:bg-brand-500",
};

const SHARED_CLASSES =
  "btn-pill inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 [transition-timing-function:var(--ease-brand)] cursor-pointer";

function Arrow({ show }: { show: boolean }) {
  if (!show) return null;
  return <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />;
}

interface ButtonLinkProps extends BaseProps {
  href: string;
  target?: string;
  rel?: string;
}

/** Marketing-site pill button, as a link - the legacy `<a class="btn btn-red">`. */
export function ButtonLink({ href, variant = "red", arrow = true, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link href={href} className={cn(SHARED_CLASSES, "group", VARIANT_CLASSES[variant], className)} {...rest}>
      <span>{children}</span>
      <Arrow show={arrow} />
    </Link>
  );
}

interface ButtonActionProps extends BaseProps, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> {}

/** Marketing-site pill button, as a `<button>` - for quote-modal triggers etc. */
export function ButtonAction({ variant = "red", arrow = true, className, children, type = "button", ...rest }: ButtonActionProps) {
  return (
    <button type={type} className={cn(SHARED_CLASSES, "group", VARIANT_CLASSES[variant], className)} {...rest}>
      <span>{children}</span>
      <Arrow show={arrow} />
    </button>
  );
}
