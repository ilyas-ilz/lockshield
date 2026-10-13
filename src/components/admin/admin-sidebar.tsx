"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronRight, PanelLeftClose } from "lucide-react";
import { cn } from "@/lib/utils";
import { initialsOf } from "@/lib/initials";
import { AdminUserMenu, displayName, type AdminUser } from "./admin-user-menu";
import {
  NAV_FOOTER_ITEM,
  NAV_GROUPS,
  canSee,
  isNavActive,
  isNavFolder,
  type NavFolder,
  type NavItem,
} from "./nav-config";

// One restrained active treatment everywhere: faint red wash + red icon.
// No filled icon tiles, no pill labels - red is reserved for "you are here"
// and the lead count, so it still means something.
const rowBase =
  "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors select-none collapsed:justify-center collapsed:px-0";
const rowIdle = "font-medium text-foreground/80 hover:bg-surface-2 hover:text-app";
const rowActive = "bg-[var(--color-brand-50)] font-semibold text-app dark:bg-[var(--color-brand-500)]/10";

function folderHasActive(folder: NavFolder, pathname: string): boolean {
  return folder.sections.some((s) => s.items.some((i) => isNavActive(pathname, i.href)));
}

export function AdminSidebar({
  pathname,
  user,
  newLeadsCount,
  collapsed,
  onToggleCollapsed,
  onExpand,
  onSignOut,
}: {
  pathname: string;
  user: AdminUser;
  newLeadsCount: number;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onExpand: () => void;
  onSignOut: () => void;
}) {
  const isAdmin = user.role === "ADMIN";

  // The folder holding the current page opens by itself and stays open while
  // moving between its pages; other folders remember the user's own clicks.
  const [open, setOpen] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const group of NAV_GROUPS)
      for (const entry of group.entries)
        if (isNavFolder(entry)) initial[entry.id] = folderHasActive(entry, pathname);
    return initial;
  });

  React.useEffect(() => {
    for (const group of NAV_GROUPS)
      for (const entry of group.entries)
        if (isNavFolder(entry) && folderHasActive(entry, pathname))
          setOpen((prev) => (prev[entry.id] ? prev : { ...prev, [entry.id]: true }));
  }, [pathname]);

  function toggleFolder(id: string) {
    if (collapsed) {
      onExpand();
      setOpen((prev) => ({ ...prev, [id]: true }));
      return;
    }
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const leadBadge = (href: string) =>
    href === "/admin/leads" && newLeadsCount > 0 ? (newLeadsCount > 99 ? "99+" : String(newLeadsCount)) : null;

  function renderTopLink(item: NavItem) {
    const active = isNavActive(pathname, item.href);
    const badge = leadBadge(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? "page" : undefined}
        title={collapsed ? item.label : undefined}
        className={cn(rowBase, active ? rowActive : rowIdle)}
      >
        <span className="relative flex shrink-0">
          <item.icon
            className={cn(
              "size-4.5 transition-colors",
              active ? "text-[var(--color-brand-500)]" : "text-muted group-hover:text-app"
            )}
            aria-hidden
          />
          {badge && (
            <span
              className="absolute -top-1 -right-1 hidden size-2 rounded-full bg-[var(--color-brand-500)] ring-2 ring-[var(--surface)] collapsed:block"
              aria-hidden
            />
          )}
        </span>
        <span className="min-w-0 flex-1 truncate collapsed:hidden">{item.label}</span>
        {badge && (
          <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-500)] px-1.5 text-[11px] font-semibold text-white collapsed:hidden">
            {badge}
            <span className="sr-only"> new</span>
          </span>
        )}
      </Link>
    );
  }

  function renderFolder(folder: NavFolder) {
    const sections = folder.sections
      .map((s) => ({ ...s, items: s.items.filter((i) => canSee(i, isAdmin)) }))
      .filter((s) => s.items.length > 0);
    if (sections.length === 0) return null;

    const isOpen = Boolean(open[folder.id]) && !collapsed;
    // Parent only hints at the active child while closed; once open, the child
    // itself carries the highlight so "where am I" is never ambiguous.
    const childActive = folderHasActive(folder, pathname) && !isOpen;
    const panelId = `nav-folder-${folder.id}`;

    return (
      <div key={folder.id}>
        <button
          type="button"
          onClick={() => toggleFolder(folder.id)}
          aria-expanded={isOpen}
          aria-controls={panelId}
          title={collapsed ? folder.label : undefined}
          className={cn(rowBase, "cursor-pointer text-left", childActive ? rowActive : rowIdle)}
        >
          <folder.icon
            className={cn(
              "size-4.5 shrink-0 transition-colors",
              childActive ? "text-[var(--color-brand-500)]" : "text-muted group-hover:text-app"
            )}
            aria-hidden
          />
          <span className="min-w-0 flex-1 truncate collapsed:hidden">{folder.label}</span>
          {isOpen ? (
            <ChevronDown className="size-4 shrink-0 text-muted collapsed:hidden" aria-hidden />
          ) : (
            <ChevronRight className="size-4 shrink-0 text-muted collapsed:hidden" aria-hidden />
          )}
        </button>

        {isOpen && (
          <div id={panelId} className="space-y-3 pb-2 pl-7 pt-2">
            {sections.map((section) => (
              <div key={section.heading}>
                {/* Section label, not a link: uppercase + brand colour + marker so
                    it can't be mistaken for a menu item. */}
                <p className="flex items-center gap-2 px-3 pb-1.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)]">
                  <span className="h-px w-2.5 bg-current" aria-hidden />
                  {section.heading}
                </p>
                <ul className="space-y-px">
                  {section.items.map((item) => {
                    const active = isNavActive(pathname, item.href);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            // pl-7.5 lines the text up with the label after its marker
                            "relative block rounded-lg py-1.5 pl-7.5 pr-3 text-sm transition-colors",
                            active
                              ? "bg-[var(--color-brand-50)] font-semibold text-[var(--color-brand-600)] before:absolute before:left-0 before:top-1/2 before:h-4 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-[var(--color-brand-500)] dark:bg-[var(--color-brand-500)]/10 dark:text-[var(--color-brand-400)]"
                              : "text-foreground/70 hover:bg-surface-2 hover:text-app"
                          )}
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <aside
      aria-label="Admin navigation"
      className="fixed inset-y-0 left-0 z-30 hidden w-68 flex-col border-r border-app bg-surface transition-[width] duration-200 ease-out lg:flex collapsed:w-19"
    >
      {/* Brand */}
      <div className="relative flex h-18 shrink-0 items-center gap-2.5 border-b border-app px-4 collapsed:justify-center collapsed:px-0">
        <Link href="/admin" className="group flex min-w-0 flex-1 items-center gap-2.5 collapsed:flex-none" title="Dashboard">
          <Image
            src="/assets/images/logo-shield.webp"
            alt=""
            width={36}
            height={37}
            priority
            // Dark mode: white tile, or the navy "LS" disappears into the surface.
            className="size-9 shrink-0 object-contain transition-transform group-hover:scale-105 dark:rounded-lg dark:bg-white dark:p-1"
          />
          <span className="min-w-0 collapsed:hidden">
            <span className="font-tech block truncate text-[15px] font-bold uppercase leading-none tracking-tight text-app">
              Lock Shield
            </span>
            <span className="mt-1 block truncate text-xs text-muted">Admin Panel</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-pressed={collapsed}
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-app focus-visible:outline-2 focus-visible:outline-[var(--ring)] collapsed:absolute collapsed:top-5 collapsed:-right-3.5 collapsed:size-7 collapsed:rounded-full collapsed:border collapsed:border-app collapsed:bg-surface collapsed:shadow-xs"
        >
          <PanelLeftClose className="size-4 transition-transform collapsed:size-3.5 collapsed:rotate-180" aria-hidden />
        </button>
      </div>

      {/* Nav */}
      <nav className="admin-scroll flex-1 space-y-6 overflow-y-auto overscroll-contain px-3 py-5">
        {NAV_GROUPS.map((group) => {
          const entries = group.entries.filter((e) => isNavFolder(e) || canSee(e, isAdmin));
          if (entries.length === 0) return null;
          return (
            <div key={group.heading}>
              <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted/80 collapsed:hidden">
                {group.heading}
              </p>
              <span className="mx-auto mb-2 hidden h-px w-6 bg-[var(--border)] collapsed:block" aria-hidden />
              <div className="space-y-0.5">
                {entries.map((entry) => (isNavFolder(entry) ? renderFolder(entry) : renderTopLink(entry)))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer: settings + account, pinned to the bottom */}
      <div className="shrink-0 border-t border-app px-3 py-3">
        {canSee(NAV_FOOTER_ITEM, isAdmin) && <div className="pb-2">{renderTopLink(NAV_FOOTER_ITEM)}</div>}
        <AdminUserMenu
          user={user}
          onSignOut={onSignOut}
          side={collapsed ? "right" : "top"}
          align={collapsed ? "end" : "start"}
        >
          <button
            type="button"
            title={collapsed ? displayName(user) : undefined}
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-[var(--ring)] collapsed:justify-center collapsed:p-1.5"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-navy-900)] text-xs font-semibold text-white dark:bg-surface-2 dark:text-app">
              {initialsOf(displayName(user))}
            </span>
            <span className="min-w-0 flex-1 collapsed:hidden">
              <span className="block truncate text-sm font-semibold text-app">{displayName(user)}</span>
              <span className="block truncate text-xs text-muted">
                {user.role === "ADMIN" ? "Administrator" : "Editor"}
              </span>
            </span>
            <ChevronRight className="size-4 shrink-0 text-muted collapsed:hidden" aria-hidden />
          </button>
        </AdminUserMenu>
      </div>
    </aside>
  );
}
