"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, Menu, X, ArrowRight, Shield, ChevronDown } from "lucide-react";
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
          scrolled ? "py-2.5" : "py-4 sm:py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="glass-pill rounded-full px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between transition-all">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="size-9 rounded-full bg-[#e01b24] flex items-center justify-center text-white shadow-md shadow-[#e01b24]/20 group-hover:scale-105 transition-transform">
                <Shield className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-tech text-base sm:text-lg font-bold tracking-tight text-[#0d1220] uppercase leading-none">
                  Lock Shield
                </span>
                <span className="text-[10px] font-medium tracking-wider text-gray-500 uppercase leading-tight mt-0.5 hidden sm:inline">
                  Fire & Safety UAE
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {NAV_LINKS.map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-colors ${
                      active
                        ? "bg-[#e01b24] text-white shadow-xs"
                        : "text-gray-700 hover:text-[#e01b24] hover:bg-gray-100/70"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Call Action & Quote CTA */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {phone && (
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-gray-800 hover:text-[#e01b24] hover:bg-gray-100 transition-colors"
                >
                  <div className="size-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Phone className="size-3" />
                  </div>
                  <span>{phone}</span>
                </a>
              )}

              <button
                type="button"
                onClick={() => setQuoteOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#e01b24] px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-white shadow-md shadow-[#e01b24]/20 hover:bg-[#b3121a] active:scale-95 transition-all cursor-pointer"
              >
                <span>Get a Quote</span>
                <ArrowRight className="size-3.5" />
              </button>

              {/* Mobile Hamburger Toggle */}
              <button
                type="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-full text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Toggle navigation"
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
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-x-4 top-24 rounded-3xl bg-white p-6 shadow-2xl border border-gray-100 animate-in fade-in-0 zoom-in-95 duration-200">
            <nav className="flex flex-col gap-2">
              {NAV_LINKS.map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-between ${
                      active ? "bg-[#e01b24] text-white" : "text-gray-800 hover:bg-gray-100"
                    }`}
                  >
                    <span>{item.label}</span>
                    <ArrowRight className="size-4 opacity-50" />
                  </Link>
                );
              })}
            </nav>

            <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col gap-3">
              {phone && (
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
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
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#e01b24] px-4 py-3 text-sm font-semibold text-white shadow-md shadow-[#e01b24]/20 hover:bg-[#b3121a] transition-colors cursor-pointer"
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
