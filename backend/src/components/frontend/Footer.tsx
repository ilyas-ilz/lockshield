import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
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
  ].filter(Boolean).join(", ");

  return (
    <footer className="bg-[#0d1220] text-gray-300 pt-16 pb-12 border-t border-gray-800/80 relative overflow-hidden">
      {/* Background blueprint grid overlay */}
      <div className="blueprint-grid-dark absolute inset-0 opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Main 4-column footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-gray-800">
          {/* Brand & Approval info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="size-10 rounded-full bg-[#e01b24] flex items-center justify-center text-white shadow-md shadow-[#e01b24]/30">
                <ShieldCheck className="size-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-tech text-xl font-bold tracking-tight text-white uppercase leading-none">
                  Lock Shield
                </span>
                <span className="text-[10px] font-medium tracking-wider text-gray-400 uppercase mt-0.5">
                  Fire & Safety Equipment Installation LLC
                </span>
              </div>
            </Link>

            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              Approved by Dubai Civil Defence (DCD). Leading provider of complete fire protection,
              kitchen suppression, FM-200 clean agent systems, and 24/7 Annual Maintenance
              Contracts across the UAE.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Civil Defence Approved
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-400">
                ISO Certified
              </span>
            </div>
          </div>

          {/* Quick Services Links */}
          <div>
            <h3 className="font-tech text-sm font-bold uppercase tracking-wider text-white mb-4">
              Core Services
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/services/annual-maintenance-contract" className="hover:text-white transition-colors">
                  Annual Maintenance (AMC)
                </Link>
              </li>
              <li>
                <Link href="/services/designing-drawing-civil-defence-approval" className="hover:text-white transition-colors">
                  Civil Defence Approvals
                </Link>
              </li>
              <li>
                <Link href="/services/fm-200-special-systems" className="hover:text-white transition-colors">
                  FM-200 Special Systems
                </Link>
              </li>
              <li>
                <Link href="/services/kitchen-fire-suppression-systems" className="hover:text-white transition-colors">
                  Kitchen Fire Suppression
                </Link>
              </li>
              <li>
                <Link href="/services/fire-extinguisher-refilling" className="hover:text-white transition-colors">
                  Extinguisher Refilling
                </Link>
              </li>
              <li>
                <Link href="/services/fire-system-products-supply" className="hover:text-white transition-colors">
                  Fire Products Supply
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-tech text-sm font-bold uppercase tracking-wider text-white mb-4">
              Company
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Lock Shield
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-white transition-colors">
                  Featured Projects
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">
                  Safety News & Guides
                </Link>
              </li>
              <li>
                <Link href="/career" className="hover:text-white transition-colors">
                  Careers & Jobs
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <a
                  href="/assets/images/company-profile.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#e01b24] hover:underline font-medium"
                >
                  Download Profile (PDF)
                  <ExternalLink className="size-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Details & NAP */}
          <div>
            <h3 className="font-tech text-sm font-bold uppercase tracking-wider text-white mb-4">
              Get in Touch
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="size-4 text-[#e01b24] shrink-0 mt-1" />
                <span className="text-gray-400">{fullAddress}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="size-4 text-[#e01b24] shrink-0" />
                <a href={`tel:${phone.replace(/\s+/g, "")}`} className="hover:text-white transition-colors">
                  {phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="size-4 text-[#e01b24] shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-white transition-colors">
                  {email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle className="size-4 text-emerald-400 shrink-0" />
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline font-medium"
                >
                  Chat on WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Partner Backlinks row (lockshieldcart.com) */}
        {settings.partnerLinks && settings.partnerLinks.length > 0 && (
          <div className="py-6 border-b border-gray-800/80 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-400">
            <span className="font-semibold text-gray-300">Industry Partners:</span>
            {settings.partnerLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                rel={link.rel || "noopener"}
                target="_blank"
                className="hover:text-white transition-colors underline-offset-4 hover:underline"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}

        {/* Bottom copyright and legal note */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>
            © {currentYear} {settings.legalName || "Lock Shield Firefighting & Safety Equipment Installation LLC"}. All rights reserved.
          </p>
          <p>
            Approved by Civil Defence UAE · Operating throughout Dubai, Abu Dhabi, Sharjah & Northern Emirates.
          </p>
        </div>
      </div>

      {/* Floating WhatsApp Action Button */}
      <a
        href={`https://wa.me/${whatsappNumber}?text=Hello%20Lock%20Shield,%20I%20would%20like%20to%20enquire%20about%20fire%20protection%20services.`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center size-14 rounded-full bg-emerald-500 text-white shadow-xl hover:bg-emerald-600 hover:scale-110 active:scale-95 transition-all cursor-pointer"
      >
        <MessageCircle className="size-7" />
      </a>
    </footer>
  );
}
