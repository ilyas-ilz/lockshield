import type { Metadata } from "next";
import { connectDB } from "@/lib/db";
import { DEFAULT_OPEN_GRAPH } from "@/lib/seo/site-metadata";
import { Service, Project } from "@/models";
import { getPublicSettings } from "@/lib/public-data";
import { getEnv } from "@/lib/env";
import { buildLocalBusinessSchema, buildFaqSchema, serializeJsonLd } from "@/lib/seo/jsonld";
import { HeroSlider } from "@/components/frontend/HeroSlider";
import type { FAQItem } from "@/components/frontend/FAQAccordion";
import { Section, SectionHead } from "@/components/frontend/Section";
import { Reveal } from "@/components/frontend/Reveal";
import { ServicesExpandingGrid } from "@/components/frontend/home/ServicesExpandingGrid";
import { ProjectsCarousel, type CarouselProject } from "@/components/frontend/ProjectsCarousel";
import { WhyChooseSection } from "@/components/frontend/home/WhyChooseSection";
import { StatsSection } from "@/components/frontend/home/StatsSection";
import { TestimonialsFaqSection } from "@/components/frontend/home/TestimonialsFaqSection";
import { ProcessTimelineSection } from "@/components/frontend/home/ProcessTimelineSection";
import { ClientsMarquee } from "@/components/frontend/home/ClientsMarquee";

// Content is editable from the admin, so pages must not be frozen at build
// time. Revalidate every 5 minutes.
export const revalidate = 300;

// WHY: the root layout's relative canonical "./" resolves to "/index" on the
// home route (Next's internal name for it), so the home page pins "/" itself.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { ...DEFAULT_OPEN_GRAPH, url: "/" },
};

// Questions are kept short enough to sit on ONE line in the numbered FAQ
// cards at desktop width. The answers carry the long-tail terms
// ("Dubai Civil Defence", "all seven emirates", "UL-300") that the
// questions drop, so the FAQ schema built from this array keeps them.
const FAQS: FAQItem[] = [
  {
    q: "What is an Annual Maintenance Contract (AMC)?",
    a: "An AMC is a mandatory yearly service agreement in the UAE under which certified technicians inspect, test, calibrate, and service your fire fighting, alarm, and suppression systems periodically to maintain full Dubai Civil Defence (DCD) compliance.",
  },
  {
    q: "How often must fire alarm systems be inspected?",
    a: "UAE Civil Defence regulations require fire alarm and fire fighting systems to be thoroughly inspected and certified quarterly (every 3 months), along with 24/7 emergency repair coverage.",
  },
  {
    q: "Do you handle DCD drawing and design approval?",
    a: "Yes. Our in-house licensed fire protection engineers prepare compliant shop drawings, hydraulic calculations, and documentation, submitting directly through the Civil Defence portal until final approvals and completion certificates are granted.",
  },
  {
    q: "Which areas and emirates do you cover?",
    a: "Lock Shield provides comprehensive fire protection services across all seven emirates: Dubai, Abu Dhabi, Sharjah, Ajman, Umm Al Quwain, Ras Al Khaimah, and Fujairah.",
  },
  {
    q: "Which industries and property types do you work with?",
    a: "We work with commercial towers, residential communities, healthcare facilities, schools, industrial warehouses, factories, retail outlets, and restaurants (including kitchen hood suppression).",
  },
  {
    q: "Do you offer 24/7 emergency support?",
    a: "Yes. Alongside regular office hours, our field team stays on call 24/7 for emergency breakdowns and repairs across all emirates.",
  },
  {
    q: "How often do extinguishers need refilling and testing?",
    a: "Extinguishers are checked at every scheduled inspection and must be refilled after any use or when the gauge leaves the green zone. Cylinders also need hydrostatic pressure testing every 3-5 years per Civil Defence code. We test, refill, and certify CO2, DCP, foam, and water extinguishers.",
  },
  {
    q: "What is FM-200 and where is it used?",
    a: "FM-200 is a waterless clean agent gas that suppresses fire without leaving residue, so it protects spaces where water would cause damage: server rooms, data centres, control rooms, archives, and electrical rooms.",
  },
  {
    q: "Do restaurants need kitchen hood suppression?",
    a: "Yes. Commercial kitchens need an approved wet chemical suppression system protecting the hood, ducts, and cooking appliances. We design, install, and service UL-300 certified kitchen fire suppression systems.",
  },
  {
    q: "Is the site visit and quotation free?",
    a: "Yes. We offer a free site visit and engineering consultation, then send a written quotation based on your building, its systems, and its Civil Defence compliance requirements.",
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
  { title: "Al Manara Pharmacy Fit-out", client: "Al Manara Pharmacy", sector: "Retail", emirate: "Dubai", slug: "al-manara-pharmacy", image: { url: "/assets/images/projects/al-manara-pharmacy.webp" } },
  { title: "Emirates NBD Corporate Facility", client: "Emirates NBD", sector: "Banking", emirate: "Dubai", slug: "emirates-nbd", image: { url: "/assets/images/projects/emirates-nbd.webp" } },
  { title: "Farsi Restaurant Suppression", client: "Farsi Restaurant", sector: "F&B", emirate: "Dubai", slug: "farsi-restaurant", image: { url: "/assets/images/projects/farsi-restaurant.webp" } },
];

export default async function HomePage() {
  let liveServices: PublicService[] = [];
  let liveProjects: CarouselProject[] = [];
  let jsonLdLocalBusiness: ReturnType<typeof buildLocalBusinessSchema> | null = null;

  try {
    await connectDB();
    const [services, projects, settings] = await Promise.all([
      Service.find({ status: "published" }).sort({ order: 1, title: 1 }).select("title slug summary").lean(),
      Project.find({ publishStatus: "published" })
        .sort({ featured: -1, createdAt: -1 })
        .limit(9)
        .select("title slug client sector emirate year coverImage")
        .lean(),
      getPublicSettings(),
    ]);

    // Next.js: only plain objects can go from Server -> Client Components.
    // Mongoose lean() still returns ObjectId/Date instances (have toJSON),
    // which throws. Map to plain strings/objects with only the fields
    // the carousels actually need.
    liveServices = ((services as unknown as Array<Record<string, unknown>>) ?? []).map((s) => ({
      title: String(s["title"] ?? ""),
      slug: String(s["slug"] ?? ""),
      summary: String(s["summary"] ?? ""),
    }));
    liveProjects = ((projects as unknown as Array<Record<string, unknown>>) ?? []).map((p) => {
      const cover = p["coverImage"] as { url?: unknown; alt?: unknown } | undefined;
      return {
        title: String(p["title"] ?? ""),
        slug: String(p["slug"] ?? ""),
        client: typeof p["client"] === "string" ? (p["client"] as string) : "",
        sector: typeof p["sector"] === "string" ? (p["sector"] as string) : "",
        emirate: typeof p["emirate"] === "string" ? (p["emirate"] as string) : "",
        coverImage: cover?.url
          ? { url: String(cover.url), alt: typeof cover.alt === "string" ? cover.alt : "" }
          : undefined,
      } as CarouselProject;
    });

    // WHY sourced from Settings, not hardcoded: one place (admin > Settings)
    // to correct the phone/address/socials that show up here AND in the
    // footer AND on the contact page, instead of three copies drifting apart.
    const siteUrl = getEnv().SITE_URL;
    // Static logo fallback: Google's LocalBusiness rich result wants an
    // image, and Settings.logoUrl is empty until someone uploads one.
    const logoPath = settings.logoUrl || "/assets/images/logo-lockshield.png";
    jsonLdLocalBusiness = buildLocalBusinessSchema({
      legalName: settings.legalName,
      alternateNames: ["Lock Shield", "Lockshield", "Lock Shield Fire Safety"],
      siteUrl,
      logoUrl: logoPath.startsWith("http") ? logoPath : `${siteUrl}${logoPath}`,
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

  // The homepage is a teaser: /services and /projects list everything, and
  // each item has its own detail page. Four service cards mirror the
  // reference design (4-across with thumbnails); three projects is enough.
  const displayServices = (liveServices.length > 0 ? liveServices : DEFAULT_SERVICES).slice(0, 4);
  const displayProjects = (liveProjects.length > 0 ? liveProjects : DEFAULT_PROJECTS).slice(0, 3);

  const jsonLdFAQ = buildFaqSchema(FAQS.map((faq) => ({ question: faq.q, answer: faq.a })));

  return (
    <>
      {jsonLdLocalBusiness && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLdLocalBusiness) }} />
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLdFAQ) }} />

      {/* 1. Hero — sticky pinned, covered on scroll by .page-body below */}
      <HeroSlider />

      {/* Sheet that slides up over the pinned hero (see .hero-pin/.page-body
          in globals.css). Opaque bg + higher z-index does the covering;
          rounded top + negative margin reveals it as a sheet. */}
      <div className="page-body -mt-6 overflow-clip rounded-t-[1.5rem] shadow-[0_-24px_60px_-20px_rgba(13,18,32,0.45)] sm:-mt-8 sm:rounded-t-[2rem]">
      {/* 2. Core Services — interactive expanding row on desktop, plain grid on touch.
          Links/slugs/copy unchanged; only the motion changes. */}
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

        <ServicesExpandingGrid services={displayServices} />
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

      {/* 4. Why choose us */}
      <WhyChooseSection />

      {/* 5. Stats */}
      <StatsSection />

      {/* 6. Testimonials + FAQ */}
      <TestimonialsFaqSection faqs={FAQS} />

      {/* 7. Process timeline — the single "how we work" section. JourneySection
          told the same five steps again in a dark photo band and was dropped
          from this page; the component still exists if it's wanted elsewhere. */}
      <ProcessTimelineSection />

      {/* 8. Clients marquee */}
      <ClientsMarquee />

      {/* 9. CTA band - slim by design: the full quote form lives on
          /contact and job applications on /career, so home just routes. */}
      <section className="section-y-sm relative overflow-hidden bg-ink">
        <div className="blueprint-grid-dark pointer-events-none absolute inset-0 opacity-20" />
        <div className="wrap relative z-10 flex flex-col items-center gap-5 text-center">
          <Reveal>
            <span className="eyebrow">Schedule a Site Inspection</span>
            <h2 className="font-tech mt-2 text-[clamp(1.5rem,4.5vw,2.4rem)] font-bold uppercase leading-tight tracking-tight text-white">
              Secure your facility — <span className="text-brand-500">get a quote today</span>
            </h2>
          </Reveal>
        </div>
      </section>
      </div>
    </>
  );
}
