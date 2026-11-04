"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Check, X } from "lucide-react";
import { firstName } from "./success-copy";

export interface SubmissionSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  /** Numbered "what happens next" list under the description. */
  steps?: readonly string[];
  /** Extra content under the steps, e.g. a follow-up instruction. */
  children?: React.ReactNode;
  actionLabel?: string;
}

/**
 * Centered confirmation shown after a public form submits. Replaces the
 * corner success toast, which visitors easily missed. Validation and error
 * messages still use toasts.
 */
export function SubmissionSuccessDialog({
  open,
  onOpenChange,
  title,
  description,
  steps,
  children,
  actionLabel = "Done",
}: SubmissionSuccessDialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="overlay-in fixed inset-0 z-[70] bg-navy-900/60 backdrop-blur-sm" />
        <DialogPrimitive.Content className="pop-in fixed left-1/2 top-1/2 z-[70] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain rounded-3xl bg-white text-center shadow-2xl focus:outline-none">
          {/* Soft success glow behind the badge */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-emerald-50 to-transparent"
          />

          <DialogPrimitive.Close asChild>
            <button
              type="button"
              aria-label="Close"
              className="absolute right-3 top-3 z-10 flex size-11 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </DialogPrimitive.Close>

          <div className="relative px-6 pb-6 pt-10 sm:px-8 sm:pb-8">
            <div className="relative mx-auto size-20">
              <span aria-hidden className="success-ring absolute inset-0 rounded-full bg-emerald-400/40" />
              <div className="relative flex size-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                <Check className="check-draw size-10" strokeWidth={3} />
              </div>
            </div>

            <DialogPrimitive.Title className="mt-6 font-tech text-2xl font-bold uppercase tracking-tight text-gray-900">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-gray-600">
              {description}
            </DialogPrimitive.Description>

            {steps && steps.length > 0 && (
              <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-left">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">What happens next</p>
                <ol className="mt-3 space-y-3">
                  {steps.map((step, i) => (
                    <li key={step} className="flex items-start gap-3">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-xs font-bold text-brand-500">
                        {i + 1}
                      </span>
                      <span className="pt-0.5 text-sm text-gray-700">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {children}

            <DialogPrimitive.Close asChild>
              <button
                type="button"
                className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-brand-500 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition-all hover:bg-brand-600 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 cursor-pointer"
              >
                {actionLabel}
              </button>
            </DialogPrimitive.Close>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/** Personal confirmation line for both quote forms (contact form + quote popup). */
export function QuoteSuccessMessage({ name, phone }: { name: string; phone: string }) {
  const first = firstName(name);
  return (
    <>
      {first ? `Thanks, ${first}. ` : "Thanks. "}
      Your request is with our engineering desk. We&apos;ll call you
      {phone ? (
        <>
          {" "}on <span className="whitespace-nowrap font-semibold text-gray-900">{phone}</span>
        </>
      ) : null}{" "}
      shortly.
    </>
  );
}
