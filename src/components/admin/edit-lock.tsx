"use client";

import * as React from "react";
import { ArrowRight, Lock, Pencil, Undo2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import type { FieldChange } from "@/lib/admin/field-diff";

/**
 * Edit-lock for forms showing already-saved data.
 *
 * WHY: saved records (settings, users, content) opened as live inputs, so a
 * stray keystroke — one digit of a phone number — was saved along with the
 * real edit. Saved data now opens read-only; "Edit" unlocks it, and Save
 * shows a before/after list to confirm first.
 */

const ReadOnlyContext = React.createContext(false);

/** True inside a locked form — for fields a <fieldset disabled> can't reach (contenteditable). */
export function useFieldsReadOnly(): boolean {
  return React.useContext(ReadOnlyContext);
}

interface LockedFieldsetProps {
  locked: boolean;
  children: React.ReactNode;
  className?: string;
}

/** Native `disabled` fieldset disables every input, select trigger and button inside. */
export function LockedFieldset({ locked, children, className }: LockedFieldsetProps) {
  return (
    <ReadOnlyContext.Provider value={locked}>
      <fieldset disabled={locked} aria-readonly={locked} className={className}>
        {children}
      </fieldset>
    </ReadOnlyContext.Provider>
  );
}

interface EditLockActionsProps {
  editing: boolean;
  dirty: boolean;
  saving: boolean;
  onEdit: () => void;
  onDiscard: () => void;
  saveLabel?: string;
  size?: "sm" | "md";
}

/** Edit / Discard / Save buttons — render OUTSIDE the LockedFieldset so they stay clickable. */
export function EditLockActions({
  editing,
  dirty,
  saving,
  onEdit,
  onDiscard,
  saveLabel = "Save changes",
  size = "sm",
}: EditLockActionsProps) {
  if (!editing) {
    return (
      <Button type="button" variant="primary" size={size} onClick={onEdit} className="w-full sm:w-auto">
        <Pencil className="size-3.5" aria-hidden />
        Edit
      </Button>
    );
  }
  return (
    <div className="flex w-full gap-2 sm:w-auto">
      <Button type="button" variant="secondary" size={size} onClick={onDiscard} disabled={saving} className="flex-1 sm:flex-none">
        <Undo2 className="size-3.5" aria-hidden />
        {dirty ? "Discard" : "Cancel"}
      </Button>
      <Button type="submit" variant="primary" size={size} loading={saving} className="flex-1 sm:flex-none">
        {saving ? "Saving…" : saveLabel}
      </Button>
    </div>
  );
}

/** Small status line for the action bar. */
export function EditLockStatus({ editing, changeCount }: { editing: boolean; changeCount: number }) {
  if (!editing) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted">
        <Lock className="size-3.5" aria-hidden />
        Locked. Click Edit to make changes.
      </span>
    );
  }
  return (
    <span className="text-xs text-muted">
      {changeCount === 0 ? "Editing. No changes yet." : `${changeCount} unsaved change${changeCount === 1 ? "" : "s"}`}
    </span>
  );
}

interface ReviewChangesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  changes: FieldChange[];
  onConfirm: () => Promise<void> | void;
}

export function ReviewChangesDialog({ open, onOpenChange, changes, onConfirm }: ReviewChangesDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Save ${changes.length} change${changes.length === 1 ? "" : "s"}?`}
      description="Check the new values before they go live."
      confirmLabel="Confirm & save"
      cancelLabel="Keep editing"
      destructive={false}
      onConfirm={onConfirm}
    >
      <ul className="space-y-2.5">
        {changes.map((c) => (
          <li key={c.name} className="rounded-lg border border-app bg-surface-2/40 p-3 text-sm">
            <p className="mb-1.5 font-semibold text-app">{c.label}</p>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[1fr_auto_1fr] sm:items-start">
              <p className="text-muted line-through decoration-1 [overflow-wrap:anywhere]">{c.before}</p>
              <ArrowRight className="hidden size-4 text-muted sm:block" aria-hidden />
              <p className="font-medium text-app [overflow-wrap:anywhere]">
                <span className="sr-only">New value: </span>
                {c.after}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </ConfirmDialog>
  );
}
