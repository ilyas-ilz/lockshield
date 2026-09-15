import type { Metadata } from "next";
import { MapPin, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Job } from "@/models";

// Content is editable from the admin, so pages must not be frozen at build
// time. Revalidate every 5 minutes.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Careers & Job Openings | Lock Shield Fire Protection UAE",
  description:
    "Join our certified fire engineering team in Dubai. Explore current openings for fire protection engineers, estimation specialists, and technicians.",
};

interface JobOpening {
  _id?: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  description: unknown;
  requirements?: string[];
}

const DEFAULT_JOBS: JobOpening[] = [
  {
    title: "Senior Fire Fighting & Sprinkler Engineer",
    department: "Engineering & Design",
    location: "Dubai, UAE",
    employmentType: "Full-time",
    description:
      "Responsible for hydraulic calculations, AutoCAD drawing preparation, and Civil Defence liaison for major commercial & residential developments.",
    requirements: [
      "B.Tech / B.E in Mechanical Engineering",
      "Minimum 5 years UAE experience in fire protection systems",
      "Valid UAE Driving License and Civil Defence card preferred",
    ],
  },
  {
    title: "Fire Alarm Testing & Commissioning Technician",
    department: "Field Operations & AMC",
    location: "Dubai & Sharjah, UAE",
    employmentType: "Full-time",
    description:
      "Routine quarterly maintenance, fault diagnosis, and commissioning of conventional and addressable fire alarm systems.",
    requirements: [
      "Diploma in Electrical / Electronics Engineering",
      "Minimum 3 years hands-on experience in UAE with major panel brands",
      "Strong troubleshooting and customer communication skills",
    ],
  },
  {
    title: "Kitchen Fire Suppression Specialist",
    department: "Special Systems Division",
    location: "Dubai, UAE",
    employmentType: "Full-time",
    description:
      "Installation, semi-annual inspection, and hydrostatic testing of wet chemical restaurant kitchen hood suppression systems.",
    requirements: [
      "Certification in UL-300 kitchen suppression systems (Ansul, Buckeye, or equivalent)",
      "UAE experience with restaurant and hotel kitchen fit-outs",
    ],
  },
];

export default async function CareerPage() {
  let liveJobs: JobOpening[] = [];
  try {
    await connectDB();
    const found = await Job.find({ status: "published" }).lean();
    liveJobs = (found as unknown as JobOpening[]) || [];
  } catch {
    // DB error fallback
  }

  const items = liveJobs.length > 0 ? liveJobs : DEFAULT_JOBS;

  return (
    <>
      <section className="pt-36 pb-16 bg-[#0d1220] text-white relative overflow-hidden">
        <div className="blueprint-grid-dark absolute inset-0 opacity-20 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <span className="font-tech text-xs sm:text-sm font-bold uppercase tracking-widest text-[#e01b24]">
            Build Your Career
          </span>
          <h1 className="font-tech text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-white mt-2">
            Join Our <span className="text-[#e01b24]">Engineering</span> Team
          </h1>
          <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto mt-4 font-light">
            We are always seeking passionate, certified professionals dedicated to life safety and
            engineering excellence across the UAE.
          </p>
        </div>
      </section>

      <section className="py-20 sm:py-28 bg-[#f7f8fa] blueprint-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-6">
              <h2 className="font-tech text-2xl sm:text-3xl font-bold uppercase tracking-tight text-gray-900 mb-6">
                Current Opportunities ({items.length})
              </h2>

              <div className="space-y-6">
                {items.map((job, idx) => (
                  <div
                    key={job._id ? String(job._id) : idx}
                    className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-xs hover:border-[#e01b24] hover:shadow-md transition-all"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <span className="text-xs font-bold text-[#e01b24] uppercase tracking-wider">
                          {job.department}
                        </span>
                        <h3 className="font-tech text-xl sm:text-2xl font-bold uppercase text-gray-900 mt-1">
                          {job.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-full font-medium">
                          <MapPin className="size-3.5 text-[#e01b24]" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-full font-medium">
                          <Clock className="size-3.5 text-blue-500" />
                          {job.employmentType}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mt-4 leading-relaxed">
                      {typeof job.description === "string" ? job.description : "Position details available upon enquiry."}
                    </p>

                    {job.requirements && job.requirements.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                        <h4 className="text-xs font-bold uppercase text-gray-700">Key Requirements:</h4>
                        <ul className="space-y-1.5">
                          {job.requirements.map((req: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                              <CheckCircle2 className="size-3.5 text-[#e01b24] shrink-0 mt-0.5" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Email CV to: <strong className="text-gray-800">careers@lockshield.ae</strong>
                      </span>
                      <a
                        href={`mailto:careers@lockshield.ae?subject=Application:%20${encodeURIComponent(job.title)}`}
                        className="btn-pill inline-flex items-center gap-1.5 bg-[#e01b24] px-5 py-2 text-xs font-semibold text-white hover:bg-[#b3121a] transition-all"
                      >
                        <span>Apply via Email</span>
                        <ArrowRight className="size-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="sticky top-28 space-y-6">
                <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 space-y-4">
                  <h3 className="font-tech text-lg font-bold uppercase tracking-wide text-gray-900">
                    Why Work at Lock Shield?
                  </h3>
                  <ul className="space-y-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Certified training &amp; professional development</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Work on prestigious landmark projects in UAE</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Competitive compensation &amp; healthcare benefits</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Supportive engineering culture with safety first</span>
                    </li>
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
