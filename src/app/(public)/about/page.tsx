import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Target,
  Eye,
  Download,
  ArrowRight,
} from "lucide-react";

// Content is editable from the admin, so pages must not be frozen at build
// time. Revalidate every 5 minutes.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "About Us | Civil Defence Approved Fire Protection",
  description:
    "Learn about Lock Shield Firefighting & Safety Equipment Installation LLC — UAE's trusted partner for Civil Defence approved fire protection systems.",
};

export default function AboutPage() {
  return (
    <>
      {/* Page Header */}
      <section className="pt-36 pb-16 bg-[#0d1220] text-white relative overflow-hidden">
        <div className="blueprint-grid-dark absolute inset-0 opacity-20 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <span className="font-tech text-xs sm:text-sm font-bold uppercase tracking-widest text-[#e01b24]">
            Who We Are
          </span>
          <h1 className="font-tech text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-white mt-2">
            About <span className="text-[#e01b24]">Lock Shield</span>
          </h1>
          <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto mt-4 font-light">
            Engineering safety and preserving lives across Dubai and the UAE with world-class fire
            protection, detection, and suppression systems.
          </p>
        </div>
      </section>

      {/* Overview & Credentials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="font-tech text-xs font-bold uppercase tracking-widest text-[#e01b24]">
                Trusted UAE Fire Protection
              </span>
              <h2 className="font-tech text-3xl sm:text-4xl font-bold uppercase tracking-tight text-gray-900 leading-tight">
                Protecting People, Properties &amp; <br />
                <span className="text-[#e01b24]">Business Continuity</span>
              </h2>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Lock Shield Firefighting & Safety Equipment Installation LLC is an officially
                approved and certified fire protection contracting firm licensed by Dubai Civil
                Defence (DCD). With over 15 years of hands-on engineering excellence, we specialize
                in turn-key fire protection solutions: design, drawing approval, supply,
                installation, testing, commissioning, and round-the-clock Annual Maintenance
                Contracts (AMC).
              </p>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Whether you operate a commercial office, industrial warehouse, luxury retail space,
                or residential complex, our engineers ensure your systems comply with both UAE Fire
                &amp; Life Safety Codes and international NFPA standards.
              </p>

              <div className="pt-2 flex flex-wrap gap-4">
                <a
                  href="/assets/images/company-profile.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-pill inline-flex items-center gap-2 bg-[#e01b24] py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#e01b24]/20 hover:bg-[#b3121a] transition-all"
                >
                  <Download className="size-4" />
                  <span>Download Company Profile (PDF)</span>
                </a>
                <Link
                  href="/contact"
                  className="btn-pill inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 py-3.5 text-sm font-semibold text-gray-800 transition-colors"
                >
                  <span>Contact Our Team</span>
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-100 bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/images/about-team-fire-extinguisher.webp"
                  alt="Lock Shield Engineering Team"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-[#0d1220]/90 backdrop-blur-md p-5 border border-white/10 text-white">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="size-8 text-[#e01b24] shrink-0" />
                    <div>
                      <h4 className="font-tech text-base font-bold uppercase tracking-wide">
                        Dubai Civil Defence Approved
                      </h4>
                      <p className="text-xs text-gray-300">
                        License No: 65123 · Fully Certified Engineers &amp; Technicians
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-[#f7f8fa] blueprint-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-3xl border border-gray-200 bg-white p-8 sm:p-10 shadow-sm hover:shadow-md transition-shadow">
              <div className="size-14 rounded-2xl bg-[#e01b24]/10 text-[#e01b24] flex items-center justify-center mb-6">
                <Target className="size-7" />
              </div>
              <h3 className="font-tech text-2xl font-bold uppercase tracking-tight text-gray-900">
                Our Mission
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mt-4 leading-relaxed">
                To provide state-of-the-art life safety and fire protection solutions that
                safeguard lives and assets through uncompromising technical precision, high-grade
                certified products, and reliable preventative maintenance across the UAE.
              </p>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-8 sm:p-10 shadow-sm hover:shadow-md transition-shadow">
              <div className="size-14 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-6">
                <Eye className="size-7" />
              </div>
              <h3 className="font-tech text-2xl font-bold uppercase tracking-tight text-gray-900">
                Our Vision
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mt-4 leading-relaxed">
                To be the undisputed leader and most trusted fire protection engineering company
                in the Middle East, recognized for rapid emergency responsiveness, compliance
                integrity, and groundbreaking safety innovations.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
