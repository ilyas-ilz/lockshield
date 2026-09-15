import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Service, Project } from "@/models";
import { getSettings } from "@/lib/settings";
import { getEnv } from "@/lib/env";
import { buildLocalBusinessSchema, buildFaqSchema } from "@/lib/seo/jsonld";
import { HeroSlider } from "@/components/frontend/HeroSlider";
import { QuickQuoteForm } from "@/components/frontend/QuickQuoteForm";
import type { FAQItem } from "@/components/frontend/FAQAccordion";
import { Section, SectionHead } from "@/components/frontend/Section";
import { Reveal } from "@/components/frontend/Reveal";
import { ProjectsCarousel, type CarouselProject } from "@/components/frontend/ProjectsCarousel";
import { JourneySection } from "@/components/frontend/home/JourneySection";
import { WhyChooseSection } from "@/components/frontend/home/WhyChooseSection";
import { StatsSection } from "@/components/frontend/home/StatsSection";
import { TestimonialsFaqSection } from "@/components/frontend/home/TestimonialsFaqSection";
import { ProcessTimelineSection } from "@/components/frontend/home/ProcessTimelineSection";
import { ClientsMarquee } from "@/components/frontend/home/ClientsMarquee";

// Content is editable from the admin, so pages must not be frozen at build
// time. Revalidate every 5 minutes.
export const revalidate = 300;

const FAQS: FAQItem[] = [
  {
    q: "What is an Annual Maintenance Contract (AMC) for fire safety?",
    a: "An AMC is a mandatory yearly service agreement in the UAE under which certified technicians inspect, test, calibrate, and service your fire fighting, alarm, and suppression systems periodically to maintain full Dubai Civil Defence (DCD) compliance.",
  },
  {
    q: "How often must fire alarm and sprinkler systems be inspected in UAE?",
    a: "UAE Civil Defence regulations require fire alarm and fire fighting systems to be thoroughly inspected and certified quarterly (every 3 months), along with 24/7 emergency repair coverage.",
  },
  {
    q: "Do you handle Dubai Civil Defence (DCD) drawing and design approval?",
    a: "Yes. Our in-house licensed fire protection engineers prepare compliant shop drawings, hydraulic calculations, and documentation, submitting directly through the Civil Defence portal until final approvals and completion certificates are granted.",
  },
  {
    q: "What areas and emirates do you provide fire safety services in?",
    a: "Lock Shield provides comprehensive fire protection services across all seven emirates: Dubai, Abu Dhabi, Sharjah, Ajman, Umm Al Quwain, Ras Al Khaimah, and Fujairah.",
  },
  {
    q: "Which industries and property types do you work with?",
    a: "We work with commercial towers, residential communities, healthcare facilities, schools, industrial warehouses, factories, retail outlets, and restaurants (including kitchen hood suppression).",
  },
];

interface PublicService {
  title: string;
  slug: string;
  summary: string;
}

const DEFAULT_SERVICES: PublicService[] = [
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

const DEFAULT_PROJECTS: CarouselProject[] = [
  { title: "Al Manara Pharmacy Fit-out", client: "Al Manara Pharmacy", sector: "Retail", emirate: "Dubai", slug: "al-manara-pharmacy", image: { url: "/assets/images/commercial.webp" } },
  { title: "Emirates NBD Corporate Facility", client: "Emirates NBD", sector: "Banking", emirate: "Dubai", slug: "emirates-nbd", image: { url: "/assets/images/about-img1.webp" } },
  { title: "Farsi Restaurant Suppression", client: "Farsi Restaurant", sector: "F&B", emirate: "Dubai", slug: "farsi-restaurant", image: { url: "/assets/images/restaurants.webp" } },
];

export default async function HomePage() {
  let liveServices: PublicService[] = [];
  let liveProjects: CarouselProject[] = [];
  let jsonLdLocalBusiness: ReturnType<typeof buildLocalBusinessSchema> | null = null;

  try {
    await connectDB();
    const [services, projects, settings] = await Promise.all([
      Service.find({ status: "published" }).sort({ order: 1, title: 1 }).lean(),
      Project.find({ publishStatus: "published" }).sort({ featured: -1, createdAt: -1 }).limit(9).lean(),
      getSettings(),
    ]);

    liveServices = (services as unknown as PublicService[]) || [];
    liveProjects = (projects as unknown as CarouselProject[]) || [];

    // WHY sourced from Settings, not hardcoded: one place (admin > Settings)
    // to correct the phone/address/socials that show up here AND in the
    // footer AND on the contact page, instead of three copies drifting apart.
    const siteUrl = getEnv().SITE_URL;
    jsonLdLocalBusiness = buildLocalBusinessSchema({
      legalName: settings.legalName,
      siteUrl,
      logoUrl: settings.logoUrl ? (settings.logoUrl.startsWith("http") ? settings.logoUrl : `${siteUrl}${settings.logoUrl}`) : undefined,
      phones: settings.phones,
      emails: settings.emails,
      address: {
        poBox: settings.address.poBox,
        street: settings.address.street,
        locality: settings.address.locality,
        country: settings.address.country,
      },
      // Mongoose always materializes the geo subdocument, even with no
      // lat/lng ever set, so a plain `settings.address.geo` truthy-check
      // would emit an invalid, coordinate-less GeoCoordinates block.
      geo:
        typeof settings.address.geo?.lat === "number" && typeof settings.address.geo?.lng === "number"
          ? settings.address.geo
          : undefined,
      socials: settings.socials.map((s) => ({ url: s.url })),
      partnerLinks: settings.partnerLinks.map((p) => ({ url: p.url })),
    });
  } catch {
    // Database fallback
    void 0;
  }

  const displayServices = liveServices.length > 0 ? liveServices : DEFAULT_SERVICES;
  const displayProjects = liveProjects.length > 0 ? liveProjects : DEFAULT_PROJECTS;

  const jsonLdFAQ = buildFaqSchema(FAQS.map((faq) => ({ question: faq.q, answer: faq.a })));

  return (
    <>
      {jsonLdLocalBusiness && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdLocalBusiness) }} />
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFAQ) }} />

      {/* 1. Hero */}
      <HeroSlider />

      {/* 2. Core Services */}
      <Section className="blueprint-grid bg-paper-soft">
        <SectionHead
          eyebrow="Complete Protection"
          title={
            <>
              End-to-end fire protection
              <br />
              under one roof
            </>
          }
          action={{ label: "View All Services", href: "/services" }}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5">
          {displayServices.map((service, idx) => (
            <Reveal key={service.slug || idx} delayMs={(idx % 3) * 80} className="group">
              <Link
                href={`/services/${service.slug}`}
                className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-[var(--marketing-line)] bg-white p-5 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_22px_50px_rgba(224,27,36,0.16)] sm:p-6"
              >
                <div className="border-beam" aria-hidden />
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500 transition-all group-hover:scale-110 group-hover:-rotate-6 group-hover:bg-brand-500 group-hover:text-white">
                      <span className="font-tech text-sm font-bold">{String(idx + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="font-tech text-base font-bold uppercase tracking-wide text-navy-900 transition-colors group-hover:text-brand-500 sm:text-lg">
                      {service.title}
                    </h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-ink/62">
                    {service.summary || "Complete engineering design, testing and certified installation compliant with Dubai Civil Defence."}
                  </p>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-[var(--marketing-line)] pt-3 text-xs font-semibold text-ink/50 group-hover:text-brand-500">
                  <span>Explore Service Details</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* 3. Projects carousel */}
      <Section className="bg-white">
        <SectionHead
          eyebrow="Our Completed Projects"
          title={
            <>
              Built with trust. <span className="text-brand-500">Secured with safety.</span>
            </>
          }
          action={{ label: "View All Projects", href: "/projects" }}
        />
        <ProjectsCarousel projects={displayProjects} />
      </Section>

      {/* 4. Journey */}
      <JourneySection />

      {/* 5. Why choose us */}
      <WhyChooseSection />

      {/* 6. Stats */}
      <StatsSection />

      {/* 7. Testimonials + FAQ */}
      <TestimonialsFaqSection faqs={FAQS} />

      {/* 8. Process timeline */}
      <ProcessTimelineSection />

      {/* 9. Clients marquee */}
      <ClientsMarquee />

      {/* 10. Quote consultation CTA */}
      <section className="relative bg-ink py-14 sm:py-20 lg:py-24">
        <div className="blueprint-grid-dark pointer-events-none absolute inset-0 opacity-20" />
        <div className="wrap relative z-10">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
            <Reveal className="space-y-5 text-white sm:space-y-6 lg:col-span-6">
              <span className="eyebrow">Schedule a Site Inspection</span>
              <h2 className="font-tech text-[clamp(1.8rem,5.5vw,3rem)] font-bold uppercase leading-tight tracking-tight text-white">
                Secure Your Facility <br />
                <span className="text-brand-500">Get A Quote Today</span>
              </h2>
              <p className="text-sm font-light leading-relaxed text-gray-300 sm:text-base">
                Our certified fire engineers will visit your premises anywhere in Dubai or the UAE,
                assess compliance needs, and provide a competitive quote with zero obligation.
              </p>

              <div className="space-y-3 pt-2 sm:pt-4">
                {[
                  "Full Dubai Civil Defence compliance review",
                  "24/7 dedicated engineering helpline",
                  "Fast turnaround on approval submissions",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle className="size-5 shrink-0 text-emerald-400" />
                    <span className="text-sm text-gray-200">{item}</span>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delayMs={100} className="lg:col-span-6">
              <QuickQuoteForm />
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
