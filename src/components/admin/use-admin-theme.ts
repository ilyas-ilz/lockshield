"use client";

import * as React from "react";

const STORAGE_KEY = "ls-admin-theme";
const EVENT = "ls-admin-theme-change";

/** Flip the admin theme from anywhere (topbar button, command palette). */
export function setAdminTheme(dark: boolean): void {
  document.documentElement.classList.toggle("dark", dark);
  try {
    localStorage.setItem(STORAGE_KEY, dark ? "dark" : "light");
  } catch {
    // private mode / blocked storage: the class still applies for this visit
  }
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function toggleAdminTheme(): void {
  setAdminTheme(!document.documentElement.classList.contains("dark"));
}

/**
 * Current theme for icons/labels. Starts false to match SSR (no `document`
 * on the server); the root layout's pre-hydration script already applied
 * `.dark` before paint, so syncing after mount only corrects the icon.
 */
export function useAdminTheme(): boolean {
  const [dark, setDark] = React.useState(false);
  React.useEffect(() => {
    const sync = () => setDark(document.documentElement.classList.contains("dark"));
    sync();
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);
  return dark;
}
