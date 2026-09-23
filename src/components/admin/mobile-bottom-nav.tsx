"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { BOTTOM_NAV_ITEMS, isNavActive } from "./nav-config";

export function MobileBottomNav({
  newLeadsCount,
  menuOpen,
  onOpenMenu,
}: {
  newLeadsCount: number;
  menuOpen: boolean;
  onOpenMenu: () => void;
}) {
  const pathname = usePathname();
  const onTab = BOTTOM_NAV_ITEMS.some((tab) => isNavActive(pathname, tab.href));
  const moreActive = menuOpen || !onTab;

  const itemClass = (active: boolean) =>
    cn(
      "relative flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-colors select-none",
      "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--color-brand-500)]",
      active
        ? "text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)]"
        : "text-muted hover:text-foreground"
    );

  const indicator = (active: boolean) =>
    active && (
      <span
        className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-b-full bg-[var(--color-brand-500)]"
        aria-hidden
      />
    );

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-app bg-surface pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_-6px_rgba(0,0,0,0.08)] lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {BOTTOM_NAV_ITEMS.map((tab) => {
          const active = isNavActive(pathname, tab.href);
          const badge = tab.href === "/admin/leads" && newLeadsCount > 0;
          return (
            <li key={tab.href}>
              <Link href={tab.href} aria-current={active ? "page" : undefined} className={itemClass(active)}>
                {indicator(active)}
                <span className="relative">
                  <tab.icon className="size-5" aria-hidden />
                  {badge && (
                    <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-brand-500)] px-1 text-[9px] font-bold leading-none text-white ring-2 ring-[var(--surface)]">
                      {newLeadsCount > 99 ? "99+" : newLeadsCount}
                    </span>
                  )}
                </span>
                {tab.label}
                {badge && <span className="sr-only">({newLeadsCount} new)</span>}
              </Link>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={onOpenMenu}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            className={cn(itemClass(moreActive), "w-full")}
          >
            {indicator(moreActive)}
            <Menu className="size-5" aria-hidden />
            More
          </button>
        </li>
      </ul>
    </nav>
  );
}
