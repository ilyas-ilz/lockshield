"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

const fieldBase =
  "w-full rounded-lg border border-app bg-surface px-3 py-2.5 text-sm text-app placeholder:text-[var(--text-muted)] transition-colors focus-visible:border-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-60 min-h-11 sm:min-h-10";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldBase, className)} {...props} />;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldBase, "min-h-24 resize-y", className)} {...props} />;
}

/**
 * Password field with a show/hide toggle.
 *
 * WHY shared: the login page had this built inline while every other password
 * field (creating a colleague's account) had no way to reveal what was typed
 * — so an admin setting someone's temporary password was typing a 10+
 * character string blind and could not check it before sharing it.
 *
 * The toggle stays in the tab order: it is a real control, and hiding it from
 * keyboard users is exactly the group most likely to want it.
 */
export function PasswordInput({
  className,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? "text" : "password"}
        className={cn(fieldBase, "pr-11", className)}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted transition-colors hover:bg-surface-2 hover:text-foreground cursor-pointer"
      >
        {visible ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
      </button>
    </div>
  );
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
