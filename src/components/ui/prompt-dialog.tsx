"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "./button";
import { Input, Label } from "./input";
import { cn } from "@/lib/utils";

/**
 * Single-input modal — replaces native window.prompt() per the UI rules.
 *
 * WHY it exists: prompt() blocks the whole tab, is unstyled, cannot validate
 * before it closes, and is silently ignored by some browsers inside a
 * sandboxed iframe — which meant "Insert link" simply did nothing. This keeps
 * focus management and Escape handling from Radix, validates before it
 * closes, and can offer a third destructive action (e.g. "Remove link").
 */
export function PromptDialog({
  open,
  onOpenChange,
  title,
  description,
  label,
  placeholder,
  initialValue = "",
  confirmLabel = "Save",
  cancelLabel = "Cancel",
  removeLabel,
  inputMode = "text",
  validate,
  onSubmit,
  onRemove,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  label: string;
  placeholder?: string;
  initialValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Renders a third, destructive button (e.g. "Remove link"). Omit to hide it. */
  removeLabel?: string;
  inputMode?: "text" | "url";
  /** Return an error message to block submission, or null when the value is fine. */
  validate?: (value: string) => string | null;
  onSubmit: (value: string) => void;
  onRemove?: () => void;
}) {
  const [value, setValue] = React.useState(initialValue);
  const [error, setError] = React.useState<string | null>(null);
  const inputId = React.useId();

  // Reset to the caller's current value each time the dialog opens, so
  // reopening "Edit link" on a different link does not show the previous one.
  React.useEffect(() => {
    if (open) {
      setValue(initialValue);
      setError(null);
    }
  }, [open, initialValue]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    // WHY stopPropagation: Radix portals this dialog to document.body, but
    // React still bubbles the synthetic submit up the *component* tree. When
    // the dialog is opened from the rich-text toolbar inside ResourceForm,
    // submitting it was firing the outer form's onSubmit too — saving the
    // record and navigating away the moment you pressed "Insert link".
    event.stopPropagation();
    const trimmed = value.trim();
    const validationError = validate?.(trimmed) ?? null;
    if (validationError) {
      setError(validationError);
      return;
    }
    onSubmit(trimmed);
    onOpenChange(false);
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2",
            "rounded-xl border border-app bg-surface p-5 shadow-xl"
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogPrimitive.Title className="text-base font-semibold text-app">{title}</DialogPrimitive.Title>
              {description && (
                <DialogPrimitive.Description className="mt-1 text-sm text-muted">
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                aria-label="Close"
                className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-foreground cursor-pointer"
              >
                <X className="size-4" aria-hidden />
              </button>
            </DialogPrimitive.Close>
          </div>

          {/* noValidate + type="text": an <input type="url"> refuses a relative
              path like "/services", and the browser blocks submit before our
              own validate() ever runs — so the dialog could never be closed
              with an in-site link. inputMode still gets the URL keyboard on
              mobile; validate() is the single source of truth. */}
          <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-2">
            <Label htmlFor={inputId}>{label}</Label>
            <Input
              id={inputId}
              autoFocus
              type="text"
              inputMode={inputMode === "url" ? "url" : "text"}
              autoComplete="off"
              spellCheck={false}
              value={value}
              placeholder={placeholder}
              onChange={(event) => {
                setValue(event.target.value);
                if (error) setError(null);
              }}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${inputId}-error` : undefined}
            />
            {error && (
              <p id={`${inputId}-error`} className="text-xs font-medium text-[var(--brand-red,#e01b24)]">
                {error}
              </p>
            )}

            <div className="flex flex-col-reverse gap-2 pt-3 sm:flex-row sm:justify-end">
              {removeLabel && onRemove && (
                <Button
                  type="button"
                  variant="dangerSolid"
                  className="sm:mr-auto"
                  onClick={() => {
                    onRemove();
                    onOpenChange(false);
                  }}
                >
                  {removeLabel}
                </Button>
              )}
              <DialogPrimitive.Close asChild>
                <Button type="button" variant="secondary">
                  {cancelLabel}
                </Button>
              </DialogPrimitive.Close>
              <Button type="submit" variant="primary">
                {confirmLabel}
              </Button>
            </div>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
