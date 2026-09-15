import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, CheckCircle2, ArrowRight, ChevronRight, FileText } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Service } from "@/models";
import { BlockRenderer } from "@/components/frontend/BlockRenderer";
import { QuickQuoteForm } from "@/components/frontend/QuickQuoteForm";
import { Reveal } from "@/components/frontend/Reveal";

// Content is editable from the admin, so pages must not be frozen at build
// time. Revalidate every 5 minutes.
export const revalidate = 300;

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
      "Civil Defence compliant inspection tags and certification barcodes",
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

interface ServiceDoc {
  title: string;
  summary: string;
  coverImage?: { url: string; alt?: string };
  blocks?: Record<string, unknown>[];
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  let service: ServiceDoc | null = null;

  try {
    await connectDB();
    const found = await Service.findOne({ slug, status: "published" }).lean();
    service = (found as unknown as ServiceDoc) || null;
  } catch {
    // Database connection fallback
    void 0;
  }

  const fallback = SERVICE_FALLBACKS[slug];
  if (!service && !fallback) {
    notFound();
  }

  const title = service?.title || fallback?.title || "";
  const summary = service?.summary || fallback?.summary;
  const details = fallback?.details || [];
  const blocks = service?.blocks || [];

  return (
    <>
      {/* Header */}
      <section className="relative overflow-hidden bg-ink pb-12 pt-28 text-white sm:pb-16 sm:pt-32 lg:pt-36">
        <div className="blueprint-grid-dark pointer-events-none absolute inset-0 opacity-10" />
        <div className="wrap relative z-10">
          <div className="font-tech mb-4 flex flex-wrap items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-white/55 sm:text-xs">
            <Link href="/" className="transition-colors hover:text-brand-400">
              Home
            </Link>
            <ChevronRight className="size-3 text-brand-500" />
            <Link href="/services" className="transition-colors hover:text-brand-400">
              Services
            </Link>
            <ChevronRight className="size-3 text-brand-500" />
            <span className="truncate font-medium text-white">{title}</span>
          </div>

          <div className="max-w-3xl">
            <span className="eyebrow">Civil Defence Certified</span>
            <h1 className="font-tech mt-2 text-[clamp(1.9rem,6vw,3.2rem)] font-bold uppercase leading-[1.05] tracking-tight text-white">
              {title}
            </h1>
            <p className="mt-4 text-sm font-light leading-relaxed text-white/75 sm:text-base">{summary}</p>
          </div>
        </div>
      </section>

      {/* Main Content & Sidebar */}
      <section className="bg-white py-14 sm:py-20 lg:py-24">
        <div className="wrap">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Left Content Area */}
            <div className="space-y-8 lg:col-span-8 lg:space-y-10">
              {service?.coverImage?.url && (
                <Reveal className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-[var(--marketing-line)] shadow-md">
                  <Image src={service.coverImage.url} alt={service.coverImage.alt || title} fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" />
                </Reveal>
              )}

              {/* Overview & Key Highlights */}
              <Reveal delayMs={80} className="space-y-6">
                <h2 className="font-tech text-xl font-bold uppercase tracking-tight text-navy-900 sm:text-3xl">
                  Engineering Standards &amp; Capabilities
                </h2>
                <p className="text-sm leading-relaxed text-ink/65 sm:text-base">
                  Lock Shield delivers certified implementation for {title} conforming strictly to
                  Dubai Civil Defence (DCD) regulations, UAE Fire and Life Safety Codes of Practice,
                  and NFPA guidelines. Our licensed engineers carry out full system lifecycle
                  management.
                </p>

                {details.length > 0 && (
                  <div className="space-y-3 pt-2">
                    {details.map((detail, idx) => (
                      <div key={idx} className="flex items-start gap-3.5">
                        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-500" />
                        <span className="text-sm leading-relaxed text-ink/72 sm:text-base">{detail}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Reveal>

              {/* Dynamic Block Rendering if configured in admin */}
              {blocks.length > 0 && <BlockRenderer blocks={blocks} />}

              {/* Civil Defence Compliance Guarantee Banner */}
              <Reveal delayMs={100} className="flex flex-col items-center gap-5 rounded-3xl border border-[var(--marketing-line)] bg-paper-soft p-6 sm:flex-row sm:gap-6 sm:p-8">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500">
                  <ShieldCheck className="size-8" />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="font-tech text-base font-bold uppercase text-navy-900 sm:text-lg">
                    100% Civil Defence Approved Guarantee
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-ink/60 sm:text-sm">
                    Every installation and maintenance inspection is accompanied by official
                    documentation and certificates accepted by Dubai Civil Defence and insurance
                    underwriters.
                  </p>
                </div>
              </Reveal>
            </div>

            {/* Right Sidebar - static below lg, sticky alongside content on desktop */}
            <div className="lg:col-span-4">
              <div className="space-y-6 lg:sticky lg:top-28 lg:space-y-8">
                <QuickQuoteForm />

                {/* Other Services List */}
                <div className="space-y-4 rounded-3xl border border-[var(--marketing-line)] bg-paper-soft p-6">
                  <h3 className="font-tech text-sm font-bold uppercase tracking-wider text-navy-900">
                    Explore Other Services
                  </h3>
                  <ul className="space-y-1 text-sm">
                    {Object.entries(SERVICE_FALLBACKS).map(([sSlug, sData]) => {
                      if (sSlug === slug) return null;
                      return (
                        <li key={sSlug}>
                          <Link
                            href={`/services/${sSlug}`}
                            className="group flex min-h-11 items-center justify-between rounded-xl p-2.5 font-medium text-ink/75 transition-colors hover:bg-white hover:text-brand-500"
                          >
                            <span className="truncate">{sData.title}</span>
                            <ArrowRight className="size-3.5 shrink-0 text-ink/35 transition-all group-hover:translate-x-0.5 group-hover:text-brand-500" />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>

                  <a
                    href="/assets/images/company-profile.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-11 items-center gap-2.5 border-t border-dashed border-[var(--marketing-line)] pt-4 text-sm font-semibold text-ink/75 transition-colors hover:text-brand-500"
                  >
                    <FileText className="size-4.5 shrink-0 text-brand-500" />
                    <span>
                      Company Profile
                      <span className="block text-xs font-normal text-ink/50">Download PDF</span>
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
