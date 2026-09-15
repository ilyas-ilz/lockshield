"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0 cursor-pointer select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--color-brand-500)] text-white shadow-xs hover:bg-[var(--color-brand-600)] hover:shadow-sm active:bg-[var(--color-brand-700)] active:shadow-none active:scale-[0.99]",
        secondary:
          "bg-surface border border-app text-app shadow-2xs hover:bg-surface-2 hover:border-[color-mix(in_srgb,var(--border)_80%,transparent)] active:scale-[0.99]",
        ghost: "text-app hover:bg-surface-2 active:bg-surface-3/60",
        danger:
          "bg-[var(--danger-bg)] text-[var(--danger)] border border-[color-mix(in_srgb,var(--danger)_30%,transparent)] shadow-2xs hover:bg-[color-mix(in_srgb,var(--danger)_15%,var(--danger-bg))] active:scale-[0.99]",
        dangerSolid: "bg-[var(--danger)] text-white shadow-xs hover:opacity-95 active:scale-[0.99]",
        link: "text-[var(--color-brand-600)] underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8.5 px-3 text-xs [&_svg]:size-3.5",
        md: "min-h-10 sm:min-h-9 px-3.5 py-2 text-sm [&_svg]:size-4",
        lg: "min-h-11 px-5 text-base [&_svg]:size-5",
        icon: "size-9 sm:size-8.5 [&_svg]:size-4",
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
