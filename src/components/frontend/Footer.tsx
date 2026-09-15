import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, ExternalLink, MessageCircle } from "lucide-react";
import type { ISettings } from "@/models/Settings";

export function Footer({ settings }: { settings: Partial<ISettings> }) {
  const currentYear = new Date().getFullYear();
  const phone = settings.phones?.[0] || "+971 4 272 7333";
  const email = settings.emails?.[0] || "info@lockshield.ae";
  const whatsappNumber = (settings.whatsapp || "+971 50 123 4567").replace(/[^0-9]/g, "");

  const fullAddress = [
    settings.address?.street || "Al Qusais Industrial Area",
    settings.address?.locality || "Dubai",
    settings.address?.country || "United Arab Emirates",
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <footer className="relative overflow-hidden border-t border-gray-800/80 bg-ink pb-12 pt-14 text-gray-300 sm:pt-16">
      {/* Background blueprint grid overlay */}
      <div className="blueprint-grid-dark pointer-events-none absolute inset-0 opacity-20" />

      <div className="wrap relative z-10">
        {/* Main footer content - one column on mobile, building up to 5 on desktop */}
        <div className="grid grid-cols-1 gap-10 border-b border-gray-800 pb-12 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand & Approval info */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-2">
            <Link href="/" className="group inline-flex items-center gap-2.5">
              <Image
                src="/assets/images/logo-lockshield.webp"
                alt="Lock Shield — Firefighting and Safety Equipment Installation LLC"
                width={132}
                height={100}
                className="h-auto w-24 rounded-xl bg-white/92 p-2"
              />
            </Link>

            <p className="max-w-sm text-sm leading-relaxed text-gray-400">
              Approved by Dubai Civil Defence (DCD). Leading provider of complete fire protection,
              kitchen suppression, FM-200 clean agent systems, and 24/7 Annual Maintenance
              Contracts across the UAE.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
                Civil Defence Approved
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
                ISO Certified
              </span>
            </div>
          </div>

          {/* Quick Services Links */}
          <div>
            <h3 className="font-tech mb-4 text-sm font-bold uppercase tracking-wider text-white">Core Services</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/services/annual-maintenance-contract" className="flex min-h-9 items-center text-sm transition-colors hover:text-white">
                  Annual Maintenance (AMC)
                </Link>
              </li>
              <li>
                <Link href="/services/designing-drawing-civil-defence-approval" className="flex min-h-9 items-center text-sm transition-colors hover:text-white">
                  Civil Defence Approvals
                </Link>
              </li>
              <li>
                <Link href="/services/fm-200-special-systems" className="flex min-h-9 items-center text-sm transition-colors hover:text-white">
                  FM-200 Special Systems
                </Link>
              </li>
              <li>
                <Link href="/services/kitchen-fire-suppression-systems" className="flex min-h-9 items-center text-sm transition-colors hover:text-white">
                  Kitchen Fire Suppression
                </Link>
              </li>
              <li>
                <Link href="/services/fire-extinguisher-refilling" className="flex min-h-9 items-center text-sm transition-colors hover:text-white">
                  Extinguisher Refilling
                </Link>
              </li>
              <li>
                <Link href="/services/fire-system-products-supply" className="flex min-h-9 items-center text-sm transition-colors hover:text-white">
                  Fire Products Supply
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-tech mb-4 text-sm font-bold uppercase tracking-wider text-white">Company</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/about" className="flex min-h-9 items-center text-sm transition-colors hover:text-white">
                  About Lock Shield
                </Link>
              </li>
              <li>
                <Link href="/projects" className="flex min-h-9 items-center text-sm transition-colors hover:text-white">
                  Featured Projects
                </Link>
              </li>
              <li>
                <Link href="/blog" className="flex min-h-9 items-center text-sm transition-colors hover:text-white">
                  Safety News &amp; Guides
                </Link>
              </li>
              <li>
                <Link href="/career" className="flex min-h-9 items-center text-sm transition-colors hover:text-white">
                  Careers &amp; Jobs
                </Link>
              </li>
              <li>
                <Link href="/contact" className="flex min-h-9 items-center text-sm transition-colors hover:text-white">
                  Contact Us
                </Link>
              </li>
              <li>
                <a
                  href="/assets/images/company-profile.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-9 items-center gap-1 text-sm font-medium text-brand-500 hover:underline"
                >
                  Download Profile (PDF)
                  <ExternalLink className="size-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Details & NAP */}
          <div>
            <h3 className="font-tech mb-4 text-sm font-bold uppercase tracking-wider text-white">Get in Touch</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="mt-1 size-4 shrink-0 text-brand-500" />
                <span className="text-gray-400">{fullAddress}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="size-4 shrink-0 text-brand-500" />
                <a href={`tel:${phone.replace(/\s+/g, "")}`} className="min-h-9 py-1.5 transition-colors hover:text-white">
                  {phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="size-4 shrink-0 text-brand-500" />
                <a href={`mailto:${email}`} className="min-h-9 py-1.5 transition-colors hover:text-white">
                  {email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle className="size-4 shrink-0 text-emerald-400" />
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-9 py-1.5 font-medium text-emerald-400 hover:underline"
                >
                  Chat on WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Partner Backlinks row (lockshieldcart.com) */}
        {settings.partnerLinks && settings.partnerLinks.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-gray-800/80 py-6 text-xs text-gray-400">
            <span className="font-semibold text-gray-300">Industry Partners:</span>
            {settings.partnerLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                rel={link.rel || "noopener"}
                target="_blank"
                className="underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}

        {/* Bottom copyright and legal note */}
        <div className="flex flex-col items-center justify-between gap-3 pt-8 text-center text-xs text-gray-500 sm:flex-row sm:text-left">
          <p>
            © {currentYear} {settings.legalName || "Lock Shield Firefighting & Safety Equipment Installation LLC"}. All
            rights reserved.
          </p>
          <p>Approved by Civil Defence UAE · Operating throughout Dubai, Abu Dhabi, Sharjah &amp; Northern Emirates.</p>
        </div>
      </div>

      {/* Floating WhatsApp Action Button - offset for iOS home-indicator safe area */}
      <a
        href={`https://wa.me/${whatsappNumber}?text=Hello%20Lock%20Shield,%20I%20would%20like%20to%20enquire%20about%20fire%20protection%20services.`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed right-4 z-40 flex size-13 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xl transition-all hover:scale-110 hover:bg-emerald-600 active:scale-95 sm:right-6 sm:size-14 cursor-pointer"
        style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <MessageCircle className="size-6 sm:size-7" />
      </a>
    </footer>
  );
}
