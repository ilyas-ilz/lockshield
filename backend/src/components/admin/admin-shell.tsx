"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Tags,
  Files,
  Wrench,
  Building2,
  Briefcase,
  Signpost,
  Inbox,
  Settings as SettingsIcon,
  Users,
  Menu,
  X,
  LogOut,
  Moon,
  Sun,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

const NAV_GROUPS: { heading: string; items: NavItem[] }[] = [
  {
    heading: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    heading: "Content",
    items: [
      { href: "/admin/posts", label: "Blog Posts", icon: FileText },
      { href: "/admin/categories", label: "Categories", icon: FolderTree },
      { href: "/admin/tags", label: "Tags", icon: Tags },
      { href: "/admin/pages", label: "Pages", icon: Files },
      { href: "/admin/services", label: "Services", icon: Wrench },
      { href: "/admin/projects", label: "Projects", icon: Building2 },
      { href: "/admin/jobs", label: "Careers", icon: Briefcase },
    ],
  },
  {
    heading: "Business",
    items: [
      { href: "/admin/leads", label: "Leads", icon: Inbox },
      { href: "/admin/redirects", label: "Redirects", icon: Signpost, adminOnly: true },
      { href: "/admin/settings", label: "Settings", icon: SettingsIcon, adminOnly: true },
      { href: "/admin/users", label: "Users", icon: Users, adminOnly: true },
    ],
  },
];

export function AdminShell({
  user,
  onSignOut,
  children,
}: {
  user: { name?: string | null; email?: string | null; role: string };
  onSignOut: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const isAdmin = user.role === "ADMIN";

  // Close the drawer on navigation — otherwise it stays open over the new page.
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile drawer is open.
  React.useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const nav = (
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
      {NAV_GROUPS.map((group) => {
        const items = group.items.filter((item) => !item.adminOnly || isAdmin);
        if (items.length === 0) return null;
        return (
          <div key={group.heading}>
            <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">{group.heading}</p>
            <ul className="space-y-0.5">
              {items.map((item) => {
                // WHY the exact check for /admin: every other route starts
                // with it, so a prefix match would light up Dashboard on
                // every page.
                const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors min-h-11 lg:min-h-0 lg:py-2",
                        active
                          ? "bg-[var(--color-brand-500)] text-white font-medium"
                          : "text-app hover:bg-surface-2"
                      )}
                    >
                      <item.icon className="size-4 shrink-0" aria-hidden />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );

  const brand = (
    <div className="flex h-14 items-center gap-2 border-b border-app px-4 shrink-0">
      <div className="flex size-7 items-center justify-center rounded-md bg-[var(--color-brand-500)]">
        <ShieldCheck className="size-4 text-white" aria-hidden />
      </div>
      <span className="font-semibold text-sm tracking-tight">Lock Shield</span>
    </div>
  );

  const userBlock = (
    <div className="border-t border-app p-3 shrink-0">
      <div className="flex items-center gap-2.5 px-2 py-2">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-semibold uppercase">
          {(user.name ?? user.email ?? "?").slice(0, 2)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{user.name ?? "Staff"}</p>
          <p className="truncate text-xs text-muted">{user.role}</p>
        </div>
      </div>
      {onSignOut}
    </div>
  );

  return (
    <div className="min-h-dvh bg-app">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-60 flex-col border-r border-app bg-surface">
        {brand}
        {nav}
        {userBlock}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <aside
            className="fixed inset-y-0 left-0 z-50 flex w-[min(17rem,85vw)] flex-col border-r border-app bg-surface lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
          >
            <div className="flex h-14 items-center justify-between border-b border-app px-4 shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-md bg-[var(--color-brand-500)]">
                  <ShieldCheck className="size-4 text-white" aria-hidden />
                </div>
                <span className="font-semibold text-sm">Lock Shield</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Close navigation">
                <X aria-hidden />
              </Button>
            </div>
            {nav}
            {userBlock}
          </aside>
        </>
      )}

      <div className="lg:pl-60">
        {/* Top bar — sticky so the menu button is always reachable on mobile */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-app bg-surface/95 backdrop-blur px-3 sm:px-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu aria-hidden />
          </Button>
          <div className="flex-1" />
          <ThemeToggle />
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

function ThemeToggle() {
  const [dark, setDark] = React.useState(false);

  React.useEffect(() => {
    const stored = localStorage.getItem("ls-admin-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored ? stored === "dark" : prefersDark;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("ls-admin-theme", next ? "dark" : "light");
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}>
      {dark ? <Sun aria-hidden /> : <Moon aria-hidden />}
    </Button>
  );
}

export function SignOutButton() {
  return (
    <Button type="submit" variant="secondary" size="sm" className="w-full justify-start">
      <LogOut aria-hidden />
      Sign out
    </Button>
  );
}
