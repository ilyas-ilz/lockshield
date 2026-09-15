import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Phone,
  ArrowRight,
  Flame,
  FileCheck,
  ChevronRight,
} from "lucide-react";
import { connectDB } from "@/lib/db";
import { Service } from "@/models";
import { BlockRenderer } from "@/components/frontend/BlockRenderer";
import { QuickQuoteForm } from "@/components/frontend/QuickQuoteForm";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const SERVICE_FALLBACKS: Record<string, { title: string; summary: string; details: string[] }> = {
  "annual-maintenance-contract": {
    title: "Annual Maintenance Contract (AMC)",
    summary:
      "24/7 complete preventative maintenance, certified quarterly inspections, and emergency repair coverage for all fire protection assets.",
    details: [
      "Quarterly comprehensive system inspection and functional testing",
      "Full Dubai Civil Defence (DCD) inspection compliance certificates",
      "24/7 round-the-clock emergency response team across all emirates",
      "Routine testing of fire alarm control panels, smoke & heat detectors",
      "Fire pump flow testing, sprinkler valve maintenance, and pressure monitoring",
      "Detailed digital maintenance logs and compliance reporting",
    ],
  },
  "designing-drawing-civil-defence-approval": {
    title: "Designing, Drawing & Civil Defence Approval",
    summary:
      "Full engineering design, AutoCAD shop drawings, hydraulic calculations, and hassle-free approvals from Dubai Civil Defence (DCD).",
    details: [
      "AutoCAD shop drawings compliant with UAE Fire & Life Safety Code",
      "Hydraulic calculation reports for sprinkler and standpipe networks",
      "Fire alarm detection zoning and evacuation plan schematics",
      "Direct portal submission and liaison with Civil Defence inspection officers",
      "Site inspection coordination and final completion certificate issuance",
      "Fit-out and modification approvals for restaurants, warehouses, and commercial spaces",
    ],
  },
  "fm-200-special-systems": {
    title: "FM-200 Special Fire Suppression Systems",
    summary:
      "Waterless clean agent fire extinguishing solutions protecting sensitive server rooms, data centers, and critical facilities.",
    details: [
      "Fast-acting total flooding suppression within 10 seconds of discharge",
      "Zero water damage and non-conductive — safe for electronics and servers",
      "UL listed and FM approved cylinders, valves, and release solenoids",
      "Room integrity fan testing (door fan test) for concentration retention",
      "Gas cylinder weight check, hydrostatic pressure testing, and refilling",
      "Complete integration with early-warning aspiration smoke detection (VESDA)",
    ],
  },
  "kitchen-fire-suppression-systems": {
    title: "Kitchen Fire Suppression Systems",
    summary:
      "UL-300 certified wet chemical fire suppression safeguarding commercial kitchen hoods, ducts, and cooking appliances.",
    details: [
      "UL-300 certified wet chemical agent specifically formulated for grease fires",
      "Automatic and manual pull-station actuation mechanisms",
      "Automatic gas shut-off valve triggering upon system discharge",
      "Precision discharge nozzles aimed at fryers, griddles, woks, and range tops",
      "Semi-annual inspection and nozzle cap replacement per NFPA 96 & 17A",
      "Mandatory requirement for restaurant and hotel kitchen licensing in UAE",
    ],
  },
  "fire-extinguisher-refilling": {
    title: "Fire Extinguisher Refilling & Testing",
    summary:
      "Authorized hydrostatic testing, refilling, and certification for CO2, DCP, foam, and water extinguishers.",
    details: [
      "Hydrostatic cylinder pressure testing every 3-5 years per Civil Defence code",
      "Dry chemical powder (DCP), CO2 gas, foam, and water refilling",
      "Pressure gauge inspection, discharge hose replacement, and safety pin sealing",
      "Civil Defence compliant inspection inspection tags and certification barcodes",
      "Loaner extinguishers provided during workshop servicing to maintain site safety",
      "Bulk refilling services for logistics fleets, warehouses, and building communities",
    ],
  },
  "fire-system-products-supply": {
    title: "Fire System Products Supply & Trading",
    summary:
      "Genuine certified firefighting equipment, alarm panels, smoke detectors, landing valves, and fire hoses.",
    details: [
      "UL listed and FM approved conventional and addressable fire alarm panels",
      "Optical smoke detectors, multi-sensor detectors, and manual call points",
      "Breeching inlets, landing valves, fire hose reels, and fire hydrants",
      "Certified emergency exit lights, central battery systems, and safety signage",
      "Fire rated cables, junction boxes, and sprinkler heads (pendent, upright, sidewall)",
      "Competitive wholesale pricing with immediate stock delivery across the UAE",
    ],
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  await connectDB().catch(() => {});
  const service = await Service.findOne({ slug, status: "published" }).lean().catch(() => null);

  const title = service?.title || SERVICE_FALLBACKS[slug]?.title || "Service Details";
  const desc = service?.summary || SERVICE_FALLBACKS[slug]?.summary || "Fire protection service by Lock Shield UAE";

  return {
    title: `${title} | Lock Shield UAE`,
    description: desc,
  };
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  let service: any = null;
  let allServices: any[] = [];

  try {
    await connectDB();
    const [found, others] = await Promise.all([
      Service.findOne({ slug, status: "published" }).lean(),
      Service.find({ status: "published" }).select("title slug").lean(),
    ]);
    service = found;
    allServices = others || [];
  } catch {
    // Database connection fallback
  }

  const fallback = SERVICE_FALLBACKS[slug];
  if (!service && !fallback) {
    notFound();
  }

  const title = service?.title || fallback?.title;
  const summary = service?.summary || fallback?.summary;
  const details = fallback?.details || [];
  const blocks = service?.blocks || [];

  return (
    <>
      {/* Header */}
      <section className="pt-36 pb-16 bg-[#0d1220] text-white relative overflow-hidden">
        <div className="blueprint-grid-dark absolute inset-0 opacity-20 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="size-3.5" />
            <Link href="/services" className="hover:text-white transition-colors">
              Services
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-white font-medium truncate">{title}</span>
          </div>

          <div className="max-w-3xl">
            <span className="font-tech text-xs font-bold uppercase tracking-widest text-[#e01b24]">
              Civil Defence Certified
            </span>
            <h1 className="font-tech text-3xl sm:text-5xl font-bold uppercase tracking-tight text-white mt-2">
              {title}
            </h1>
            <p className="text-gray-300 text-sm sm:text-base mt-4 font-light leading-relaxed">
              {summary}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content & Sidebar */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Content Area */}
            <div className="lg:col-span-8 space-y-10">
              {service?.coverImage?.url && (
                <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={service.coverImage.url}
                    alt={service.coverImage.alt || title}
                    className="w-full h-auto max-h-96 object-cover"
                  />
                </div>
              )}

              {/* Overview & Key Highlights */}
              <div className="space-y-6">
                <h2 className="font-tech text-2xl sm:text-3xl font-bold uppercase tracking-tight text-gray-900">
                  Engineering Standards &amp; Capabilities
                </h2>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  Lock Shield delivers certified implementation for {title} conforming strictly to
                  Dubai Civil Defence (DCD) regulations, UAE Fire and Life Safety Codes of Practice,
                  and NFPA guidelines. Our licensed engineers carry out full system lifecycle
                  management.
                </p>

                {details.length > 0 && (
                  <div className="space-y-3 pt-2">
                    {details.map((detail, idx) => (
                      <div key={idx} className="flex items-start gap-3.5">
                        <CheckCircle2 className="size-5 text-[#e01b24] shrink-0 mt-0.5" />
                        <span className="text-sm sm:text-base text-gray-700 leading-relaxed">
                          {detail}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dynamic Block Rendering if configured in admin */}
              {blocks.length > 0 && <BlockRenderer blocks={blocks} />}

              {/* Civil Defence Compliance Guarantee Banner */}
              <div className="rounded-3xl bg-[#f7f8fa] border border-gray-200 p-8 flex flex-col sm:flex-row items-center gap-6">
                <div className="size-16 rounded-2xl bg-[#e01b24]/10 text-[#e01b24] flex items-center justify-center shrink-0">
                  <ShieldCheck className="size-8" />
                </div>
                <div>
                  <h3 className="font-tech text-lg font-bold uppercase text-gray-900">
                    100% Civil Defence Approved Guarantee
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    Every installation and maintenance inspection is accompanied by official
                    documentation and certificates accepted by Dubai Civil Defence and insurance
                    underwriters.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-4 space-y-8">
              {/* Quick Quote Form Box */}
              <div className="sticky top-28 space-y-8">
                <QuickQuoteForm />

                {/* Other Services List */}
                <div className="rounded-3xl border border-gray-200 bg-[#f7f8fa] p-6 space-y-4">
                  <h3 className="font-tech text-base font-bold uppercase tracking-wider text-gray-900">
                    Explore Other Services
                  </h3>
                  <ul className="space-y-2 text-sm">
                    {Object.entries(SERVICE_FALLBACKS).map(([sSlug, sData]) => {
                      if (sSlug === slug) return null;
                      return (
                        <li key={sSlug}>
                          <Link
                            href={`/services/${sSlug}`}
                            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white hover:text-[#e01b24] transition-colors group text-gray-700 font-medium"
                          >
                            <span className="truncate">{sData.title}</span>
                            <ArrowRight className="size-3.5 text-gray-400 group-hover:text-[#e01b24] group-hover:translate-x-0.5 transition-all" />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
