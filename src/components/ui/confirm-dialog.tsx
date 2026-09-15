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
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => Promise<void> | void;
  destructive?: boolean;
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
            "fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2",
            "rounded-xl border border-app bg-surface p-5 shadow-xl"
          )}
        >
          <AlertDialogPrimitive.Title className="text-base font-semibold text-app">{title}</AlertDialogPrimitive.Title>
          <AlertDialogPrimitive.Description className="mt-2 text-sm text-muted">
            {description}
          </AlertDialogPrimitive.Description>
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
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
