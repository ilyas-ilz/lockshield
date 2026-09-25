import type { Metadata } from "next";
import { Phone, Mail, MapPin, MessageCircle, Clock } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { QuickQuoteForm } from "@/components/frontend/QuickQuoteForm";
import { PageHero } from "@/components/frontend/PageHero";
import { Section } from "@/components/frontend/Section";
import { Reveal } from "@/components/frontend/Reveal";
import { formatAddressLine } from "@/lib/format";

// Content is editable from the admin, so pages must not be frozen at build
// time. Revalidate every 5 minutes.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Contact Us | Dubai Fire Protection Specialists | Lock Shield",
  description:
    "Get in touch with certified Dubai Civil Defence approved fire safety consultants. Request a site visit or quote for AMC, suppression systems, and approvals.",
};

interface ContactSettings {
  legalName?: string;
  phones?: string[];
  emails?: string[];
  whatsapp?: string;
  address?: {
    street?: string;
    locality?: string;
    country?: string;
    poBox?: string;
  };
}

export default async function ContactPage() {
  let settings: ContactSettings = {};
  try {
    const s = await getSettings();
    settings = (s.toObject ? s.toObject() : s) as ContactSettings;
  } catch {
    // DB error fallback
    void 0;
  }

  const phone = settings.phones?.[0] || "+971 4 272 7333";
  const email = settings.emails?.[0] || "info@lockshield.ae";
  const whatsapp = (settings.whatsapp || "+971 50 123 4567").replace(/[^0-9]/g, "");

  const legalName = settings.legalName || "LOCK SHIELD Firefighting and Safety Equipment Installation LLC";
  const fullAddress = formatAddressLine(settings.address);
  // WHY a query embed, not a fixed pb= URL: the old embed was pinned to a
  // generic "Dubai" view, so editing the address in Settings never moved the
  // map. www.google.com/maps keeps it inside the CSP's frame-src.
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(fullAddress)}&z=15&output=embed`;

  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
        title="Contact"
        accent="Lock Shield"
        description="Our certified engineering desk is ready 24/7 to answer questions, conduct site surveys, and prepare competitive Civil Defence approved quotations."
      />

      <Section className="blueprint-grid bg-paper-soft">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Contact Info Cards */}
          <div className="space-y-6 lg:col-span-5">
            <Reveal className="space-y-6 rounded-3xl border border-[var(--marketing-line)] bg-white p-6 shadow-xs sm:p-8">
              <h2 className="font-tech text-xl font-bold uppercase tracking-tight text-navy-900 sm:text-2xl">
                Head Office Dubai
              </h2>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
                    <MapPin className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase text-ink/50">Address</h4>
                    <address className="mt-0.5 text-sm not-italic text-navy-900">
                      <span className="block font-semibold">{legalName}</span>
                      {settings.address?.poBox && <span className="block">P.O. Box {settings.address.poBox}</span>}
                      <span className="block">{fullAddress}</span>
                    </address>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                    <Phone className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase text-ink/50">Phone Hotline</h4>
                    <a
                      href={`tel:${phone.replace(/\s+/g, "")}`}
                      className="mt-0.5 block min-h-9 text-sm font-medium text-navy-900 transition-colors hover:text-brand-500"
                    >
                      {phone}
                    </a>
                    <span className="text-[11px] text-ink/40">Available 24/7 for emergencies</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                    <Mail className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase text-ink/50">Email Inquiries</h4>
                    <a href={`mailto:${email}`} className="mt-0.5 block min-h-9 break-all text-sm font-medium text-navy-900 transition-colors hover:text-brand-500">
                      {email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                    <MessageCircle className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase text-ink/50">WhatsApp Support</h4>
                    <a
                      href={`https://wa.me/${whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-0.5 block min-h-9 text-sm font-medium text-emerald-600 hover:underline"
                    >
                      Chat Directly on WhatsApp →
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-[var(--marketing-line)] pt-4 text-xs font-semibold text-ink/55">
                <Clock className="size-4 text-ink/40" />
                <span>Working Hours: Mon – Sat: 8:00 AM – 6:00 PM (24/7 On-Call)</span>
              </div>
            </Reveal>

          </div>

          {/* Right Quote & Consultation Form */}
          <Reveal delayMs={150} className="lg:col-span-7">
            <QuickQuoteForm />
          </Reveal>
        </div>

        {/* Google Map Frame - full width under both columns rather than
            stacked inside the narrow left one. In the 5-col column it made
            that side ~260px taller than the form, and `items-start` left
            that difference as dead space below the form. Full width also
            suits a map far better than a 5/12 sliver. */}
        <Reveal delayMs={200} className="mt-10 h-72 overflow-hidden rounded-3xl border border-[var(--marketing-line)] bg-gray-100 shadow-xs sm:h-80">
          <iframe
            title="Lock Shield Dubai Office"
            src={mapSrc}
            className="size-full border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </Reveal>
      </Section>
    </>
  );
}
