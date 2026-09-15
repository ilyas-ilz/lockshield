"use client";

import * as React from "react";
import { AlertCircle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-xl border border-[color-mix(in_srgb,var(--danger)_30%,transparent)] bg-[var(--danger-bg)] px-6 py-10 text-center">
      <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--danger)_15%,transparent)]">
        <AlertCircle className="size-5 text-[var(--danger)]" aria-hidden />
      </div>
      <h3 className="mt-3 text-sm font-semibold text-app">Something went wrong</h3>
      <p className="mt-1 text-sm text-muted max-w-md mx-auto break-words">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
          <RotateCw aria-hidden />
          Retry
        </Button>
      )}
    </div>
  );
}
