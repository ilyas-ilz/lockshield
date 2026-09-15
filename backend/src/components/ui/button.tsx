"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // WHY min-h-11 on the default size: 44px is the minimum comfortable touch
  // target on mobile. Desktop tightens it via the sm: step.
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        primary: "bg-[var(--color-brand-500)] text-white hover:bg-[var(--color-brand-600)] active:bg-[var(--color-brand-700)]",
        secondary: "bg-surface border border-app text-app hover:bg-surface-2",
        ghost: "text-app hover:bg-surface-2",
        danger: "bg-[var(--danger-bg)] text-[var(--danger)] border border-[color-mix(in_srgb,var(--danger)_30%,transparent)] hover:bg-[color-mix(in_srgb,var(--danger)_15%,var(--danger-bg))]",
        dangerSolid: "bg-[var(--danger)] text-white hover:opacity-90",
        link: "text-[var(--color-brand-600)] underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-3 text-[13px] [&_svg]:size-4",
        md: "min-h-11 sm:min-h-10 px-4 py-2 [&_svg]:size-4",
        lg: "min-h-12 px-5 text-base [&_svg]:size-5",
        icon: "size-11 sm:size-10 [&_svg]:size-4",
      },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export function Button({ className, variant, size, asChild, loading, children, disabled, ...props }: ButtonProps) {
  // WHY asChild skips the spinner: Radix's Slot requires exactly one child,
  // so wrapping children in a fragment with a spinner would throw. asChild
  // is only used for links (which don't have a pending state) anyway.
  if (asChild) {
    return (
      <Slot className={cn(buttonVariants({ variant, size, className }))} {...props}>
        {children}
      </Slot>
    );
  }

  return (
    <button className={cn(buttonVariants({ variant, size, className }))} disabled={disabled ?? loading} {...props}>
      {loading && <Loader2 className="animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export { buttonVariants };
