"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "./admin-sidebar";
import { AdminTopbar, type NewLeadPreview } from "./admin-topbar";
import type { AdminUser } from "./admin-user-menu";
import { CommandPalette } from "./command-palette";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { MobileMenuSheet } from "./mobile-menu-sheet";
import { SignOutDialog } from "./sign-out-dialog";

const SIDEBAR_KEY = "ls-admin-sidebar";

export function AdminShell({
  user,
  newLeadsCount = 0,
  newLeads = [],
  signOutAction,
  children,
}: {
  user: AdminUser;
  newLeadsCount?: number;
  newLeads?: NewLeadPreview[];
  signOutAction: () => Promise<void>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [signOutOpen, setSignOutOpen] = React.useState(false);
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  // The <html data-sidebar> attribute (set pre-paint by the root layout)
  // drives the actual width via the `collapsed:` variant; this state only
  // mirrors it for aria/tooltips, so starting false can't cause a flash.
  const [collapsed, setCollapsed] = React.useState(false);

  React.useEffect(() => {
    setCollapsed(document.documentElement.dataset.sidebar === "collapsed");
  }, []);

  const setSidebar = React.useCallback((next: boolean) => {
    setCollapsed(next);
    if (next) document.documentElement.dataset.sidebar = "collapsed";
    else delete document.documentElement.dataset.sidebar;
    try {
      localStorage.setItem(SIDEBAR_KEY, next ? "collapsed" : "expanded");
    } catch {
      // storage blocked: the choice just won't survive a reload
    }
  }, []);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // The sheet is lg:hidden - if the viewport grows past lg while it's open
  // (tablet rotation), close it so an invisible dialog doesn't trap focus.
  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 64rem)");
    const onChange = () => mq.matches && setMobileOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openSignOut = React.useCallback(() => setSignOutOpen(true), []);

  return (
    // WHY the CSS var: the mobile bottom nav is fixed, so page padding and the
    // sticky save bars in forms both need to clear it; 0 on desktop.
    <div className="font-admin min-h-dvh bg-app [--admin-bottom-nav:calc(3.5rem_+_1px_+_env(safe-area-inset-bottom))] lg:[--admin-bottom-nav:0px]">
      <AdminSidebar
        pathname={pathname}
        user={user}
        newLeadsCount={newLeadsCount}
        collapsed={collapsed}
        onToggleCollapsed={() => setSidebar(!collapsed)}
        onExpand={() => setSidebar(false)}
        onSignOut={openSignOut}
      />

      <div className="pb-(--admin-bottom-nav) transition-[padding] duration-200 ease-out lg:pl-68 collapsed:pl-19">
        <AdminTopbar
          pathname={pathname}
          user={user}
          newLeadsCount={newLeadsCount}
          newLeads={newLeads}
          onOpenPalette={() => setPaletteOpen(true)}
          onSignOut={openSignOut}
        />

        <main className="mx-auto max-w-[96rem] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>

      <MobileBottomNav
        newLeadsCount={newLeadsCount}
        menuOpen={mobileOpen}
        onOpenMenu={() => setMobileOpen(true)}
      />

      <MobileMenuSheet open={mobileOpen} onOpenChange={setMobileOpen} user={user} onSignOut={openSignOut} />

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} isAdmin={user.role === "ADMIN"} />

      <SignOutDialog open={signOutOpen} onOpenChange={setSignOutOpen} action={signOutAction} user={user} />
    </div>
  );
}
