"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { Reveal } from "../Reveal";
import { FAQAccordion, type FAQItem } from "../FAQAccordion";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company: string;
  initials: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Lock Shield has been an exceptional partner in ensuring the fire safety of our facilities. Their team is highly professional and always delivers on time.",
    name: "Facilities Manager",
    role: "Facilities Manager",
    company: "Emirates Hospital, Dubai",
    initials: "FM",
  },
  {
    quote:
      "From design to Civil Defence approval, Lock Shield handled everything smoothly. Clear communication and certified work at every stage of our tower project.",
    name: "Project Manager",
    role: "Project Manager",
    company: "Burj Vista Residences, Dubai",
    initials: "PM",
  },
  {
    quote:
      "Our AMC with Lock Shield keeps every alarm panel and extinguisher compliant year-round. Their technicians are punctual and genuinely know the systems inside out.",
    name: "Operations Manager",
    role: "Operations Manager",
    company: "Logistics Warehouse Complex, Al Qusais",
    initials: "OM",
  },
  {
    quote:
      "Kitchen hood suppression installed across all 12 outlets without disrupting service. Professional crew, proper documentation, zero issues at inspection.",
    name: "F&B Group Director",
    role: "F&B Group Director",
    company: "Downtown Dubai",
    initials: "FB",
  },
];

/** Restores the legacy tf-grid section: testimonials carousel paired with
 * the FAQ, dropped as two separate concerns in the port (FAQ survived
 * alone; testimonials were removed entirely). */
export function TestimonialsFaqSection({ faqs }: { faqs: FAQItem[] }) {
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => setActive((i) => (i + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="blueprint-grid py-14 sm:py-20 lg:py-24">
      <div className="wrap grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Testimonials - centered vertically in its column so it doesn't
            look stranded at the top when the FAQ column runs taller */}
        <Reveal className="flex h-full flex-col justify-center">
          <span className="eyebrow">Testimonials</span>
          <h2 className="font-tech mt-2 text-[clamp(1.5rem,4.5vw,2.2rem)] font-bold uppercase leading-tight tracking-tight text-navy-900">
            What our clients say
          </h2>

          <div className="relative mt-6 grid">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={t.company}
                className="col-start-1 row-start-1 rounded-2xl border border-[var(--marketing-line)] bg-white p-6 transition-[opacity,transform] duration-500 sm:p-8"
                style={{
                  opacity: i === active ? 1 : 0,
                  transform: i === active ? "none" : "translateY(10px) scale(0.985)",
                  pointerEvents: i === active ? "auto" : "none",
                }}
                aria-hidden={i !== active}
              >
                <span className="font-serif text-5xl leading-none text-brand-500">&ldquo;</span>
                <p className="mt-2 text-sm leading-relaxed text-ink/78 sm:text-base">{t.quote}</p>
                <div className="mt-4 flex gap-0.5 text-brand-500" aria-hidden>
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="size-3.5 fill-current" />
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
                    {t.initials}
                  </span>
                  <span>
                    <b className="block text-sm text-navy-900">{t.role}</b>
                    <small className="text-xs text-ink/55">{t.company}</small>
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex gap-2">
            {TESTIMONIALS.map((t, i) => (
              <button
                key={t.company}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show testimonial ${i + 1}`}
                className={`h-2 rounded-full transition-all ${i === active ? "w-7 bg-brand-500" : "w-2 bg-ink/15 hover:bg-ink/30"}`}
              />
            ))}
          </div>
        </Reveal>

        {/* FAQ */}
        <Reveal delayMs={100}>
          <span className="eyebrow">FAQs</span>
          <h2 className="font-tech mt-2 text-[clamp(1.5rem,4.5vw,2.2rem)] font-bold uppercase leading-tight tracking-tight text-navy-900">
            Quick answers
          </h2>
          <div className="mt-6">
            <FAQAccordion items={faqs} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
