import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Service } from "@/models";

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
    summary:
      "Comprehensive preventative maintenance, quarterly inspections, and 24/7 emergency response for all fire protection assets.",
  },
  {
    title: "Designing, Drawing & Civil Defence Approval",
    slug: "designing-drawing-civil-defence-approval",
    summary:
      "Full engineering design, AutoCAD shop drawings, and hassle-free approvals from Dubai Civil Defence (DCD).",
  },
  {
    title: "FM-200 Special Fire Suppression Systems",
    slug: "fm-200-special-systems",
    summary:
      "Waterless clean agent fire extinguishing solutions protecting sensitive server rooms, data centers, and critical facilities.",
  },
  {
    title: "Kitchen Fire Suppression Systems",
    slug: "kitchen-fire-suppression-systems",
    summary:
      "UL-300 certified wet chemical fire suppression safeguarding commercial kitchen hoods, ducts, and cooking appliances.",
  },
  {
    title: "Fire Extinguisher Refilling & Testing",
    slug: "fire-extinguisher-refilling",
    summary:
      "Authorized hydrostatic testing, refilling, and certification for CO2, DCP, foam, and water extinguishers.",
  },
  {
    title: "Fire System Products Supply & Trading",
    slug: "fire-system-products-supply",
    summary:
      "Genuine certified firefighting equipment, alarm panels, smoke detectors, landing valves, and fire hoses.",
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
  }

  const items = servicesList.length > 0 ? servicesList : DEFAULT_SERVICES;

  return (
    <>
      <section className="pt-36 pb-16 bg-[#0d1220] text-white relative overflow-hidden">
        <div className="blueprint-grid-dark absolute inset-0 opacity-20 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <span className="font-tech text-xs sm:text-sm font-bold uppercase tracking-widest text-[#e01b24]">
            Certified Solutions
          </span>
          <h1 className="font-tech text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-white mt-2">
            Our Fire Safety <span className="text-[#e01b24]">Services</span>
          </h1>
          <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto mt-4 font-light">
            End-to-end fire engineering: design, DCD approvals, installation, suppression, and
            24/7 annual maintenance contracts.
          </p>
        </div>
      </section>

      <section className="py-20 sm:py-28 bg-[#f7f8fa] blueprint-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((service, idx) => (
              <Link
                key={service.slug || idx}
                href={`/services/${service.slug}`}
                className="group flex flex-col justify-between rounded-3xl border border-gray-200 bg-white p-8 hover:border-[#e01b24] hover:shadow-xl transition-all duration-300"
              >
                <div>
                  <div className="size-14 rounded-2xl bg-[#e01b24]/10 text-[#e01b24] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#e01b24] group-hover:text-white transition-all">
                    <Flame className="size-7" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 font-tech uppercase tracking-wide group-hover:text-[#e01b24] transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                    {service.summary}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-500 group-hover:text-[#e01b24]">
                  <span>View Details & Specifications</span>
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
