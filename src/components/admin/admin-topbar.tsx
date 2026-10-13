"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ChevronRight, Inbox, Moon, Search, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatRelative } from "@/lib/format-relative";
import { cn } from "@/lib/utils";
import { initialsOf } from "@/lib/initials";
import { AdminUserMenu, displayName, type AdminUser } from "./admin-user-menu";
import { markLeadsSeen } from "./mark-leads-seen";
import { toggleAdminTheme, useAdminTheme } from "./use-admin-theme";

export interface NewLeadPreview {
  _id: string;
  name: string;
  source: string;
  createdAt: string;
}

const ROUTE_NAMES: Record<string, string> = {
  posts: "Blog Posts",
  categories: "Categories",
  tags: "Tags",
  pages: "Pages",
  services: "Services",
  projects: "Projects",
  jobs: "Careers",
  media: "Media Library",
  leads: "Leads",
  redirects: "Redirects",
  settings: "Settings",
  account: "My Account",
  users: "Users",
  new: "Create New",
};

const iconButton =
  "relative flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl text-muted transition-colors hover:bg-surface-2 hover:text-app focus-visible:outline-2 focus-visible:outline-[var(--ring)]";

function useBreadcrumbs(pathname: string) {
  return React.useMemo(() => {
    const parts = pathname.replace(/^\/admin/, "").split("/").filter(Boolean);
    const items: { label: string; href: string }[] = [{ label: "Dashboard", href: "/admin" }];
    let current = "/admin";
    parts.forEach((part, index) => {
      current += `/${part}`;
      const isId = /^[0-9a-f]{24}$/.test(part) || /^[a-z0-9_-]{10,}$/.test(part);
      // Known route names win: "categories" is 10 chars and matched the id pattern.
      const label = ROUTE_NAMES[part] ?? (isId ? "Edit Item" : part.charAt(0).toUpperCase() + part.slice(1));
      items.push({ label, href: index === parts.length - 1 ? "" : current });
    });
    return items;
  }, [pathname]);
}

function greeting(): string {
  // Dubai time, so a late-night edit doesn't get "Good morning" from a UTC server.
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: "Asia/Dubai" }).format(new Date())
  );
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function AdminTopbar({
  pathname,
  user,
  newLeadsCount,
  newLeads,
  onOpenPalette,
  onSignOut,
}: {
  pathname: string;
  user: AdminUser;
  newLeadsCount: number;
  newLeads: NewLeadPreview[];
  onOpenPalette: () => void;
  onSignOut: () => void;
}) {
  const breadcrumbs = useBreadcrumbs(pathname);
  const isDashboard = pathname === "/admin";
  const firstName = displayName(user).split(/[\s@]/)[0];
  const dark = useAdminTheme();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-app bg-surface/90 px-4 backdrop-blur-md sm:h-18 sm:px-6 lg:px-8">
      {/* Phone: brand mark; the menu lives in the bottom nav */}
      <Link href="/admin" className="flex shrink-0 items-center gap-2 sm:hidden">
        <Image
          src="/assets/images/logo-shield.webp"
          alt=""
          width={32}
          height={33}
          className="size-8 object-contain dark:rounded-lg dark:bg-white dark:p-0.5"
        />
        <span className="font-tech text-sm font-bold uppercase tracking-tight text-app">Lock Shield</span>
      </Link>

      <div className="hidden min-w-0 flex-1 sm:block">
        {isDashboard ? (
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold leading-tight text-app" suppressHydrationWarning>
              {greeting()}, {firstName}
            </p>
            <p className="truncate text-sm text-muted">Here&apos;s what needs your attention across Lock Shield today.</p>
          </div>
        ) : (
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm text-muted">
            {breadcrumbs.map((crumb, i) => {
              const isLast = i === breadcrumbs.length - 1;
              return (
                <React.Fragment key={crumb.label + i}>
                  {i > 0 && <ChevronRight className="size-3.5 shrink-0 text-muted/60" aria-hidden />}
                  {crumb.href && !isLast ? (
                    <Link href={crumb.href} className="truncate transition-colors hover:text-app">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span aria-current={isLast ? "page" : undefined} className={cn("truncate", isLast && "font-semibold text-app")}>
                      {crumb.label}
                    </span>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        )}
      </div>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        {/* Search: full pill on tablet+, icon on phones */}
        <button
          type="button"
          onClick={onOpenPalette}
          aria-label="Search (Ctrl K)"
          aria-keyshortcuts="Control+K Meta+K"
          className="hidden h-10 w-56 cursor-pointer items-center gap-2.5 rounded-xl border border-app bg-surface px-3 text-sm text-muted transition-colors hover:border-[color-mix(in_srgb,var(--text-muted)_40%,var(--border))] hover:text-app focus-visible:outline-2 focus-visible:outline-[var(--ring)] md:flex xl:w-64"
        >
          <Search className="size-4 shrink-0" aria-hidden />
          <span className="flex-1 text-left">Search</span>
          <kbd className="rounded-md border border-app bg-surface-2 px-1.5 py-0.5 font-mono text-[11px] leading-none">Ctrl K</kbd>
        </button>
        <button type="button" onClick={onOpenPalette} aria-label="Search" className={cn(iconButton, "md:hidden")}>
          <Search className="size-5" aria-hidden />
        </button>

        <span className="mx-1 hidden h-6 w-px bg-[var(--border)] md:block" aria-hidden />

        <NotificationsMenu count={newLeadsCount} leads={newLeads} />

        <button
          type="button"
          onClick={toggleAdminTheme}
          aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
          className={iconButton}
        >
          {dark ? <Sun className="size-5" aria-hidden /> : <Moon className="size-5" aria-hidden />}
        </button>

        <AdminUserMenu user={user} onSignOut={onSignOut}>
          <button
            type="button"
            aria-label={`Account menu for ${displayName(user)}`}
            className="ml-1 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-[var(--color-brand-500)] text-sm font-bold text-white shadow-[0_6px_14px_-6px_var(--color-brand-500)] transition-colors hover:bg-[var(--color-brand-600)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
          >
            {initialsOf(displayName(user)).slice(0, 1)}
          </button>
        </AdminUserMenu>
      </div>
    </header>
  );
}

function NotificationsMenu({ count, leads }: { count: number; leads: NewLeadPreview[] }) {
  const router = useRouter();
  // Opening the bell is "looking at" the leads: clear the unseen badge, up to
  // the newest one listed (a lead arriving meanwhile stays unseen).
  function onOpenChange(open: boolean) {
    if (!open || count === 0) return;
    void markLeadsSeen(leads[0]?.createdAt).then((marked) => {
      if (marked) router.refresh();
    });
  }

  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <button type="button" aria-label={count > 0 ? `Notifications: ${count} new leads` : "Notifications"} className={iconButton}>
          <Bell className="size-5" aria-hidden />
          {count > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-brand-500)] px-1 text-[9px] font-bold leading-none text-white ring-2 ring-[var(--surface)]">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <p className="text-sm font-semibold text-app">Notifications</p>
          {count > 0 && (
            <span className="rounded-full bg-[var(--color-brand-50)] px-2 py-0.5 text-xs font-semibold text-[var(--color-brand-700)] dark:bg-[var(--color-brand-500)]/15 dark:text-[var(--color-brand-300)]">
              {count} new
            </span>
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />
        {leads.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <Inbox className="mx-auto size-6 text-muted" aria-hidden />
            <p className="mt-2 text-sm font-semibold text-app">You&apos;re all caught up</p>
            <p className="mt-0.5 text-xs text-muted">New website enquiries will show up here.</p>
          </div>
        ) : (
          <div className="p-1.5">
            {leads.map((lead) => (
              <DropdownMenuItem key={lead._id} asChild className="items-start py-2.5">
                <Link href={`/admin/leads?search=${encodeURIComponent(lead.name)}`}>
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-semibold text-app">
                    {initialsOf(lead.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-app">{lead.name}</span>
                    <span className="block text-xs text-muted" suppressHydrationWarning>
                      New {lead.source} enquiry · {formatRelative(lead.createdAt)}
                    </span>
                  </span>
                </Link>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        <DropdownMenuSeparator className="m-0" />
        <div className="p-1.5">
          <DropdownMenuItem asChild className="justify-center font-semibold text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)]">
            <Link href={count > 0 ? "/admin/leads?status=new" : "/admin/leads"}>View all leads</Link>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
