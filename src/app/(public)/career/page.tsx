import type { Metadata } from "next";
import { CheckCircle2, Briefcase } from "lucide-react";
import { getOpenJobs, type JobOpening } from "@/lib/jobs";
import { logger } from "@/lib/logger";
import { PageHero } from "@/components/frontend/PageHero";
import { Section } from "@/components/frontend/Section";
import { Reveal } from "@/components/frontend/Reveal";
import { CareerJobList, OpenApplication } from "./career-client";

// Content is editable from the admin, so pages must not be frozen at build
// time. Revalidate every 5 minutes.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Careers & Job Openings | Lock Shield Fire Protection UAE",
  description:
    "Join our certified fire engineering team in Dubai. Explore current openings for fire protection engineers, estimation specialists, and technicians.",
};

const PERKS = [
  "Certified training & professional development",
  "Work on prestigious landmark projects in UAE",
  "Competitive compensation & healthcare benefits",
  "Supportive engineering culture with safety first",
];

export default async function CareerPage() {
  // WHY no placeholder jobs: hardcoded example openings used to appear
  // whenever nothing was published (or the DB was down), so candidates
  // applied for roles that did not exist. Only real, open jobs are listed.
  let items: JobOpening[] = [];
  try {
    items = await getOpenJobs();
  } catch (err) {
    logger.error("careers page: failed to load jobs", err);
  }

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
            {items.length > 0 ? (
              <CareerJobList jobs={items} />
            ) : (
              <div className="rounded-3xl border border-[var(--marketing-line)] bg-white p-6 text-center sm:p-10">
                <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500">
                  <Briefcase className="size-5" aria-hidden />
                </div>
                <h3 className="font-tech mt-4 text-lg font-bold uppercase text-navy-900 sm:text-xl">
                  No openings right now
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink/65">
                  We don&apos;t have any open positions at the moment, but we hire certified fire
                  protection engineers and technicians year-round. Send an open application and
                  we&apos;ll keep you on file.
                </p>
                <div className="mx-auto max-w-md text-left">
                  <OpenApplication />
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-4">
            <Reveal className="space-y-4 lg:sticky lg:top-28">
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

              {/* Second card: a candidate whose role isn't listed otherwise has
                  nowhere to go from this page. Hidden when there are no
                  openings, since the empty state already offers the form. */}
              {items.length > 0 && (
                <div className="rounded-3xl border border-brand-500/20 bg-brand-500/5 p-6 sm:p-8">
                  <h3 className="font-tech text-base font-bold uppercase tracking-wide text-navy-900 sm:text-lg">
                    Don&apos;t see your role?
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/65">
                    We take on certified fire protection engineers and technicians year-round. Send an
                    open application and we&apos;ll keep you on file for upcoming openings.
                  </p>
                  <OpenApplication />
                </div>
              )}
            </Reveal>
          </div>
        </div>
      </Section>
    </>
  );
}
