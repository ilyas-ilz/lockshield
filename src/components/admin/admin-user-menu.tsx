"use client";

import * as React from "react";
import Link from "next/link";
import { ExternalLink, Globe, KeyRound, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { initialsOf } from "@/lib/initials";

export interface AdminUser {
  name?: string | null;
  email?: string | null;
  role: string;
}

export function displayName(user: AdminUser): string {
  return user.name?.trim() || user.email || "Staff Member";
}

/**
 * Account menu shared by the topbar avatar and the sidebar user card.
 * WHY "Account & password" is here for every role: /admin/account is the
 * one settings page editors can open, and they arrive with a temporary
 * password.
 */
export function AdminUserMenu({
  user,
  onSignOut,
  side = "bottom",
  align = "end",
  children,
}: {
  user: AdminUser;
  onSignOut: () => void;
  side?: "top" | "bottom" | "right";
  align?: "start" | "end";
  children: React.ReactNode;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent side={side} align={align} className="w-64">
        <div className="flex items-center gap-3 px-2.5 py-2">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-semibold text-app">
            {initialsOf(displayName(user))}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-app">{displayName(user)}</p>
            <p className="truncate text-xs text-muted">
              {user.role === "ADMIN" ? "Administrator" : "Editor"}
              {user.email ? ` · ${user.email}` : ""}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/admin/account">
            <KeyRound aria-hidden />
            Account &amp; password
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="/" target="_blank" rel="noopener noreferrer">
            <Globe aria-hidden />
            <span className="flex-1">View website</span>
            <ExternalLink className="!size-3.5" aria-hidden />
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem tone="danger" onSelect={onSignOut}>
          <LogOut aria-hidden />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
