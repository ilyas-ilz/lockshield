"use client";

import * as React from "react";
import Link from "next/link";
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

/** FAQ + testimonials. Desktop: a sticky left rail (FAQ intro on top,
 * testimonial carousel under it) stays pinned below the floating header
 * while the numbered FAQ list on the right scrolls past it. Phones: plain
 * stack - intro, FAQ list, then testimonials - via `contents` + `order`,
 * so the questions sit directly under their heading. */
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
      <div className="wrap flex flex-col gap-10 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start lg:gap-16">
        {/* Left rail. `contents` on phones lets its two children interleave
            with the FAQ list via `order`; from lg it becomes one block that
            sticks under the floating header. Sticky only on viewports tall
            enough to show the whole rail (~640px) - on short laptops a
            pinned rail taller than the screen would cut off the testimonial
            card, so it scrolls normally there instead.
            [clip-path:none]! on each Reveal: the global `.reveal.in` rounds
            its box with a 24px clip, which shaved the corners off the FAQ
            cards and the first glyph of a wrapped last line. */}
        <div className="contents lg:block lg:top-[calc(var(--header-h)+1.5rem)] lg:[@media(min-height:760px)]:sticky">
          <Reveal className="order-1 [clip-path:none]!">
            <span className="eyebrow">FAQs</span>
            <h2 className="font-tech mt-2 text-[clamp(1.5rem,4.5vw,2.2rem)] font-bold uppercase leading-tight tracking-tight text-navy-900">
              Your questions,
              <br />
              <span className="text-brand-500">answered.</span>
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-ink/70 sm:text-base">
              Straight answers on Civil Defence compliance, maintenance contracts and suppression systems. Can&apos;t
              find yours?{" "}
              <Link
                href="/contact"
                className="font-semibold text-brand-500 underline-offset-4 transition-colors hover:text-brand-600 hover:underline"
              >
                Ask our engineers
              </Link>
              .
            </p>
          </Reveal>

          <Reveal delayMs={100} className="order-3 [clip-path:none]! lg:mt-10">
            <span className="eyebrow">Testimonials</span>
            <h3 className="font-tech mt-2 text-lg font-bold uppercase tracking-tight text-navy-900">
              What our clients say
            </h3>

            <div
              className="relative mt-4 flex flex-col touch-pan-y"
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
              {/* Stacked grid sizes to the tallest quote, so rotating between
                  short/long quotes never moves the controls or resizes the
                  sticky rail. */}
              <div className="relative grid min-h-[300px] sm:min-h-[260px]">
                {TESTIMONIALS.map((t, i) => (
                  <div
                    key={t.company}
                    className="col-start-1 row-start-1 flex flex-col rounded-2xl border border-[var(--marketing-line)] bg-white p-6 transition-[opacity,transform] duration-500 sm:p-7"
                    style={{
                      opacity: i === active ? 1 : 0,
                      transform: i === active ? "none" : "translateY(10px) scale(0.985)",
                      pointerEvents: i === active ? "auto" : "none",
                    }}
                    aria-hidden={i !== active}
                  >
                    <span className="font-serif text-5xl leading-none text-brand-500">&ldquo;</span>
                    <p className="mt-1 text-sm leading-relaxed text-ink/78 sm:text-base">{t.quote}</p>
                    <div className="mt-4 flex gap-0.5 text-brand-500" aria-hidden>
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} className="size-3.5 fill-current" />
                      ))}
                    </div>
                    {/* mt-auto: pins the attribution to the bottom of the
                        tallest-quote height so short quotes don't leave the
                        avatar floating mid-card. */}
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

              {/* ‹ dots › sit inside the card's top-right corner, level with
                  the quote mark, so the card is the last thing in the rail:
                  when the sticky rail releases, its bottom edge lands on the
                  same line as the last FAQ card. Dots stay small inside 44px
                  tap targets. */}
              <div className="absolute right-3 top-3 z-10 flex items-center sm:right-4 sm:top-4">
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
                    className="group flex h-11 cursor-pointer items-center justify-center px-1.5"
                  >
                    <span
                      className={`block h-2 rounded-full transition-all ${
                        i === active ? "w-6 bg-brand-500" : "w-2 bg-ink/15 group-hover:bg-ink/30"
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
            </div>
          </Reveal>
        </div>

        {/* FAQ list - the tall column that scrolls past the pinned rail */}
        <Reveal delayMs={100} className="order-2 [clip-path:none]!">
          <FAQAccordion items={faqs} />
        </Reveal>
      </div>
    </section>
  );
}
