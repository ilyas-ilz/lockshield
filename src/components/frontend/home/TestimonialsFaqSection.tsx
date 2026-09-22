"use client";

import * as React from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
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
 * alone; testimonials were removed entirely). Strict 50/50 split inside one
 * `.wrap` container: both headings top-aligned, both columns ending on the
 * same baseline, and a single centered ‹ dots › control row that stays
 * within the column box so neither half overhangs the other. */
export function TestimonialsFaqSection({ faqs }: { faqs: FAQItem[] }) {
  const [active, setActive] = React.useState(0);
  const go = React.useCallback(
    (dir: 1 | -1) => setActive((i) => (i + dir + TESTIMONIALS.length) % TESTIMONIALS.length),
    []
  );

  const pauseRef = React.useRef(false);
  const touchX = React.useRef<number | null>(null);
  React.useEffect(() => {
    const timer = setInterval(() => {
      if (!pauseRef.current) setActive((i) => (i + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="section-y blueprint-grid">
      <div className="wrap grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
        {/* Testimonials - top-aligned with the FAQ heading so both 50%
            columns start on the same baseline */}
        <Reveal className="flex h-full flex-col">
          <span className="eyebrow">Testimonials</span>
          <h2 className="font-tech mt-2 text-[clamp(1.5rem,4.5vw,2.2rem)] font-bold uppercase leading-tight tracking-tight text-navy-900">
            What our clients say
          </h2>

          {/* flex-1 on both the wrapper and the stack: the FAQ column runs
              ~90px taller than a testimonial, and that slack has to go
              somewhere. Centering the card put it all above and below, so the
              card's top edge sat ~100px lower than the first FAQ row and the
              two halves still read as misaligned. Letting the card *grow*
              instead means card top = accordion top, card bottom = accordion
              bottom, controls below - a true 50/50. min-h keeps it from
              collapsing when the FAQ column is short (all rows closed). */}
          <div
            className="relative mt-6 flex flex-1 flex-col touch-pan-y"
            onMouseEnter={() => (pauseRef.current = true)}
            onMouseLeave={() => (pauseRef.current = false)}
            onTouchStart={(e) => {
              touchX.current = e.touches[0]?.clientX ?? null;
            }}
            onTouchEnd={(e) => {
              if (touchX.current == null) return;
              const dx = (e.changedTouches[0]?.clientX ?? 0) - touchX.current;
              if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
              touchX.current = null;
            }}
          >
            {/* Fixed floor stops the rotating quotes from shifting layout. */}
            <div className="relative grid flex-1 min-h-[340px] sm:min-h-[300px]">
              {TESTIMONIALS.map((t, i) => (
                <div
                  key={t.company}
                  className="col-start-1 row-start-1 flex flex-col rounded-2xl border border-[var(--marketing-line)] bg-white p-6 transition-[opacity,transform] duration-500 sm:p-8"
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
                  {/* mt-auto: the card now stretches to the FAQ column's
                      height, so the attribution pins to the bottom instead of
                      leaving a dead gap under it. */}
                  <div className="mt-auto flex items-center gap-3 pt-4">
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

          </div>

          {/* Controls row: ‹ dots ›. The steppers used to be absolutely
              positioned at left-0 / right-0 with a ±translate-x-1/2, which
              hung 22px of each 44px button outside the column box - so the
              card's left edge no longer lined up with the section gutter and
              its right edge pushed into the gap before the FAQ column. Laid
              out in this row instead, both columns keep the exact same width
              and x-position. Dots stay small inside 44px tap targets. */}
          <div className="mt-5 flex items-center justify-center gap-1">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous testimonial"
              className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[var(--marketing-line)] bg-white text-navy-900 transition-all hover:border-brand-500 hover:text-brand-500 active:scale-95"
            >
              <ChevronLeft className="size-5" />
            </button>

            {TESTIMONIALS.map((t, i) => (
              <button
                key={t.company}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show testimonial ${i + 1}`}
                className="group flex h-11 cursor-pointer items-center justify-center px-2"
              >
                <span
                  className={`block h-2 rounded-full transition-all ${
                    i === active ? "w-7 bg-brand-500" : "w-2 bg-ink/15 group-hover:bg-ink/30"
                  }`}
                />
              </button>
            ))}

            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next testimonial"
              className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[var(--marketing-line)] bg-white text-navy-900 transition-all hover:border-brand-500 hover:text-brand-500 active:scale-95"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </Reveal>

        {/* FAQ */}
        <Reveal delayMs={100} className="flex h-full flex-col">
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
