import type { Metadata } from "next";
import { Phone, Mail, MapPin, MessageCircle, Clock } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { QuickQuoteForm } from "@/components/frontend/QuickQuoteForm";
import { PageHero } from "@/components/frontend/PageHero";
import { Section } from "@/components/frontend/Section";
import { Reveal } from "@/components/frontend/Reveal";

// Content is editable from the admin, so pages must not be frozen at build
// time. Revalidate every 5 minutes.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Contact Us | Dubai Fire Protection Specialists | Lock Shield",
  description:
    "Get in touch with certified Dubai Civil Defence approved fire safety consultants. Request a site visit or quote for AMC, suppression systems, and approvals.",
};

interface ContactSettings {
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

  const fullAddress = [
    settings.address?.street || "Al Qusais Industrial Area",
    settings.address?.locality || "Dubai",
    settings.address?.country || "United Arab Emirates",
  ]
    .filter(Boolean)
    .join(", ");

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
                    <p className="mt-0.5 text-sm font-medium text-navy-900">{fullAddress}</p>
                    {settings.address?.poBox && <p className="mt-0.5 text-xs text-ink/50">P.O. Box: {settings.address.poBox}</p>}
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

            {/* Google Map Frame */}
            <Reveal delayMs={100} className="h-64 overflow-hidden rounded-3xl border border-[var(--marketing-line)] bg-gray-100 shadow-xs">
              <iframe
                title="Lock Shield Dubai Office"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115456.2483861214!2d55.2707828!3d25.2630564!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f5cc114840e67%3A0xa646ceb1d830b555!2sDubai%2C%20United%20Arab%20Emirates!5e0!3m2!1sen!2sae!4v1700000000000!5m2!1sen!2sae"
                className="size-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </Reveal>
          </div>

          {/* Right Quote & Consultation Form */}
          <Reveal delayMs={150} className="lg:col-span-7">
            <QuickQuoteForm />
          </Reveal>
        </div>
      </Section>
    </>
  );
}
