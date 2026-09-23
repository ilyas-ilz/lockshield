"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Sign-out confirmation. The confirm button submits a real <form> bound to
 * the server action, so the NextAuth redirect runs exactly as it did before
 * the dialog existed; only the extra "are you sure" step is new.
 */
export function SignOutDialog({
  open,
  onOpenChange,
  action,
  user,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: () => Promise<void>;
  user: { name?: string | null; email?: string | null; role: string };
}) {
  const initials = (user.name ?? user.email ?? "?").slice(0, 2);

  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="fade-in fixed inset-0 z-[60] bg-black/55 backdrop-blur-sm" />
        <AlertDialogPrimitive.Content
          className="drawer-sheet fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-[60] mx-auto max-w-sm rounded-2xl border border-app bg-surface p-5 shadow-2xl sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:-translate-x-1/2 sm:-translate-y-1/2 sm:p-6"
        >
          <div className="flex flex-col items-center text-center">
            <div className="relative flex size-14 items-center justify-center rounded-2xl bg-[var(--color-brand-500)]/10 ring-1 ring-[var(--color-brand-500)]/20">
              <LogOut className="size-6 text-[var(--color-brand-500)]" aria-hidden />
            </div>

            <AlertDialogPrimitive.Title className="mt-4 text-lg font-bold tracking-tight text-app">
              Sign out?
            </AlertDialogPrimitive.Title>
            <AlertDialogPrimitive.Description className="mt-1.5 max-w-xs text-sm leading-relaxed text-muted">
              You&apos;ll need to sign in again to manage the site. Unsaved changes on this page will be lost.
            </AlertDialogPrimitive.Description>
          </div>

          <div className="mt-5 flex items-center gap-3 rounded-xl border border-app bg-surface-2 px-3 py-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-app bg-surface text-xs font-bold uppercase text-app">
              {initials}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-semibold text-app">{user.name ?? "Staff Member"}</p>
              {user.email && <p className="truncate text-xs text-muted">{user.email}</p>}
            </div>
            <span className="shrink-0 rounded-full border border-app bg-surface px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted">
              {user.role}
            </span>
          </div>

          <form action={action} className="mt-5 grid grid-cols-2 gap-2.5">
            <SignOutActions />
          </form>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}

// Separate component: useFormStatus only sees the <form> it is rendered inside.
function SignOutActions() {
  const { pending } = useFormStatus();
  return (
    <>
      <AlertDialogPrimitive.Cancel asChild>
        <Button type="button" variant="secondary" disabled={pending} className="min-h-11 rounded-xl">
          Cancel
        </Button>
      </AlertDialogPrimitive.Cancel>
      <Button type="submit" variant="dangerSolid" loading={pending} className="min-h-11 rounded-xl">
        {pending ? "Signing out…" : "Sign out"}
      </Button>
    </>
  );
}
