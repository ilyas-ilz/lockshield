"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ChevronRight, ExternalLink, Globe, LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BOTTOM_NAV_ITEMS, NAV_GROUPS, isNavActive } from "./nav-config";

const IN_BOTTOM_NAV = new Set(BOTTOM_NAV_ITEMS.map((item) => item.href));

const GROUP_TINT: Record<string, string> = {
  Content: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Business: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  System: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

/**
 * Phone-only "More" menu: a bottom sheet holding every admin page that is
 * not already in the bottom bar, plus the account actions. Radix Dialog
 * supplies the focus trap, Escape-to-close and scroll lock.
 */
export function MobileMenuSheet({
  open,
  onOpenChange,
  user,
  onSignOut,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: { name?: string | null; email?: string | null; role: string };
  onSignOut: () => void;
}) {
  const pathname = usePathname();
  const isAdmin = user.role === "ADMIN";
  const close = () => onOpenChange(false);

  const groups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !IN_BOTTOM_NAV.has(item.href) && (!item.adminOnly || isAdmin)),
  })).filter((group) => group.items.length > 0);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fade-in fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="sheet-up fixed inset-x-0 bottom-0 z-50 flex max-h-[88dvh] flex-col rounded-t-3xl border-t border-app bg-surface shadow-2xl lg:hidden"
        >
          <div className="flex justify-center pt-2.5" aria-hidden>
            <span className="h-1 w-10 rounded-full bg-[var(--border)]" />
          </div>

          <div className="flex items-center justify-between px-5 pt-2 pb-3">
            <DialogPrimitive.Title className="text-lg font-bold tracking-tight text-app">Menu</DialogPrimitive.Title>
            <DialogPrimitive.Close
              aria-label="Close menu"
              className="flex size-11 items-center justify-center rounded-full bg-surface-2 text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-[var(--ring)]"
            >
              <X className="size-5" aria-hidden />
            </DialogPrimitive.Close>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {/* Account card - /admin/account is where every role changes their password */}
            <Link
              href="/admin/account"
              onClick={close}
              className="flex items-center gap-3 rounded-2xl border border-app bg-surface-2 p-3 transition-colors active:bg-[var(--surface-3)]"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-500)] text-sm font-bold uppercase text-white">
                {(user.name ?? user.email ?? "?").slice(0, 2)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold text-app">{user.name ?? "Staff Member"}</span>
                  <span className="shrink-0 rounded-full border border-app bg-surface px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-muted">
                    {user.role}
                  </span>
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted">Profile &amp; password</span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
            </Link>

            {groups.map((group) => (
              <section key={group.heading} aria-labelledby={`menu-${group.heading}`}>
                <h3
                  id={`menu-${group.heading}`}
                  className="px-1 pb-2 text-[11px] font-bold uppercase tracking-wider text-muted"
                >
                  {group.heading}
                </h3>
                <ul className="grid grid-cols-4 gap-2">
                  {group.items.map((item) => {
                    const active = isNavActive(pathname, item.href);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={close}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex h-full min-h-20 flex-col items-center justify-center gap-1.5 rounded-2xl border px-1 py-2.5 text-center transition-colors",
                            "focus-visible:outline-2 focus-visible:outline-[var(--ring)]",
                            active
                              ? "border-[var(--color-brand-500)]/40 bg-[var(--color-brand-500)]/5"
                              : "border-app bg-surface active:bg-surface-2"
                          )}
                        >
                          <span
                            className={cn(
                              "flex size-10 items-center justify-center rounded-xl",
                              active
                                ? "bg-[var(--color-brand-500)] text-white"
                                : GROUP_TINT[group.heading] ?? "bg-surface-2 text-muted"
                            )}
                          >
                            <item.icon className="size-5" aria-hidden />
                          </span>
                          <span
                            className={cn(
                              "text-[11px] font-semibold leading-tight",
                              active ? "text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)]" : "text-app"
                            )}
                          >
                            {item.label}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}

            <div className="divide-y divide-line overflow-hidden rounded-2xl border border-app">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-12 items-center gap-3 px-4 text-sm font-medium text-app transition-colors active:bg-surface-2"
              >
                <Globe className="size-5 text-muted" aria-hidden />
                <span className="flex-1">View website</span>
                <ExternalLink className="size-4 text-muted" aria-hidden />
              </a>
              <button
                type="button"
                onClick={() => {
                  close();
                  onSignOut();
                }}
                className="flex min-h-12 w-full items-center gap-3 px-4 text-sm font-semibold text-[var(--danger)] transition-colors active:bg-surface-2"
              >
                <LogOut className="size-5" aria-hidden />
                Sign out
              </button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
