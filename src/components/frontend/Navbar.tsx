"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Phone, Menu, X, ArrowRight, ChevronRight, Home, Users, Flame, Building2, Newspaper, Briefcase, Mail, MessageCircle, Globe } from "lucide-react";
import { QuoteModal } from "./QuoteModal";
import { formatPhoneDisplay } from "@/lib/format";

export interface NavbarProps {
  phone?: string;
  siteName?: string;
  socials?: { platform: string; url: string }[];
}

const NAV_LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/about", label: "About Us", icon: Users },
  { href: "/services", label: "Services", icon: Flame },
  { href: "/projects", label: "Projects", icon: Building2 },
  { href: "/blog", label: "Blog", icon: Newspaper },
  { href: "/career", label: "Careers", icon: Briefcase },
  { href: "/contact", label: "Contact", icon: Mail },
];

/* Brand glyphs (lucide-react no longer ships brand icons): tiny inline
   SVGs drawn in currentColor. Matched loosely against the admin-entered
   platform name; unknown platforms fall back to a globe. */
function SocialGlyph({ platform, className }: { platform: string; className?: string }) {
  const p = (platform || "").toLowerCase();
  const cls = className ?? "size-5";
  if (p.includes("whatsapp")) return <MessageCircle className={cls} aria-hidden />;
  if (p.includes("tiktok"))
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cls} aria-hidden>
        <path d="M9 17.5a3.5 3.5 0 1 0 3.5 3.5c0-.2 0-.4 0-.6" />
        <path d="M12.5 21V4c.6 3 2.6 5.3 5.5 5.8" />
      </svg>
    );
  if (p.includes("insta"))
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cls} aria-hidden>
        <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
        <circle cx="12" cy="12" r="4.2" />
        <circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    );
  const d = p.includes("face")
    ? "M13.5 21.9v-7.5h2.5l.4-2.9h-2.9V9.6c0-.8.2-1.4 1.4-1.4h1.6V5.6c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.1H7.8v2.9h2.5v7.5a10 10 0 0 0 3.2 0z"
    : p.includes("youtu")
      ? "M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8 0 12 0 12s0 4 .5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 16 24 12 24 12s0-4-.5-5.8zM9.5 15.6V8.4L15.8 12l-6.3 3.6z"
      : p.includes("linked")
        ? "M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z"
        : p.includes("twitter") || p === "x"
          ? "M17.7 3H21l-7.3 8.3L22.2 21h-6.7l-5.2-6.2L4.4 21H1l7.8-8.9L1.8 3h6.9l4.7 5.7L17.7 3zm-1.2 16h1.9L7.1 4.9H5L16.5 19z"
          : p.includes("telegram")
            ? "M21.9 4.6 2.7 12.1c-.8.3-.8 1.4.1 1.6l4.7 1.5 1.8 5.6c.3.8 1.3.9 1.8.2l2.6-3.1 4.9 3.6c.6.5 1.6.1 1.8-.7l2.5-14.1c.2-1-.9-1.7-2-1.5zM8.6 13.3l9.8-7.2c.2-.2.6 0 .4.3l-8.1 7.9-.3 3-1.8-4z"
            : null;
  if (!d) return <Globe className={cls} aria-hidden />;
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cls} aria-hidden>
      <path d={d} />
    </svg>
  );
}

export function Navbar({ phone = "+971 4 272 7333", siteName = "Lock Shield", socials = [] }: NavbarProps) {
  const pathname = usePathname();
  const [quoteOpen, setQuoteOpen] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll while the drawer is open so the page behind can't shift.
  React.useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  // The drawer covers the page, so keyboard users must not be able to Tab
  // out of it into the content behind, and Escape has to dismiss it.
  const panelRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!mobileOpen) return;
    const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

    function visibleItems(panel: HTMLDivElement) {
      return Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMobileOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const items = visibleItems(panel);
      if (items.length === 0) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      const active = document.activeElement;
      const outside = !panel.contains(active);
      if (e.shiftKey && (active === first || outside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || outside)) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  return (
    <>
      {/* Fixed floating pill. Height is predictable by design (see --header-h
          in globals.css: 72px mobile / 84px desktop): outer padding never
          changes on scroll - only the shadow/border deepen. Heroes clear it
          with their own top padding; only the hero may sit underneath. */}
      <header className="fixed top-0 inset-x-0 z-40 py-2.5 sm:py-3">
        <div className="wrap">
          <div
            className={`glass-pill flex min-h-[52px] items-center justify-between gap-2 rounded-[26px] px-3 py-2 transition-shadow duration-300 sm:min-h-[60px] sm:rounded-[30px] sm:px-6 sm:py-2.5 ${
              scrolled ? "shadow-[0_14px_36px_-12px_rgba(13,18,32,0.28)]" : ""
            }`}
          >
            {/* Logo - the real lockup, not a placeholder icon */}
            {/* min-h-11 for the 44px tap target; costs no header height since
                the hamburger (size-11) already sets the pill's height. */}
            <Link href="/" className="group flex min-h-11 shrink-0 items-center gap-2.5 sm:gap-3">
              <Image
                src="/assets/images/logo-shield.webp"
                alt=""
                width={44}
                height={45}
                priority
                className="size-9 shrink-0 transition-transform group-hover:scale-105 sm:size-11"
              />
              <div className="flex min-w-0 flex-col">
                <span className="font-tech truncate text-base font-bold uppercase leading-none tracking-tight text-ink sm:text-xl">
                  {siteName}
                </span>
                <span className="mt-1 hidden text-[10px] font-medium uppercase leading-tight tracking-wider text-navy/75 sm:inline">
                  Firefighting &amp; Safety Equipment Installation LLC
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden items-center gap-0.5 lg:flex xl:gap-1.5">
              {NAV_LINKS.map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-semibold transition-colors xl:px-3 xl:text-sm ${
                      active ? "bg-brand-500 text-white shadow-xs" : "text-gray-700 hover:bg-gray-100/70 hover:text-brand-500"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Quote CTA */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Desktop-only CTA - the mobile drawer has its own full-width
                  "Request Free Quote" button, so the top bar stays just
                  logo + hamburger below `lg` instead of cramming this in too. */}
              <button
                type="button"
                onClick={() => setQuoteOpen(true)}
                className="hidden min-h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-brand-500 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-brand-500/20 transition-all hover:bg-brand-600 active:scale-95 sm:min-h-10 sm:px-4 sm:text-sm lg:inline-flex cursor-pointer"
              >
                <span>Get a Quote</span>
                <ArrowRight className="size-3.5" />
              </button>

              {/* Mobile Hamburger Toggle - explicit 44px tap target */}
              <button
                type="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="flex size-11 shrink-0 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 lg:hidden cursor-pointer"
                aria-label="Toggle navigation"
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile navigation — floating dark sheet (< lg only), modelled on
          the reference: inset rounded card over a dimmed page, own top bar
          (close / centred logo / call), MENU label, primary CTA pill,
          icon rows with chevrons, and a FOLLOW US social tray at the foot.
          Hamburger replaces desktop nav; never shown alongside it. */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-ink/70 backdrop-blur-md animate-in fade-in-0 duration-200"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className="drawer-sheet fixed inset-x-3 top-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] flex flex-col overflow-hidden rounded-[1.75rem] bg-ink text-white shadow-2xl"
          >
            {/* Blueprint texture, like the dark CTA bands */}
            <div className="blueprint-grid-dark pointer-events-none absolute inset-0 opacity-25" aria-hidden />

            {/* Top bar: close — centred logo — call */}
            <div className="relative z-10 grid grid-cols-[auto_1fr_auto] items-center gap-2 px-4 pt-4">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
                className="flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 active:scale-95 cursor-pointer"
              >
                <X className="size-5" />
              </button>
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="flex min-h-11 items-center justify-center gap-2"
                aria-label="Lock Shield - home"
              >
                <Image
                  src="/assets/images/logo-shield.webp"
                  alt=""
                  width={32}
                  height={33}
                  className="size-8 shrink-0 rounded-lg bg-white p-0.5"
                />
                <span className="font-tech text-sm font-bold uppercase leading-none tracking-tight text-white">
                  {siteName}
                </span>
              </Link>
              {phone ? (
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  aria-label={`Call ${formatPhoneDisplay(phone)}`}
                  className="flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 active:scale-95"
                >
                  <Phone className="size-5" aria-hidden />
                </a>
              ) : (
                <span className="size-11" aria-hidden />
              )}
            </div>

            {/* Scrollable middle: label + CTA + links */}
            <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-3 pt-4">
              <p className="drawer-item px-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
                Menu
              </p>

              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setQuoteOpen(true);
                }}
                className="drawer-item mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/40 transition-all hover:bg-brand-600 active:scale-[0.98] cursor-pointer"
                style={{ animationDelay: "80ms" }}
              >
                <span>Get a Quote</span>
                <ArrowRight className="size-4" aria-hidden />
              </button>

              <nav className="mt-3" aria-label="Mobile">
                <ul className="flex flex-col gap-1">
                  {NAV_LINKS.map((item, idx) => {
                    const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                    const Icon = item.icon;
                    return (
                      <li
                        key={item.href}
                        className="drawer-item"
                        style={{ animationDelay: `${140 + idx * 45}ms` }}
                      >
                        <Link
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          className={`group flex min-h-13 items-center gap-3 rounded-2xl px-2.5 py-2 text-[15px] font-semibold transition-all active:scale-[0.98] ${
                            active
                              ? "bg-brand-500 text-white shadow-lg shadow-brand-500/40"
                              : "text-white/90 hover:bg-white/10"
                          }`}
                        >
                          <span
                            className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                              active ? "bg-white/20 text-white" : "bg-white/10 text-brand-400"
                            }`}
                          >
                            <Icon className="size-5" aria-hidden />
                          </span>
                          <span className="flex-1">{item.label}</span>
                          <ChevronRight
                            className={`size-4 transition-transform group-active:translate-x-0.5 ${
                              active ? "opacity-80" : "opacity-30"
                            }`}
                            aria-hidden
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>

            {/* Foot: social tray (rendered only when the admin has set socials) */}
            {socials.length > 0 && (
              <div className="relative z-10 mx-4 mb-4 rounded-2xl bg-white/5 p-4">
                <p className="drawer-item text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40" style={{ animationDelay: "460ms" }}>
                  Follow us
                </p>
                <div className="drawer-item mt-3 flex flex-wrap items-center gap-2.5" style={{ animationDelay: "500ms" }}>
                  {socials.map((s) => {
                    return (
                      <a
                        key={`${s.platform}-${s.url}`}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={s.platform}
                        className="flex size-11 items-center justify-center rounded-full bg-white/10 text-white/85 transition-all hover:bg-brand-500 hover:text-white active:scale-95"
                      >
                        <SocialGlyph platform={s.platform} />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quote Dialog */}
      <QuoteModal open={quoteOpen} onOpenChange={setQuoteOpen} />
    </>
  );
}
