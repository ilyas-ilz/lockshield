"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Phone, Menu, X, ArrowRight } from "lucide-react";
import { QuoteModal } from "./QuoteModal";

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

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
          scrolled ? "py-2.5" : "py-3 sm:py-4 lg:py-5"
        }`}
      >
        <div className="wrap">
          <div className="glass-pill flex items-center justify-between gap-2 rounded-full px-3 py-2 transition-all sm:px-6 sm:py-3">
            {/* Logo - the real lockup, not a placeholder icon */}
            <Link href="/" className="group flex shrink-0 items-center gap-2 sm:gap-2.5">
              <Image
                src="/assets/images/logo-shield.webp"
                alt=""
                width={38}
                height={39}
                priority
                className="size-8 shrink-0 transition-transform group-hover:scale-105 sm:size-9"
              />
              <div className="flex min-w-0 flex-col">
                <span className="font-tech truncate text-sm font-bold uppercase leading-none tracking-tight text-ink sm:text-lg">
                  {siteName}
                </span>
                <span className="mt-0.5 hidden text-[10px] font-medium uppercase leading-tight tracking-wider text-navy/75 sm:inline">
                  Firefighting &amp; Safety Equipment Installation LLC
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden items-center gap-1 lg:flex xl:gap-2">
              {NAV_LINKS.map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors xl:text-sm ${
                      active ? "bg-brand-500 text-white shadow-xs" : "text-gray-700 hover:bg-gray-100/70 hover:text-brand-500"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Call Action & Quote CTA */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {phone && (
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="hidden items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-gray-800 transition-colors hover:bg-gray-100 hover:text-brand-500 md:flex"
                >
                  <div className="flex size-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Phone className="size-3" />
                  </div>
                  <span>{phone}</span>
                </a>
              )}

              <button
                type="button"
                onClick={() => setQuoteOpen(true)}
                className="inline-flex min-h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-brand-500 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-brand-500/20 transition-all hover:bg-brand-600 active:scale-95 sm:min-h-10 sm:px-5 sm:text-sm cursor-pointer"
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

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
          <div className="fixed inset-x-4 top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-3xl border border-gray-100 bg-white p-5 shadow-2xl duration-200 animate-in fade-in-0 zoom-in-95 sm:top-24 sm:p-6">
            <nav className="flex flex-col gap-1.5">
              {NAV_LINKS.map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex min-h-11 items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                      active ? "bg-brand-500 text-white" : "text-gray-800 hover:bg-gray-100"
                    }`}
                  >
                    <span>{item.label}</span>
                    <ArrowRight className="size-4 opacity-50" />
                  </Link>
                );
              })}
            </nav>

            <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-5">
              {phone && (
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                >
                  <Phone className="size-4" />
                  <span>Call {phone}</span>
                </a>
              )}
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setQuoteOpen(true);
                }}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition-colors hover:bg-brand-600 cursor-pointer"
              >
                <span>Request Free Quote</span>
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quote Dialog */}
      <QuoteModal open={quoteOpen} onOpenChange={setQuoteOpen} />
    </>
  );
}
