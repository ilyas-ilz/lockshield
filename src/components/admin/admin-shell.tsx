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
  ChevronRight,
  Plus,
  Image as ImageIcon,
  type LucideIcon,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/card";
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
      { href: "/admin/media", label: "Media Library", icon: ImageIcon },
    ],
  },
  {
    heading: "Business",
    items: [
      { href: "/admin/services", label: "Services", icon: Wrench },
      { href: "/admin/projects", label: "Projects", icon: Building2 },
      { href: "/admin/jobs", label: "Careers", icon: Briefcase },
      { href: "/admin/leads", label: "Leads", icon: Inbox },
    ],
  },
  {
    heading: "System",
    items: [
      { href: "/admin/redirects", label: "Redirects", icon: Signpost, adminOnly: true },
      { href: "/admin/settings", label: "Settings", icon: SettingsIcon, adminOnly: true },
      { href: "/admin/users", label: "Users", icon: Users, adminOnly: true },
    ],
  },
];

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

export function AdminShell({
  user,
  newLeadsCount = 0,
  onSignOut,
  children,
}: {
  user: { name?: string | null; email?: string | null; role: string };
  newLeadsCount?: number;
  onSignOut: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const isAdmin = user.role === "ADMIN";

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Generate breadcrumb items from pathname
  const breadcrumbs = React.useMemo(() => {
    const parts = pathname.replace(/^\/admin/, "").split("/").filter(Boolean);
    if (parts.length === 0) return [{ label: "Dashboard", href: "/admin" }];

    const items = [{ label: "Dashboard", href: "/admin" }];
    let currentPath = "/admin";

    parts.forEach((part, index) => {
      currentPath += `/${part}`;
      const isLast = index === parts.length - 1;
      const isId = /^[0-9a-f]{24}$/.test(part) || /^[a-z0-9_-]{10,}$/.test(part);
      const label = isId ? "Edit Item" : ROUTE_NAMES[part] || part.charAt(0).toUpperCase() + part.slice(1);
      items.push({ label, href: isLast ? "" : currentPath });
    });

    return items;
  }, [pathname]);

  const nav = (
    <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
      {NAV_GROUPS.map((group) => {
        const items = group.items.filter((item) => !item.adminOnly || isAdmin);
        if (items.length === 0) return null;
        return (
          <div key={group.heading} className="space-y-1">
            <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-muted/70">
              {group.heading}
            </p>
            <ul className="space-y-0.5">
              {items.map((item) => {
                const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                const isLeads = item.href === "/admin/leads";
                const showLeadBadge = isLeads && newLeadsCount > 0;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group relative flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150 select-none",
                        active
                          ? "bg-[var(--color-brand-500)]/10 text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)] font-semibold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r-full before:bg-[var(--color-brand-500)]"
                          : "text-muted hover:text-foreground hover:bg-surface-2/70"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <item.icon
                          className={cn(
                            "size-4 shrink-0 transition-colors",
                            active
                              ? "text-[var(--color-brand-500)]"
                              : "text-muted/80 group-hover:text-foreground"
                          )}
                          aria-hidden
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {showLeadBadge && (
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-500)] text-[10px] font-bold text-white shadow-2xs">
                          {newLeadsCount > 99 ? "99+" : newLeadsCount}
                        </span>
                      )}
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
    <div className="flex h-15 items-center justify-between border-b border-app px-4 shrink-0 bg-surface">
      <Link href="/admin" className="flex items-center gap-2.5 group">
        <div className="flex size-8 items-center justify-center rounded-xl bg-[var(--color-brand-500)] text-white shadow-xs group-hover:scale-105 transition-transform">
          <ShieldCheck className="size-4.5" aria-hidden />
        </div>
        <div>
          <span className="font-bold text-sm tracking-tight text-foreground block leading-tight">
            Lock Shield
          </span>
          <span className="text-[10px] font-medium text-muted flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            Admin Suite
          </span>
        </div>
      </Link>
    </div>
  );

  const userBlock = (
    <div className="border-t border-app p-3.5 shrink-0 space-y-2 bg-surface">
      <Link
        href="/admin/account"
        onClick={() => setMobileOpen(false)}
        className="flex items-center gap-2.5 rounded-xl px-2 py-1 transition-colors hover:bg-surface-2"
      >
        <div className="flex size-8.5 shrink-0 items-center justify-center rounded-full bg-surface-2 border border-app text-xs font-bold uppercase text-foreground">
          {(user.name ?? user.email ?? "?").slice(0, 2)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-foreground">{user.name ?? "Staff Member"}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Badge tone={isAdmin ? "brand" : "neutral"} className="text-[10px] px-1.5 py-0 h-4">
              {user.role}
            </Badge>
          </div>
        </div>
      </Link>

      {/* WHY here and not under System: /admin/account is the one settings-ish
          page every role can open, and System is admin-only. Editors are
          exactly who needs it — they arrive with a temporary password. */}
      <Link
        href="/admin/account"
        onClick={() => setMobileOpen(false)}
        className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
      >
        <KeyRound className="size-3.5" aria-hidden />
        Change password
      </Link>

      {onSignOut}
    </div>
  );

  return (
    <div className="min-h-dvh bg-app">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-62 flex-col border-r border-app bg-surface shadow-2xs">
        {brand}
        {nav}
        {userBlock}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <aside
            className="fixed inset-y-0 left-0 z-50 flex w-[min(18rem,85vw)] flex-col border-r border-app bg-surface shadow-2xl lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
          >
            <div className="flex h-15 items-center justify-between border-b border-app px-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-xl bg-[var(--color-brand-500)] text-white shadow-xs">
                  <ShieldCheck className="size-4.5" aria-hidden />
                </div>
                <span className="font-bold text-sm">Lock Shield Admin</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Close navigation">
                <X className="size-4" aria-hidden />
              </Button>
            </div>
            {nav}
            {userBlock}
          </aside>
        </>
      )}

      <div className="lg:pl-62">
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex h-15 items-center justify-between gap-3 border-b border-app bg-surface/85 backdrop-blur-md px-4 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden shrink-0"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="size-4.5" aria-hidden />
            </Button>

            {/* Breadcrumb Trail */}
            <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs text-muted truncate">
              {breadcrumbs.map((crumb, i) => {
                const isLast = i === breadcrumbs.length - 1;
                return (
                  <React.Fragment key={crumb.label + i}>
                    {i > 0 && <ChevronRight className="size-3 text-muted/60 shrink-0" />}
                    {crumb.href && !isLast ? (
                      <Link href={crumb.href} className="hover:text-foreground transition-colors truncate">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className={cn("truncate font-medium", isLast && "text-foreground font-semibold")}>
                        {crumb.label}
                      </span>
                    )}
                  </React.Fragment>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Create Button */}
            <Button variant="primary" size="sm" asChild className="hidden sm:inline-flex shadow-xs">
              <Link href="/admin/posts/new">
                <Plus className="size-3.5 mr-1" />
                New Post
              </Link>
            </Button>

            <ThemeToggle />
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}

function ThemeToggle() {
  // Start false to match SSR (no `document` on the server) and avoid a
  // hydration mismatch; sync from the real DOM state right after mount -
  // the inline pre-hydration script in the root layout already applied
  // .dark before paint, so this only corrects the icon, not the page,
  // which is what actually flashed before.
  const [dark, setDark] = React.useState(false);

  React.useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("ls-admin-theme", next ? "dark" : "light");
  }

  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      className="size-8.5 rounded-xl border-app shadow-2xs"
    >
      {dark ? <Sun className="size-4 text-amber-400" aria-hidden /> : <Moon className="size-4 text-slate-700" aria-hidden />}
    </Button>
  );
}

export function SignOutButton() {
  return (
    <Button type="submit" variant="secondary" size="sm" className="w-full justify-start text-xs rounded-xl">
      <LogOut className="size-3.5 mr-1 text-muted" aria-hidden />
      Sign out
    </Button>
  );
}

