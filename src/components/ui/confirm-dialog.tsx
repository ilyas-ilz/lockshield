"use client";

import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { Button } from "./button";
import { cn } from "@/lib/utils";

/**
 * Destructive-action confirmation — replaces native confirm() per the UI
 * rules. Says what will happen, offers Cancel + Confirm, and the confirm
 * button shows a pending state and is disabled while the request runs so
 * a slow delete can't be double-fired.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  destructive = true,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => Promise<void> | void;
  destructive?: boolean;
  /** Extra content under the description (e.g. a change list); scrolls when long. */
  children?: React.ReactNode;
}) {
  const [pending, setPending] = React.useState(false);

  async function handleConfirm(event: React.MouseEvent) {
    event.preventDefault(); // WHY: keep the dialog open while the request is in flight
    setPending(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]" />
        <AlertDialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2",
            // WHY max-h + flex column: long content scrolls inside the body while
            // title and buttons stay on screen (never pushed past the viewport).
            "flex max-h-[calc(100dvh-2rem)] flex-col rounded-xl border border-app bg-surface p-5 shadow-xl",
            children ? "max-w-lg" : "max-w-md"
          )}
        >
          <AlertDialogPrimitive.Title className="shrink-0 text-base font-semibold text-app">{title}</AlertDialogPrimitive.Title>
          <AlertDialogPrimitive.Description className="mt-2 shrink-0 text-sm text-muted">
            {description}
          </AlertDialogPrimitive.Description>
          {children && (
            <div className="admin-scroll -mx-1 mt-4 min-h-0 flex-1 overflow-y-auto overscroll-contain px-1">{children}</div>
          )}
          <div className="mt-5 flex shrink-0 flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AlertDialogPrimitive.Cancel asChild>
              <Button variant="secondary" disabled={pending}>
                {cancelLabel}
              </Button>
            </AlertDialogPrimitive.Cancel>
            <Button variant={destructive ? "dangerSolid" : "primary"} onClick={handleConfirm} loading={pending}>
              {pending ? "Working…" : confirmLabel}
            </Button>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}
