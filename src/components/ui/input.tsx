"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

const fieldBase =
  "w-full rounded-lg border border-app bg-surface px-3 py-2.5 text-sm text-app placeholder:text-[var(--text-muted)] transition-colors focus-visible:border-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-60 min-h-11 sm:min-h-10";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldBase, className)} {...props} />;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldBase, "min-h-24 resize-y", className)} {...props} />;
}

export function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn("block text-sm font-medium text-app leading-none mb-1.5", className)}
      {...props}
    />
  );
}

/** Field wrapper: label + control + help/error text, consistently spaced. */
export function Field({
  label,
  htmlFor,
  required,
  help,
  error,
  children,
  className,
}: {
  label?: string;
  htmlFor?: string;
  required?: boolean;
  help?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <Label htmlFor={htmlFor}>
          {label}
          {required && (
            <span className="text-[var(--danger)] ml-0.5" aria-hidden>
              *
            </span>
          )}
        </Label>
      )}
      {children}
      {/* Help text is hidden once there's an error, so the two never compete. */}
      {error ? (
        <p className="text-xs text-[var(--danger)]">{error}</p>
      ) : help ? (
        <p className="text-xs text-muted">{help}</p>
      ) : null}
    </div>
  );
}

export { fieldBase };
