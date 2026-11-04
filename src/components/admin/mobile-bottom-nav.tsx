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

  // Each tab: an icon in a capsule that fills when active (pill indicator),
  // label below. Press scales down slightly for tactile feedback.
  const itemClass = (active: boolean) =>
    cn(
      "group flex h-14 w-full flex-col items-center justify-center gap-0.5 rounded-2xl text-[10px] font-semibold tracking-wide select-none",
      "transition-[color,transform] duration-200 ease-out active:scale-95 motion-reduce:transition-none motion-reduce:active:scale-100",
      "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-brand-500)]",
      active ? "text-app" : "text-muted hover:text-app"
    );

  const capsule = (active: boolean) =>
    cn(
      "relative flex h-8 w-14 items-center justify-center rounded-full transition-colors duration-200 motion-reduce:transition-none",
      active
        ? "bg-[var(--color-brand-50)] text-[var(--color-brand-600)] dark:bg-[var(--color-brand-500)]/15 dark:text-[var(--color-brand-300)]"
        : "group-hover:bg-surface-2"
    );

  return (
    // Floating frosted bar. Its height lives in --admin-bottom-nav (admin-shell);
    // keep the two in sync: h-14 items + p-1.5 + 1px borders + bottom gap.
    <nav
      aria-label="Primary"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden"
    >
      <ul className="pointer-events-auto mx-auto grid max-w-md grid-cols-5 gap-0.5 rounded-[1.375rem] border border-app bg-surface/85 p-1.5 shadow-[0_16px_40px_-16px_rgba(13,18,32,0.45)] backdrop-blur-xl backdrop-saturate-150 dark:bg-surface/80 dark:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.8)]">
        {BOTTOM_NAV_ITEMS.map((tab) => {
          const active = isNavActive(pathname, tab.href);
          const badge = tab.href === "/admin/leads" && newLeadsCount > 0;
          return (
            <li key={tab.href}>
              <Link href={tab.href} aria-current={active ? "page" : undefined} className={itemClass(active)}>
                <span className={capsule(active)}>
                  <tab.icon className="size-5" strokeWidth={active ? 2.25 : 1.75} aria-hidden />
                  {badge && (
                    <span className="absolute -top-1 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-brand-500)] px-1 text-[9px] font-bold leading-none text-white ring-2 ring-[var(--surface)]">
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
            className={itemClass(moreActive)}
          >
            <span className={capsule(moreActive)}>
              <Menu className="size-5" strokeWidth={moreActive ? 2.25 : 1.75} aria-hidden />
            </span>
            More
          </button>
        </li>
      </ul>
    </nav>
  );
}
