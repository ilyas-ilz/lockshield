import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Job } from "@/models";
import { PageHero } from "@/components/frontend/PageHero";
import { Section } from "@/components/frontend/Section";
import { Reveal } from "@/components/frontend/Reveal";
import { CareerJobList, type JobOpening } from "./career-client";

// Content is editable from the admin, so pages must not be frozen at build
// time. Revalidate every 5 minutes.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Careers & Job Openings | Lock Shield Fire Protection UAE",
  description:
    "Join our certified fire engineering team in Dubai. Explore current openings for fire protection engineers, estimation specialists, and technicians.",
};

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

const PERKS = [
  "Certified training & professional development",
  "Work on prestigious landmark projects in UAE",
  "Competitive compensation & healthcare benefits",
  "Supportive engineering culture with safety first",
];

export default async function CareerPage() {
  let liveJobs: JobOpening[] = [];
  try {
    await connectDB();
    const found = await Job.find({ status: "published" }).lean();
    liveJobs = (found as unknown as JobOpening[]) || [];
  } catch {
    // DB error fallback
    void 0;
  }

  const items = liveJobs.length > 0 ? liveJobs : DEFAULT_JOBS;

  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Careers" }]}
        title="Join Our"
        accent="Engineering Team"
        description="We are always seeking passionate, certified professionals dedicated to life safety and engineering excellence across the UAE."
      />

      <Section className="blueprint-grid bg-paper-soft">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <h2 className="font-tech mb-6 text-xl font-bold uppercase tracking-tight text-navy-900 sm:text-3xl">
              Current Opportunities ({items.length})
            </h2>
            <CareerJobList jobs={items} />
          </div>

          <div className="lg:col-span-4">
            <Reveal className="lg:sticky lg:top-28">
              <div className="space-y-4 rounded-3xl border border-[var(--marketing-line)] bg-white p-6 sm:p-8">
                <h3 className="font-tech text-base font-bold uppercase tracking-wide text-navy-900 sm:text-lg">
                  Why Work at Lock Shield?
                </h3>
                <ul className="space-y-3 text-sm leading-relaxed text-ink/65">
                  {PERKS.map((perk) => (
                    <li key={perk} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>
    </>
  );
}
