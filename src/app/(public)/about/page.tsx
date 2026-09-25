import type { Metadata } from "next";
import Image from "next/image";
import { ShieldCheck, Target, Eye, Download } from "lucide-react";
import { PageHero } from "@/components/frontend/PageHero";
import { Section } from "@/components/frontend/Section";
import { Reveal } from "@/components/frontend/Reveal";
import { ButtonLink } from "@/components/frontend/Button";

// Content is editable from the admin, so pages must not be frozen at build
// time. Revalidate every 5 minutes.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "About Us | Civil Defence Approved Fire Protection",
  description:
    "Learn about Lock Shield Firefighting & Safety Equipment Installation LLC — UAE's trusted partner for Civil Defence approved fire protection systems.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "About Us" }]}
        title="About"
        accent="Lock Shield"
        description="Engineering safety and preserving lives across Dubai and the UAE with world-class fire protection, detection, and suppression systems."
      />

      {/* Overview & Credentials */}
      <Section className="bg-white">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <Reveal className="space-y-5 sm:space-y-6 lg:col-span-6">
            <span className="eyebrow">Trusted UAE Fire Protection</span>
            <h2 className="font-tech text-[clamp(1.6rem,4.5vw,2.5rem)] font-bold uppercase leading-tight tracking-tight text-navy-900">
              Protecting People, Properties &amp; <br />
              <span className="text-brand-500">Business Continuity</span>
            </h2>
            <p className="text-sm leading-relaxed text-ink/65 sm:text-base">
              Lock Shield Firefighting &amp; Safety Equipment Installation LLC is an officially
              approved and certified fire protection contracting firm licensed by Dubai Civil
              Defence (DCD). With over 5 years of hands-on engineering excellence, we specialize
              in turn-key fire protection solutions: design, drawing approval, supply,
              installation, testing, commissioning, and round-the-clock Annual Maintenance
              Contracts (AMC).
            </p>
            <p className="text-sm leading-relaxed text-ink/65 sm:text-base">
              Whether you operate a commercial office, industrial warehouse, luxury retail space,
              or residential complex, our engineers ensure your systems comply with both UAE Fire
              &amp; Life Safety Codes and international NFPA standards.
            </p>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
              {/* `download`, not target="_blank": the label says Download, so
                  the click should save the file rather than open a tab. */}
              <ButtonLink href="/assets/images/company-profile.pdf" download variant="red" arrow={false}>
                <Download className="size-4 shrink-0" />
                <span>Download Company Profile (PDF)</span>
              </ButtonLink>
              <ButtonLink href="/contact" variant="darkGhost">
                Contact Our Team
              </ButtonLink>
            </div>
          </Reveal>

          <Reveal delayMs={100} className="lg:col-span-6">
            <div className="relative overflow-hidden rounded-3xl border border-[var(--marketing-line)] bg-gray-100 shadow-2xl">
              <div className="relative aspect-[4/3]">
                <Image
                  src="/assets/images/about-team-fire-extinguisher.webp"
                  alt="Lock Shield Engineering Team"
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/10 bg-ink/90 p-4 text-white backdrop-blur-md sm:inset-x-6 sm:bottom-6 sm:p-5">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="size-7 shrink-0 text-brand-500 sm:size-8" />
                  <div>
                    <h4 className="font-tech text-sm font-bold uppercase tracking-wide sm:text-base">
                      Dubai Civil Defence Approved
                    </h4>
                    <p className="text-xs text-gray-300">License No: 65123 · Fully Certified Engineers &amp; Technicians</p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Mission & Vision */}
      <Section className="blueprint-grid bg-paper-soft">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          <Reveal className="rounded-3xl border border-[var(--marketing-line)] bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:p-10">
            <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500">
              <Target className="size-7" />
            </div>
            <h3 className="font-tech text-xl font-bold uppercase tracking-tight text-navy-900 sm:text-2xl">Our Mission</h3>
            <p className="mt-4 text-sm leading-relaxed text-ink/65 sm:text-base">
              To provide state-of-the-art life safety and fire protection solutions that
              safeguard lives and assets through uncompromising technical precision, high-grade
              certified products, and reliable preventative maintenance across the UAE.
            </p>
          </Reveal>

          <Reveal delayMs={100} className="rounded-3xl border border-[var(--marketing-line)] bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:p-10">
            <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600">
              <Eye className="size-7" />
            </div>
            <h3 className="font-tech text-xl font-bold uppercase tracking-tight text-navy-900 sm:text-2xl">Our Vision</h3>
            <p className="mt-4 text-sm leading-relaxed text-ink/65 sm:text-base">
              To be the undisputed leader and most trusted fire protection engineering company
              in the Middle East, recognized for rapid emergency responsiveness, compliance
              integrity, and groundbreaking safety innovations.
            </p>
          </Reveal>
        </div>
      </Section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-ink py-14 sm:py-20">
        <div className="blueprint-grid-dark pointer-events-none absolute inset-0 opacity-20" />
        <div className="wrap relative z-10">
          <Reveal className="flex flex-col items-center gap-6 rounded-[26px] p-8 text-center sm:gap-8 sm:p-12">
            <h2 className="font-tech text-[clamp(1.5rem,4.5vw,2.5rem)] font-bold uppercase leading-tight tracking-tight text-white">
              Need fire protection solutions for your building?
            </h2>
            <ButtonLink href="/contact" variant="red">
              Get a Free Quote
            </ButtonLink>
          </Reveal>
        </div>
      </section>
    </>
  );
}
