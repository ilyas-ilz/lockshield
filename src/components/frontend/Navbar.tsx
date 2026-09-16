"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Phone, Menu, X, ArrowRight } from "lucide-react";
import { QuoteModal } from "./QuoteModal";
import { formatPhoneDisplay } from "@/lib/format";

export interface NavbarProps {
  phone?: string;
  siteName?: string;
}

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/career", label: "Careers" },
  { href: "/contact", label: "Contact" },
];

export function Navbar({ phone = "+971 4 272 7333", siteName = "Lock Shield" }: NavbarProps) {
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

      {/* Mobile Navigation Drawer - full-height right panel (< lg only).
          Hamburger replaces desktop nav; never shown alongside it. */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-ink/60 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className="fixed top-0 right-0 flex h-dvh w-[min(380px,92vw)] flex-col bg-white shadow-2xl duration-200 animate-in slide-in-from-right"
          >
            {/* Drawer header: logo + close */}
            <div className="flex min-h-[68px] items-center justify-between gap-2 border-b border-gray-100 px-5">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="flex min-h-11 items-center gap-2.5"
                aria-label="Lock Shield - home"
              >
                <Image
                  src="/assets/images/logo-shield.webp"
                  alt=""
                  width={36}
                  height={37}
                  className="size-9 shrink-0"
                />
                <span className="font-tech text-base font-bold uppercase leading-none tracking-tight text-ink">
                  {siteName}
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
                className="flex size-11 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4" aria-label="Mobile">
              <ul className="flex flex-col gap-1">
                {NAV_LINKS.map((item) => {
                  const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={`flex min-h-11 items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                          active ? "bg-brand-500 text-white" : "text-gray-800 hover:bg-gray-100"
                        }`}
                      >
                        <span>{item.label}</span>
                        <ArrowRight className="size-4 opacity-50" aria-hidden />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="flex flex-col gap-3 border-t border-gray-100 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setQuoteOpen(true);
                }}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition-colors hover:bg-brand-600 cursor-pointer"
              >
                <span>Get a Quote</span>
                <ArrowRight className="size-4" aria-hidden />
              </button>
              {phone && (
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                >
                  <Phone className="size-4" aria-hidden />
                  <span>Call {formatPhoneDisplay(phone)}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quote Dialog */}
      <QuoteModal open={quoteOpen} onOpenChange={setQuoteOpen} />
    </>
  );
}
