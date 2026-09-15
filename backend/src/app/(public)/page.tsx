import Link from "next/link";
import { ArrowRight, CheckCircle, Flame } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Service, Project, Post } from "@/models";
import { HeroSlider } from "@/components/frontend/HeroSlider";
import { QuickQuoteForm } from "@/components/frontend/QuickQuoteForm";
import { FAQAccordion, type FAQItem } from "@/components/frontend/FAQAccordion";

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
    a: "We work with commercial towers, residential residential communities, healthcare facilities, schools, industrial warehouses, factories, retail outlets, and restaurants (including kitchen hood suppression).",
  },
];

interface PublicService {
  title: string;
  slug: string;
  summary: string;
  icon?: string;
}

interface PublicProject {
  title: string;
  slug: string;
  client?: string;
  sector?: string;
  emirate?: string;
  coverImage?: { url: string; alt?: string };
  image?: { url: string; alt?: string };
}

interface PublicPost {
  _id?: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt?: Date;
  coverImage?: { url: string; alt?: string };
}

const DEFAULT_SERVICES: PublicService[] = [
  {
    title: "Annual Maintenance Contract (AMC)",
    slug: "annual-maintenance-contract",
    summary:
      "Comprehensive preventative maintenance, quarterly inspections, and 24/7 emergency response for all fire protection assets.",
    icon: "maintenance",
  },
  {
    title: "Designing, Drawing & Civil Defence Approval",
    slug: "designing-drawing-civil-defence-approval",
    summary:
      "Full engineering design, AutoCAD shop drawings, and hassle-free approvals from Dubai Civil Defence (DCD).",
    icon: "drawing",
  },
  {
    title: "FM-200 Special Fire Suppression Systems",
    slug: "fm-200-special-systems",
    summary:
      "Waterless clean agent fire extinguishing solutions protecting sensitive server rooms, data centers, and critical facilities.",
    icon: "fm200",
  },
  {
    title: "Kitchen Fire Suppression Systems",
    slug: "kitchen-fire-suppression-systems",
    summary:
      "UL-300 certified wet chemical fire suppression safeguarding commercial kitchen hoods, ducts, and cooking appliances.",
    icon: "kitchen",
  },
  {
    title: "Fire Extinguisher Refilling & Testing",
    slug: "fire-extinguisher-refilling",
    summary:
      "Authorized hydrostatic testing, refilling, and certification for CO2, DCP, foam, and water extinguishers.",
    icon: "extinguisher",
  },
  {
    title: "Fire System Products Supply & Trading",
    slug: "fire-system-products-supply",
    summary:
      "Genuine certified firefighting equipment, alarm panels, smoke detectors, landing valves, and fire hoses.",
    icon: "supply",
  },
];

export default async function HomePage() {
  let liveServices: PublicService[] = [];
  let liveProjects: PublicProject[] = [];
  let livePosts: PublicPost[] = [];

  try {
    await connectDB();
    const [services, projects, posts] = await Promise.all([
      Service.find({ status: "published" }).sort({ order: 1, title: 1 }).lean(),
      Project.find({ publishStatus: "published" }).sort({ featured: -1, createdAt: -1 }).limit(6).lean(),
      Post.find({ status: "published" }).sort({ publishedAt: -1, createdAt: -1 }).limit(3).lean(),
    ]);

    liveServices = (services as unknown as PublicService[]) || [];
    liveProjects = (projects as unknown as PublicProject[]) || [];
    livePosts = (posts as unknown as PublicPost[]) || [];
  } catch {
    // Database fallback
  }

  const displayServices = liveServices.length > 0 ? liveServices : DEFAULT_SERVICES;

  // Structured Data
  const jsonLdLocalBusiness = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Lock Shield Firefighting & Safety Equipment Installation LLC",
    description: "Civil Defence approved fire protection systems: design, installation, testing and annual maintenance across the UAE.",
    url: "https://lockshield.ae/",
    telephone: "+971 4 272 7333",
    email: "info@lockshield.ae",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Al Qusais Industrial Area",
      addressLocality: "Dubai",
      addressCountry: "AE",
    },
    areaServed: "AE",
    openingHours: "Mo-Su 00:00-24:00",
  };

  const jsonLdFAQ = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdLocalBusiness) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFAQ) }}
      />

      {/* 1. Hero with animated slide transitions */}
      <HeroSlider />

      {/* 2. Core Services Section */}
      <section className="py-20 sm:py-28 bg-[#f7f8fa] blueprint-grid relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <span className="font-tech text-xs sm:text-sm font-bold uppercase tracking-widest text-[#e01b24]">
                Complete Protection
              </span>
              <h2 className="font-tech text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight text-gray-900 mt-2">
                Our Core <span className="text-[#e01b24]">Fire Safety</span> Services
              </h2>
            </div>
            <Link
              href="/services"
              className="btn-pill inline-flex items-center gap-2 bg-white border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-800 hover:border-[#e01b24] hover:text-[#e01b24] shadow-xs transition-colors self-start md:self-auto"
            >
              <span>View All Services</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayServices.map((service, idx) => (
              <Link
                key={service.slug || idx}
                href={`/services/${service.slug}`}
                className="group relative flex flex-col justify-between rounded-3xl border border-gray-200 bg-white p-8 hover:border-[#e01b24] hover:shadow-xl transition-all duration-300"
              >
                <div>
                  <div className="size-14 rounded-2xl bg-[#e01b24]/10 text-[#e01b24] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#e01b24] group-hover:text-white transition-all">
                    <Flame className="size-7" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 font-tech uppercase tracking-wide group-hover:text-[#e01b24] transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                    {service.summary || "Complete engineering design, testing and certified installation compliant with Dubai Civil Defence."}
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-500 group-hover:text-[#e01b24]">
                  <span>Explore Service Details</span>
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Value Pillars & Statistics Counter */}
      <section className="py-20 bg-[#0d1220] text-white relative overflow-hidden">
        <div className="blueprint-grid-dark absolute inset-0 opacity-20 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="font-tech text-xs sm:text-sm font-bold uppercase tracking-widest text-[#e01b24]">
              Proven Track Record
            </span>
            <h2 className="font-tech text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight text-white mt-2">
              Why Dubai Trusts <span className="text-[#e01b24]">Lock Shield</span>
            </h2>
            <p className="text-gray-400 text-sm sm:text-base mt-4 font-light">
              From commercial high-rises and government offices to industrial warehouses, we deliver
              uncompromising safety systems compliant with NFPA standards and UAE Civil Defence.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xs">
              <p className="font-tech text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#e01b24]">
                15+
              </p>
              <h4 className="font-semibold text-white mt-2 text-sm sm:text-base">Years in UAE</h4>
              <p className="text-xs text-gray-400 mt-1">Dedicated fire engineering</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xs">
              <p className="font-tech text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#e01b24]">
                1000+
              </p>
              <h4 className="font-semibold text-white mt-2 text-sm sm:text-base">Projects Delivered</h4>
              <p className="text-xs text-gray-400 mt-1">Across all 7 emirates</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xs">
              <p className="font-tech text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#e01b24]">
                24/7
              </p>
              <h4 className="font-semibold text-white mt-2 text-sm sm:text-base">Emergency Support</h4>
              <p className="text-xs text-gray-400 mt-1">Rapid response technicians</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xs">
              <p className="font-tech text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#e01b24]">
                100%
              </p>
              <h4 className="font-semibold text-white mt-2 text-sm sm:text-base">Approval Guarantee</h4>
              <p className="text-xs text-gray-400 mt-1">Civil Defence certification</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Featured Projects Section */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <span className="font-tech text-xs sm:text-sm font-bold uppercase tracking-widest text-[#e01b24]">
                Our Portfolio
              </span>
              <h2 className="font-tech text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight text-gray-900 mt-2">
                Featured <span className="text-[#e01b24]">Projects</span> & Fit-Outs
              </h2>
            </div>
            <Link
              href="/projects"
              className="btn-pill inline-flex items-center gap-2 bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-[#e01b24] shadow-xs transition-colors self-start md:self-auto"
            >
              <span>View All Projects</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(liveProjects.length > 0
              ? liveProjects
              : [
                  {
                    title: "Al Manara Pharmacy Fit-out",
                    client: "Al Manara Pharmacy",
                    sector: "Healthcare",
                    emirate: "Dubai",
                    slug: "al-manara-pharmacy",
                    image: { url: "/assets/images/commercial.webp" },
                  },
                  {
                    title: "Emirates NBD Corporate Facility",
                    client: "Emirates NBD",
                    sector: "Banking",
                    emirate: "Dubai",
                    slug: "emirates-nbd",
                    image: { url: "/assets/images/about-img1.webp" },
                  },
                  {
                    title: "Farsi Restaurant Suppression",
                    client: "Farsi Restaurant",
                    sector: "Hospitality & F&B",
                    emirate: "Dubai",
                    slug: "farsi-restaurant",
                    image: { url: "/assets/images/restaurants.webp" },
                  },
                ]
            ).map((project, idx) => (
              <Link
                key={project.slug || idx}
                href={`/projects/${project.slug}`}
                className="group relative rounded-3xl overflow-hidden border border-gray-100 bg-gray-50 shadow-sm hover:shadow-xl transition-all"
              >
                <div className="aspect-[16/10] bg-gray-200 overflow-hidden relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={project.coverImage?.url || project.image?.url || "/assets/images/commercial.webp"}
                    alt={project.title}
                    className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-xs text-gray-900 text-xs font-semibold px-3 py-1 rounded-full shadow-xs">
                    {project.sector || "Commercial"}
                  </div>
                </div>
                <div className="p-6">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {project.emirate || "Dubai"} · {project.client || "Client Job"}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 font-tech uppercase tracking-wide mt-1 group-hover:text-[#e01b24] transition-colors">
                    {project.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Safety Blog & Guides Section */}
      {livePosts.length > 0 && (
        <section className="py-20 bg-[#f7f8fa] border-t border-gray-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <span className="font-tech text-xs sm:text-sm font-bold uppercase tracking-widest text-[#e01b24]">
                  Knowledge Center
                </span>
                <h2 className="font-tech text-3xl sm:text-4xl font-bold uppercase tracking-tight text-gray-900 mt-2">
                  Latest Fire Safety <span className="text-[#e01b24]">Insights</span>
                </h2>
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#e01b24] hover:underline"
              >
                View all articles
                <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {livePosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-xs hover:shadow-md transition-all group"
                >
                  {post.coverImage?.url && (
                    <div className="aspect-[16/9] overflow-hidden bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.coverImage.url}
                        alt={post.title}
                        className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <span className="text-xs text-gray-400">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString("en-AE", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Recent Post"}
                    </span>
                    <h3 className="text-base font-bold text-gray-900 mt-1 line-clamp-2 group-hover:text-[#e01b24] transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">{post.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. FAQ Section */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="font-tech text-xs sm:text-sm font-bold uppercase tracking-widest text-[#e01b24]">
              Got Questions?
            </span>
            <h2 className="font-tech text-3xl sm:text-4xl font-bold uppercase tracking-tight text-gray-900 mt-2">
              Frequently Asked <span className="text-[#e01b24]">Questions</span>
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Learn more about Civil Defence guidelines, AMC requirements, and suppression systems.
            </p>
          </div>

          <FAQAccordion items={FAQS} />
        </div>
      </section>

      {/* 7. Quick Quote Consultation Section */}
      <section className="py-20 bg-[#0d1220] relative">
        <div className="blueprint-grid-dark absolute inset-0 opacity-20 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6 text-white">
              <span className="font-tech text-xs sm:text-sm font-bold uppercase tracking-widest text-[#e01b24]">
                Schedule a Site Inspection
              </span>
              <h2 className="font-tech text-3xl sm:text-5xl font-bold uppercase tracking-tight text-white leading-tight">
                Secure Your Facility <br />
                <span className="text-[#e01b24]">Get A Quote Today</span>
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-light">
                Our certified fire engineers will visit your premises anywhere in Dubai or the UAE,
                assess compliance needs, and provide a competitive quote with zero obligation.
              </p>

              <div className="space-y-3 pt-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="size-5 text-emerald-400" />
                  <span className="text-sm text-gray-200">Full Dubai Civil Defence compliance review</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="size-5 text-emerald-400" />
                  <span className="text-sm text-gray-200">24/7 dedicated engineering helpline</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="size-5 text-emerald-400" />
                  <span className="text-sm text-gray-200">Fast turnaround on approval submissions</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <QuickQuoteForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
