import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, Download } from "lucide-react";
import type { ISettings } from "@/models/Settings";
import { formatAddressLine, formatPhoneDisplay } from "@/lib/format";

export function Footer({ settings }: { settings: Partial<ISettings> }) {
  const currentYear = new Date().getFullYear();
  const phone = settings.phones?.[0] || "+971 4 272 7333";
  const email = settings.emails?.[0] || "info@lockshield.ae";

  const fullAddress = formatAddressLine(settings.address);

  return (
    <footer className="relative overflow-hidden border-t border-gray-800/80 bg-ink pb-3 pt-5 text-gray-300 sm:pt-6">
      {/* Background blueprint grid overlay */}
      <div className="blueprint-grid-dark pointer-events-none absolute inset-0 opacity-20" />

      <div className="wrap relative z-10">
        {/* Mobile: centred stacked card (logo / blurb / contact). sm+: the
            compact 3-column footer. */}
        <div className="grid grid-cols-1 gap-6 border-b border-gray-800 pb-6 text-center sm:gap-4 sm:pb-4 sm:text-left lg:grid-cols-[1.4fr_1fr_1fr]">
          {/* Company identity */}
          <div className="flex flex-col items-center space-y-2.5 sm:col-span-2 sm:items-start lg:col-span-1">
            <Link href="/" className="group inline-flex items-center gap-2.5">
              <Image
                src="/assets/images/logo-lockshield.webp"
                alt="Lock Shield — Firefighting and Safety Equipment Installation LLC"
                width={132}
                height={100}
                className="h-auto w-20 rounded-xl bg-white/92 p-1.5"
              />
            </Link>

            <p className="max-w-sm text-sm leading-relaxed text-gray-400">
              DCD-approved fire protection, suppression systems and 24/7
              maintenance contracts across the UAE.
            </p>
          </div>

          {/* Quick links - every destination verified: /about, /services,
              /projects, /career, /contact pages exist; the PDF exists at
              /assets/images/company-profile.pdf */}
          <nav aria-label="Footer" className="hidden sm:block">
            <h3 className="font-tech mb-2 text-sm font-bold uppercase tracking-wider text-white">Quick Links</h3>
            {/* Two columns. Six stacked 32px rows was the tallest element in
                the footer and set the whole footer's height on its own; three
                rows halves that. Desktop-only (the navbar and drawer carry
                navigation on mobile), so a 32px row is a pointer target, never
                the sole touch target for a route. */}
            <ul className="grid grid-cols-2 gap-x-4 gap-y-0.5">
              <li>
                <Link href="/about" className="flex min-h-8 items-center text-sm transition-colors hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/services" className="flex min-h-8 items-center text-sm transition-colors hover:text-white">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/projects" className="flex min-h-8 items-center text-sm transition-colors hover:text-white">
                  Projects
                </Link>
              </li>
              <li>
                <Link href="/career" className="flex min-h-8 items-center text-sm transition-colors hover:text-white">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="flex min-h-8 items-center text-sm transition-colors hover:text-white">
                  Contact Us
                </Link>
              </li>
            </ul>

            {/* The profile PDF is an action, not a route, so it sits below the
                link list rather than inside it. `download` + a download icon:
                it previously opened in a new tab behind an external-link
                icon while the label said "Download", so the icon, the verb
                and the actual behaviour disagreed. The file is real -
                public/assets/images/company-profile.pdf, 10 pages. */}
            <a
              href="/assets/images/company-profile.pdf"
              download
              className="mt-2.5 inline-flex min-h-8 items-center gap-1.5 text-sm font-medium text-brand-500 hover:underline"
            >
              <Download className="size-3.5 shrink-0" />
              Download Company Profile
            </a>
          </nav>

          {/* Contact Details & NAP — centred stack on mobile, inline
              wrap from sm up. */}
          <div>
            <h3 className="font-tech mb-2 text-sm font-bold uppercase tracking-wider text-white">Get in Touch</h3>
            <ul className="flex flex-col items-center gap-2 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-1.5">
              {/* The address was the only row here with an icon but no
                  destination - phone and email were already actionable. */}
              <li className="flex basis-full items-start justify-center gap-3 sm:justify-start">
                <MapPin className="mt-1 size-4 shrink-0 text-brand-500" />
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  {fullAddress}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="size-4 shrink-0 text-brand-500" />
                <a href={`tel:${phone.replace(/\s+/g, "")}`} className="min-h-8 py-1 transition-colors hover:text-white">
                  {formatPhoneDisplay(phone)}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="size-4 shrink-0 text-brand-500" />
                <a href={`mailto:${email}`} className="min-h-8 py-1 transition-colors hover:text-white">
                  {email}
                </a>
              </li>
              {/* No WhatsApp row here - the floating action button in
                  ChromeEffects is the WhatsApp entry point and is on screen
                  at all times, so this line was the same link twice within
                  one viewport. */}
            </ul>
          </div>
        </div>

        {/* Bottom copyright and legal note */}
        {/* No "DCD Approved · ISO Certified · Serving UAE" strapline here - it
            restated the two trust badges sitting a few rows above it, in the
            same viewport. The badges carry that signal better. */}
        <div className="pt-3 text-center text-xs leading-relaxed text-gray-500 sm:pt-2 sm:text-left">
          <p>
            © {currentYear} {settings.legalName || "LOCK SHIELD Firefighting and Safety Equipment Installation LLC"}. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
