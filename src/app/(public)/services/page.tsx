import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { serviceIcon } from "@/components/frontend/serviceMeta";
import { connectDB } from "@/lib/db";
import { Service } from "@/models";
import { PageHero } from "@/components/frontend/PageHero";
import { Section } from "@/components/frontend/Section";
import { Reveal } from "@/components/frontend/Reveal";

// Content is editable from the admin, so pages must not be frozen at build
// time. Revalidate every 5 minutes.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Fire Protection Services | Lock Shield UAE",
  description:
    "Explore our complete range of certified fire fighting, suppression, fire alarm, and Civil Defence approval services in Dubai & UAE.",
};

interface ServiceItem {
  title: string;
  slug: string;
  summary: string;
}

const DEFAULT_SERVICES: ServiceItem[] = [
  {
    title: "Annual Maintenance Contract (AMC)",
    slug: "annual-maintenance-contract",
    summary: "Comprehensive preventative maintenance, quarterly inspections, and 24/7 emergency response for all fire protection assets.",
  },
  {
    title: "Designing, Drawing & Civil Defence Approval",
    slug: "designing-drawing-civil-defence-approval",
    summary: "Full engineering design, AutoCAD shop drawings, and hassle-free approvals from Dubai Civil Defence (DCD).",
  },
  {
    title: "FM-200 Special Fire Suppression Systems",
    slug: "fm-200-special-systems",
    summary: "Waterless clean agent fire extinguishing solutions protecting sensitive server rooms, data centers, and critical facilities.",
  },
  {
    title: "Kitchen Fire Suppression Systems",
    slug: "kitchen-fire-suppression-systems",
    summary: "UL-300 certified wet chemical fire suppression safeguarding commercial kitchen hoods, ducts, and cooking appliances.",
  },
  {
    title: "Fire Extinguisher Refilling & Testing",
    slug: "fire-extinguisher-refilling",
    summary: "Authorized hydrostatic testing, refilling, and certification for CO2, DCP, foam, and water extinguishers.",
  },
  {
    title: "Fire System Products Supply & Trading",
    slug: "fire-system-products-supply",
    summary: "Genuine certified firefighting equipment, alarm panels, smoke detectors, landing valves, and fire hoses.",
  },
];

export default async function ServicesPage() {
  let servicesList: ServiceItem[] = [];
  try {
    await connectDB();
    const services = await Service.find({ status: "published" }).sort({ order: 1, title: 1 }).lean();
    servicesList = (services as unknown as ServiceItem[]) || [];
  } catch {
    // Fallback
    void 0;
  }

  const items = servicesList.length > 0 ? servicesList : DEFAULT_SERVICES;

  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Services" }]}
        title="Our Fire Safety"
        accent="Services"
        description="End-to-end fire engineering: design, DCD approvals, installation, suppression, and 24/7 annual maintenance contracts."
      />

      <Section className="blueprint-grid bg-paper-soft">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {items.map((service, idx) => {
            const Icon = serviceIcon(service.slug);
            return (
            <Reveal key={service.slug || idx} delayMs={(idx % 3) * 80}>
              <Link
                href={`/services/${service.slug}`}
                className="group flex h-full flex-col justify-between rounded-3xl border border-[var(--marketing-line)] bg-white p-6 transition-all duration-300 hover:border-brand-500 hover:shadow-xl sm:p-8"
              >
                <div>
                  <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500 transition-all group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white">
                    <Icon className="size-7" aria-hidden />
                  </div>
                  <h3 className="font-tech text-lg font-bold uppercase tracking-wide text-navy-900 transition-colors group-hover:text-brand-500 sm:text-xl">
                    {service.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink/62">{service.summary}</p>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-[var(--marketing-line)] pt-4 text-xs font-semibold text-ink/50 group-hover:text-brand-500">
                  <span>View Details &amp; Specifications</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </Reveal>
            );
          })}
        </div>
      </Section>
    </>
  );
}
