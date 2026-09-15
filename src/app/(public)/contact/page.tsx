import type { Metadata } from "next";
import { Phone, Mail, MapPin, MessageCircle, Clock } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { QuickQuoteForm } from "@/components/frontend/QuickQuoteForm";

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
  }

  const phone = settings.phones?.[0] || "+971 4 272 7333";
  const email = settings.emails?.[0] || "info@lockshield.ae";
  const whatsapp = (settings.whatsapp || "+971 50 123 4567").replace(/[^0-9]/g, "");

  const fullAddress = [
    settings.address?.street || "Al Qusais Industrial Area",
    settings.address?.locality || "Dubai",
    settings.address?.country || "United Arab Emirates",
  ].filter(Boolean).join(", ");

  return (
    <>
      <section className="pt-36 pb-16 bg-[#0d1220] text-white relative overflow-hidden">
        <div className="blueprint-grid-dark absolute inset-0 opacity-20 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <span className="font-tech text-xs sm:text-sm font-bold uppercase tracking-widest text-[#e01b24]">
            Connect With Engineers
          </span>
          <h1 className="font-tech text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-white mt-2">
            Contact <span className="text-[#e01b24]">Lock Shield</span>
          </h1>
          <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto mt-4 font-light">
            Our certified engineering desk is ready 24/7 to answer questions, conduct site
            surveys, and prepare competitive Civil Defence approved quotations.
          </p>
        </div>
      </section>

      <section className="py-20 sm:py-28 bg-[#f7f8fa] blueprint-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Contact Info Cards */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xs space-y-6">
                <h2 className="font-tech text-2xl font-bold uppercase tracking-tight text-gray-900">
                  Head Office Dubai
                </h2>

                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="size-11 rounded-xl bg-[#e01b24]/10 text-[#e01b24] flex items-center justify-center shrink-0">
                      <MapPin className="size-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase text-gray-500">Address</h4>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">{fullAddress}</p>
                      {settings.address?.poBox && (
                        <p className="text-xs text-gray-500 mt-0.5">P.O. Box: {settings.address.poBox}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="size-11 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                      <Phone className="size-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase text-gray-500">Phone Hotline</h4>
                      <a
                        href={`tel:${phone.replace(/\s+/g, "")}`}
                        className="text-sm font-medium text-gray-900 hover:text-[#e01b24] transition-colors mt-0.5 block"
                      >
                        {phone}
                      </a>
                      <span className="text-[11px] text-gray-400">Available 24/7 for emergencies</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="size-11 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                      <Mail className="size-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase text-gray-500">Email Inquiries</h4>
                      <a
                        href={`mailto:${email}`}
                        className="text-sm font-medium text-gray-900 hover:text-[#e01b24] transition-colors mt-0.5 block"
                      >
                        {email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="size-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                      <MessageCircle className="size-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase text-gray-500">WhatsApp Support</h4>
                      <a
                        href={`https://wa.me/${whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-emerald-600 hover:underline mt-0.5 block"
                      >
                        Chat Directly on WhatsApp →
                      </a>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center gap-2 text-xs font-semibold text-gray-500">
                  <Clock className="size-4 text-gray-400" />
                  <span>Working Hours: Mon – Sat: 8:00 AM – 6:00 PM (24/7 On-Call)</span>
                </div>
              </div>

              {/* Google Map Frame */}
              <div className="rounded-3xl overflow-hidden border border-gray-200 shadow-xs h-64 bg-gray-100">
                <iframe
                  title="Lock Shield Dubai Office"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115456.2483861214!2d55.2707828!3d25.2630564!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f5cc114840e67%3A0xa646ceb1d830b555!2sDubai%2C%20United%20Arab%20Emirates!5e0!3m2!1sen!2sae!4v1700000000000!5m2!1sen!2sae"
                  className="w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            {/* Right Quote & Consultation Form */}
            <div className="lg:col-span-7">
              <QuickQuoteForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
